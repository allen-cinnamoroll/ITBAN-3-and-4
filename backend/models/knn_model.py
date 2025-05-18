import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import os

class DestinationKNNModel:
    def __init__(self, n_neighbors=5):
        self.knn = KNeighborsClassifier(n_neighbors=n_neighbors)
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.model_path = "models/destination_knn.pkl"
        
    def preprocess_data(self, data):
        # Convert categorical variables to numerical using label encoding
        for column in data.select_dtypes(include=['object']).columns:
            data[column] = self.label_encoder.fit_transform(data[column])
        return data
        
    def train(self, dataset_path):
        # Read the dataset
        df = pd.read_csv(dataset_path)
        
        # Identify feature columns (all columns except the target 'destination_name' column)
        self.feature_columns = [col for col in df.columns if col.lower() != 'destination_name']
        
        # Preprocess the data
        X = df[self.feature_columns]
        y = df['destination_name']
        
        # Preprocess features
        X = self.preprocess_data(X)
        
        # Scale the features
        X = self.scaler.fit_transform(X)
        
        # Encode the target variable
        y = self.label_encoder.fit_transform(y)
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train the model
        self.knn.fit(X_train, y_train)
        
        # Calculate accuracy
        accuracy = self.knn.score(X_test, y_test)
        
        # Save the model
        self.save_model()
        
        return accuracy
    
    def predict(self, input_data):
        # Convert input data to DataFrame if it's a dictionary
        if isinstance(input_data, dict):
            input_data = pd.DataFrame([input_data])
        
        # Ensure all feature columns are present
        for col in self.feature_columns:
            if col not in input_data.columns:
                raise ValueError(f"Missing feature column: {col}")
        
        # Preprocess the input data
        input_data = self.preprocess_data(input_data[self.feature_columns])
        
        # Scale the features
        input_data = self.scaler.transform(input_data)
        
        # Make prediction
        prediction = self.knn.predict(input_data)
        
        # Convert prediction back to original label
        return self.label_encoder.inverse_transform(prediction)[0]
    
    def save_model(self):
        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        # Save the model and preprocessors
        model_data = {
            'knn': self.knn,
            'label_encoder': self.label_encoder,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns
        }
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError("Model file not found. Please train the model first.")
            
        with open(self.model_path, 'rb') as f:
            model_data = pickle.load(f)
            
        self.knn = model_data['knn']
        self.label_encoder = model_data['label_encoder']
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns'] 