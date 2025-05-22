from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv
import logging
from models.random_forest_model import TravelRecommendationModel
from ml_routes import ml_bp
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(ml_bp)

# MongoDB connection
try:
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    logger.info(f"Attempting to connect to MongoDB at: {mongodb_uri}")
    client = MongoClient(mongodb_uri)
    # Test the connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB")
    
    db = client['travel_recommendations']
    destinations_collection = db['destinations']
    user_preferences_collection = db['user_preferences']
    ratings_collection = db['ratings']  # New collection for ratings
    
    # Test collection access
    user_preferences_collection.find_one()
    ratings_collection.find_one()
    logger.info("Successfully accessed collections")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise

# Global variables for models and data
df = None
model = None

# Load and preprocess data
def load_data():
    try:
        df = pd.read_csv('dataset/Mati-City.csv')
        logger.info(f"Successfully loaded data with {len(df)} records")
        return df
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        raise

# Initialize model
def initialize_models():
    global df, model
    try:
        logger.info("Loading data and initializing model...")
        df = load_data()
        
        # Initialize Random Forest
        model = TravelRecommendationModel()
        if not os.path.exists('models/random_forest_model.joblib'):
            logger.info("Training new Random Forest model...")
            model.train(df)
            logger.info("Random Forest model training completed")
        else:
            logger.info("Loading existing Random Forest model...")
            model.load_model()
            logger.info("Random Forest model loaded successfully")
    except Exception as e:
        logger.error(f"Error during initialization: {str(e)}")
        raise

# Initialize models when the app starts
initialize_models()

@app.route('/api/recommendations', methods=['POST'])
def get_travel_recommendations():
    try:
        logger.info("Received recommendation request")
        user_preferences = request.json
        logger.debug(f"User preferences: {user_preferences}")
        
        # Validate required fields
        required_fields = ['destination_type', 'travel_purpose', 'travel_season', 'budget']
        for field in required_fields:
            if field not in user_preferences:
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get predictive recommendations
        predictive_recommendations = model.predict(user_preferences, df)
        
        # Log the recommendations for debugging
        logger.debug("Predictive recommendations:")
        for rec in predictive_recommendations:
            logger.debug(f"  - {rec}")
        
        # Ensure all recommendations have a destination field and include packing tips
        predictive_recommendations = []
        for rec in model.predict(user_preferences, df):
            destination = rec.get('destination', rec.get('Destination', 'Unknown Destination'))
            # Get packing tips from the dataset with exact matching
            dest_data = df[df['Destination'].str.strip() == destination.strip()]
            if dest_data.empty:
                # Try case-insensitive matching if exact match fails
                dest_data = df[df['Destination'].str.strip().str.lower() == destination.strip().lower()]
            
            packing_tips = dest_data['Packing Tips'].iloc[0] if not dest_data.empty else 'No packing tips available for this destination'
            
            logger.debug(f"Destination: {destination}")
            logger.debug(f"Found matching data: {not dest_data.empty}")
            logger.debug(f"Packing tips: {packing_tips}")
            
            predictive_recommendations.append({
                **rec,
                'destination': destination,
                'packing_tips': packing_tips
            })
        
        logger.debug("Final recommendations with packing tips:")
        for rec in predictive_recommendations:
            logger.debug(f"  - {rec}")
        
        # Save user preferences and recommendations to MongoDB
        try:
            user_preference_doc = {
                'budget': float(user_preferences['budget']),
                'destination_type': user_preferences['destination_type'],
                'travel_season': user_preferences['travel_season'],
                'travel_purpose': user_preferences['travel_purpose'],
                'municipality': user_preferences.get('municipality', ''),
                'group_type': user_preferences.get('group_type', ''),
                'number_of_people': int(user_preferences.get('number_of_people', 1)),
                'trip_duration': int(user_preferences.get('trip_duration', 1)),
                'recommendations': predictive_recommendations,
                'created_at': datetime.utcnow()
            }
            
            logger.debug(f"Attempting to save document: {user_preference_doc}")
            result = user_preferences_collection.insert_one(user_preference_doc)
            logger.info(f"Successfully saved user preferences with ID: {result.inserted_id}")
            
            # Verify the save
            saved_doc = user_preferences_collection.find_one({'_id': result.inserted_id})
            if saved_doc:
                logger.info("Verified document was saved successfully")
            else:
                logger.error("Document was not found after saving")
                
        except Exception as e:
            logger.error(f"Error saving to MongoDB: {str(e)}")
            logger.error(f"Document that failed to save: {user_preference_doc}")
            # Continue with the response even if saving fails
        
        if not predictive_recommendations:
            logger.info("No recommendations found")
            return jsonify({
                'status': 'success',
                'message': 'No matches found. Please try different preferences.',
                'recommendations': {'predictive': predictive_recommendations}
            })
        
        logger.info(f"Returning recommendations: {predictive_recommendations}")
        return jsonify({
            'status': 'success',
            'recommendations': {'predictive': predictive_recommendations}
        })
    
    except Exception as e:
        logger.error(f"Error in get_travel_recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/destinations', methods=['GET'])
def get_all_destinations():
    try:
        logger.info("Received request for all destinations")
        destinations = df.to_dict('records')
        return jsonify({
            'status': 'success',
            'destinations': destinations
        })
    except Exception as e:
        logger.error(f"Error in get_all_destinations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_user_history():
    try:
        logger.info("Received request for user history")
        # Get the last 10 recommendations
        history = list(user_preferences_collection.find(
            {},
            {'_id': 0}  # Exclude MongoDB _id field
        ).sort('created_at', -1).limit(10))
        
        logger.info(f"Found {len(history)} history records")
        return jsonify({
            'status': 'success',
            'history': history
        })
    except Exception as e:
        logger.error(f"Error in get_user_history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ratings', methods=['POST'])
def submit_rating():
    try:
        logger.info("Received rating submission")
        rating_data = request.json
        logger.debug(f"Rating data: {rating_data}")
        
        # Validate required fields
        required_fields = ['system_satisfaction_score', 'analytics_satisfaction_score']
        for field in required_fields:
            if field not in rating_data:
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Save rating to MongoDB
        try:
            rating_doc = {
                'system_satisfaction_score': float(rating_data['system_satisfaction_score']),
                'analytics_satisfaction_score': float(rating_data['analytics_satisfaction_score']),
                'created_at': datetime.utcnow()
            }
            
            logger.debug(f"Attempting to save rating: {rating_doc}")
            result = ratings_collection.insert_one(rating_doc)
            logger.info(f"Successfully saved rating with ID: {result.inserted_id}")
            
            return jsonify({
                'status': 'success',
                'message': 'Rating saved successfully'
            })
            
        except Exception as e:
            logger.error(f"Error saving rating to MongoDB: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to save rating'
            }), 500
            
    except Exception as e:
        logger.error(f"Error in submit_rating: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ratings', methods=['GET'])
def get_ratings():
    try:
        logger.info("Received request for ratings")
        # Get all ratings
        ratings = list(ratings_collection.find(
            {},
            {'_id': 0}  # Exclude MongoDB _id field
        ).sort('created_at', -1))
        
        # Calculate average ratings
        if ratings:
            avg_system = sum(r['system_satisfaction_score'] for r in ratings) / len(ratings)
            avg_analytics = sum(r['analytics_satisfaction_score'] for r in ratings) / len(ratings)
        else:
            avg_system = 0
            avg_analytics = 0
        
        logger.info(f"Found {len(ratings)} ratings")
        return jsonify({
            'status': 'success',
            'ratings': ratings,
            'averages': {
                'system_satisfaction_score': round(avg_system, 2),
                'analytics_satisfaction_score': round(avg_analytics, 2)
            }
        })
    except Exception as e:
        logger.error(f"Error in get_ratings: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/top-destinations', methods=['GET'])
def get_top_destinations():
    try:
        logger.info("Received request for top destinations")
        
        # Aggregate recommendations to count occurrences of each destination
        pipeline = [
            # Unwind the recommendations array to get individual recommendations
            {"$unwind": "$recommendations"},
            # Group by destination and count occurrences
            {"$group": {
                "_id": "$recommendations.destination",
                "recommendations": {"$sum": 1}
            }},
            # Sort by count in descending order
            {"$sort": {"recommendations": -1}},
            # Limit to top 5
            {"$limit": 5},
            # Project to match the expected format
            {"$project": {
                "name": "$_id",
                "recommendations": 1,
                "_id": 0
            }}
        ]
        
        top_destinations = list(user_preferences_collection.aggregate(pipeline))
        
        # If no data is found, return some default destinations
        if not top_destinations:
            top_destinations = [
                {"name": "Mati City", "recommendations": 150},
                {"name": "Cateel", "recommendations": 120},
                {"name": "Boston", "recommendations": 100},
                {"name": "Baganga", "recommendations": 80},
                {"name": "Caraga", "recommendations": 60}
            ]
        
        return jsonify({
            'status': 'success',
            'destinations': top_destinations
        })
    except Exception as e:
        logger.error(f"Error in get_top_destinations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/destination-types', methods=['GET'])
def get_destination_types_distribution():
    try:
        logger.info("Received request for destination types distribution")
        
        # Aggregate recommendations to count occurrences of each destination type
        pipeline = [
            # Unwind the recommendations array to get individual recommendations
            {"$unwind": "$recommendations"},
            # Group by destination type and count occurrences
            {"$group": {
                "_id": "$recommendations.destination_type",
                "count": {"$sum": 1}
            }},
            # Sort by count in descending order
            {"$sort": {"count": -1}},
            # Project to match the expected format
            {"$project": {
                "name": "$_id",
                "value": "$count",
                "_id": 0
            }}
        ]
        
        distribution = list(user_preferences_collection.aggregate(pipeline))
        
        # If no data is found, return some default distribution
        if not distribution:
            distribution = [
                {"name": "Beach", "value": 35},
                {"name": "Mountain", "value": 25},
                {"name": "Cultural", "value": 20},
                {"name": "Nature", "value": 15},
                {"name": "Island", "value": 5}
            ]
        
        return jsonify({
            'status': 'success',
            'distribution': distribution
        })
    except Exception as e:
        logger.error(f"Error in get_destination_types_distribution: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/travel-seasons', methods=['GET'])
def get_travel_seasons_distribution():
    try:
        logger.info("Received request for travel seasons distribution")
        
        # Aggregate recommendations to count occurrences of each travel season
        pipeline = [
            # Unwind the recommendations array to get individual recommendations
            {"$unwind": "$recommendations"},
            # Group by travel season and count occurrences
            {"$group": {
                "_id": "$recommendations.travel_season",
                "count": {"$sum": 1}
            }},
            # Sort by count in descending order
            {"$sort": {"count": -1}},
            # Project to match the expected format
            {"$project": {
                "name": "$_id",
                "value": "$count",
                "_id": 0
            }}
        ]
        
        distribution = list(user_preferences_collection.aggregate(pipeline))
        
        # If no data is found, return some default distribution
        if not distribution:
            distribution = [
                {"name": "Summer (March-May)", "value": 45},
                {"name": "Rainy (June-October)", "value": 25},
                {"name": "Holiday Season (November-February)", "value": 30}
            ]
        
        return jsonify({
            'status': 'success',
            'distribution': distribution
        })
    except Exception as e:
        logger.error(f"Error in get_travel_seasons_distribution: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/municipalities', methods=['GET'])
def get_municipalities_distribution():
    try:
        logger.info("Received request for municipalities distribution")
        
        # Aggregate recommendations to count occurrences of each municipality
        pipeline = [
            # Unwind the recommendations array to get individual recommendations
            {"$unwind": "$recommendations"},
            # Group by municipality and count occurrences
            {"$group": {
                "_id": "$recommendations.municipality",
                "count": {"$sum": 1}
            }},
            # Sort by count in descending order
            {"$sort": {"count": -1}},
            # Project to match the expected format
            {"$project": {
                "name": "$_id",
                "value": "$count",
                "_id": 0
            }}
        ]
        
        distribution = list(user_preferences_collection.aggregate(pipeline))
        
        # If no data is found, return some default distribution
        if not distribution:
            distribution = [
                {"name": "Mati City", "value": 40},
                {"name": "Cateel", "value": 25},
                {"name": "Baganga", "value": 20},
                {"name": "Boston", "value": 15},
                {"name": "Caraga", "value": 10},
                {"name": "Manay", "value": 8},
                {"name": "Tarragona", "value": 7},
                {"name": "Banaybanay", "value": 6},
                {"name": "Lupon", "value": 5},
                {"name": "San Isidro", "value": 4},
                {"name": "Governor Generoso", "value": 3}
            ]
        
        return jsonify({
            'status': 'success',
            'distribution': distribution
        })
    except Exception as e:
        logger.error(f"Error in get_municipalities_distribution: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 