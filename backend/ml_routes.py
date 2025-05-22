from flask import Blueprint, request, jsonify
import joblib
import pandas as pd
from ml_model import predict_destination

ml_bp = Blueprint('ml', __name__)

# Load the saved model and encoders
try:
    model = joblib.load('random_forest_model.joblib')
    label_encoders = joblib.load('label_encoders.joblib')
    scaler = joblib.load('scaler.joblib')
except FileNotFoundError:
    print("Warning: Model files not found. Please train the model first.")
    model = None
    label_encoders = None
    scaler = None

@ml_bp.route('/api/predict', methods=['POST'])
def predict():
    if model is None or label_encoders is None or scaler is None:
        return jsonify({
            'status': 'error',
            'message': 'Model not trained yet. Please train the model first.'
        }), 500

    try:
        data = request.get_json()
        
        # Extract features from request
        input_data = {
            'Budget': float(data.get('budget', 0)),
            'Destination_Type': data.get('destination_type', ''),
            'Travel_Purpose': data.get('travel_purpose', ''),
            'Travel_Season': data.get('travel_season', ''),
            'Municipality': data.get('municipality', '')
        }

        # Make prediction
        prediction = predict_destination(model, label_encoders, scaler, input_data)

        # Get prediction probabilities
        input_df = pd.DataFrame([input_data])
        for column, encoder in label_encoders.items():
            input_df[column] = encoder.transform(input_df[column])
        input_df['Budget'] = scaler.transform(input_df[['Budget']])
        
        probabilities = model.predict_proba(input_df)[0]
        confidence_score = max(probabilities)

        return jsonify({
            'status': 'success',
            'prediction': {
                'destination': prediction,
                'confidence_score': float(confidence_score)
            }
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400 