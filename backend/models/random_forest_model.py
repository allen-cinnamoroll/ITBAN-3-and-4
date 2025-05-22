import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

class TravelRecommendationModel:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.feature_columns = ['Budget', 'Destination_Type', 'Travel_Purpose', 'Travel_season', 'Municipality']
        
    def preprocess_data(self, df):
        """Preprocess the data for training"""
        # Create label encoders for categorical features
        for column in ['Destination_Type', 'Travel_Purpose', 'Travel_season', 'Municipality']:
            self.label_encoders[column] = LabelEncoder()
            df[column] = self.label_encoders[column].fit_transform(df[column])
        
        # Convert Budget to numeric
        df['Budget'] = df['Budget'].str.replace(',', '').astype(float)
        
        return df
    
    def train(self, df):
        """Train the Random Forest model"""
        # Preprocess the data
        processed_df = self.preprocess_data(df.copy())
        
        # Prepare features and target
        X = processed_df[self.feature_columns]
        y = processed_df['Destination']
        
        # Initialize and train the model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X, y)
        
        # Save the model and encoders
        self.save_model()
        
    def predict(self, user_preferences, df):
        """Make predictions based on user preferences"""
        if self.model is None:
            self.load_model()
        
        # Preprocess user preferences
        input_data = pd.DataFrame([{
            'Budget': float(user_preferences['budget']),
            'Destination_Type': user_preferences['destination_type'],
            'Travel_Purpose': user_preferences['travel_purpose'],
            'Travel_season': user_preferences['travel_season'],
            'Municipality': user_preferences['municipality']
        }])
        
        # Transform categorical features
        for column in ['Destination_Type', 'Travel_Purpose', 'Travel_season', 'Municipality']:
            try:
                input_data[column] = self.label_encoders[column].transform([input_data[column].iloc[0]])[0]
            except ValueError as e:
                # If the value is not in the encoder's classes, use the most common class
                input_data[column] = 0
                print(f"Warning: {column} value not found in training data. Using default value.")
        
        # Get predictions
        predictions = self.model.predict_proba(input_data)
        
        # Get top 5 destinations
        top_indices = np.argsort(predictions[0])[-5:][::-1]
        top_destinations = self.model.classes_[top_indices]
        
        # Get full destination details
        recommendations = []
        for dest in top_destinations:
            dest_data = df[df['Destination'] == dest].iloc[0]
            recommendations.append({
                'destination': dest_data['Destination'],
                'Destination': dest_data['Destination'],
                'budget': dest_data['Budget'],
                'destination_type': dest_data['Destination_Type'],
                'travel_purpose': dest_data['Travel_Purpose'],
                'travel_season': dest_data['Travel_season'],
                'municipality': dest_data['Municipality'],
                'similarity_score': float(predictions[0][np.where(self.model.classes_ == dest)[0][0]])
            })
        
        return recommendations
    
    def save_model(self):
        """Save the model and encoders"""
        if not os.path.exists('models'):
            os.makedirs('models')
        
        joblib.dump(self.model, 'models/random_forest_model.joblib')
        joblib.dump(self.label_encoders, 'models/label_encoders.joblib')
    
    def load_model(self):
        """Load the saved model and encoders"""
        try:
            self.model = joblib.load('models/random_forest_model.joblib')
            self.label_encoders = joblib.load('models/label_encoders.joblib')
        except:
            raise Exception("Model not found. Please train the model first.") 