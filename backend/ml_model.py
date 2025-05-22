import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib

def preprocess_data(df):
    """
    Preprocess the dataset by encoding categorical variables and scaling numerical features
    """
    # Create copies of label encoders for each categorical column
    label_encoders = {}
    
    # Encode categorical variables
    categorical_columns = ['Destination_Type', 'Travel_Purpose', 'Travel_Season', 'Municipality']
    for column in categorical_columns:
        label_encoders[column] = LabelEncoder()
        df[column] = label_encoders[column].fit_transform(df[column])
    
    # Scale numerical features
    scaler = StandardScaler()
    df['Budget'] = scaler.fit_transform(df[['Budget']])
    
    return df, label_encoders, scaler

def train_model(df):
    """
    Train the Random Forest model
    """
    # Preprocess the data
    df_processed, label_encoders, scaler = preprocess_data(df)
    
    # Prepare features and target
    X = df_processed.drop('Destination', axis=1)
    y = df_processed['Destination']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train the model
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    # Make predictions on test set
    y_pred = rf_model.predict(X_test)
    
    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy:.2f}")
    
    # Print confusion matrix
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return rf_model, label_encoders, scaler

def predict_destination(model, label_encoders, scaler, input_data):
    """
    Make a prediction for a new input
    """
    # Create a DataFrame with the input data
    input_df = pd.DataFrame([input_data])
    
    # Encode categorical variables
    for column, encoder in label_encoders.items():
        input_df[column] = encoder.transform(input_df[column])
    
    # Scale numerical features
    input_df['Budget'] = scaler.transform(input_df[['Budget']])
    
    # Make prediction
    prediction = model.predict(input_df)
    
    return prediction[0]

if __name__ == "__main__":
    pass 