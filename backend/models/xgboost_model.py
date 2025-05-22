import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

class XGBoostTravelModel:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.feature_columns = ['Budget', 'Destination_Type', 'Travel_Purpose', 'Travel_season', 'Municipality']
        self.budget_scaler = None
        
    def preprocess_data(self, df):
        """Preprocess the data with advanced feature engineering"""
        print("\n=== Preprocessing Data ===")
        
        # Create label encoders for categorical features
        for column in ['Destination_Type', 'Travel_Purpose', 'Travel_season', 'Municipality']:
            self.label_encoders[column] = LabelEncoder()
            df[column] = self.label_encoders[column].fit_transform(df[column])
            print(f"Encoded {column} values: {dict(zip(self.label_encoders[column].classes_, self.label_encoders[column].transform(self.label_encoders[column].classes_)))}")
        
        # Convert Budget to numeric and normalize
        df['Budget'] = df['Budget'].str.replace(',', '').astype(float)
        self.budget_scaler = {
            'mean': df['Budget'].mean(),
            'std': df['Budget'].std()
        }
        df['Budget'] = (df['Budget'] - self.budget_scaler['mean']) / self.budget_scaler['std']
        
        # Advanced feature engineering
        # 1. Budget-based features
        df['Budget_Type'] = df['Budget'] * df['Destination_Type']
        df['Budget_Purpose'] = df['Budget'] * df['Travel_Purpose']
        df['Budget_Season'] = df['Budget'] * df['Travel_season']
        
        # 2. Interaction features
        df['Type_Purpose'] = df['Destination_Type'] * df['Travel_Purpose']
        df['Type_Season'] = df['Destination_Type'] * df['Travel_season']
        df['Purpose_Season'] = df['Travel_Purpose'] * df['Travel_season']
        
        # 3. Polynomial features for budget
        df['Budget_Squared'] = df['Budget'] ** 2
        df['Budget_Cubed'] = df['Budget'] ** 3
        
        return df
    
    def train(self, df):
        """Train the XGBoost model with advanced parameters"""
        print("\n=== Training XGBoost Model ===")
        # Preprocess the data
        processed_df = self.preprocess_data(df.copy())
        
        # Prepare features and target
        feature_cols = self.feature_columns + [
            'Budget_Type', 'Budget_Purpose', 'Budget_Season',
            'Type_Purpose', 'Type_Season', 'Purpose_Season',
            'Budget_Squared', 'Budget_Cubed'
        ]
        X = processed_df[feature_cols]
        y = processed_df['Destination']
        
        # Split data for validation
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Initialize XGBoost model with optimized parameters
        self.model = xgb.XGBClassifier(
            n_estimators=500,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1,
            objective='multi:softprob',
            num_class=len(df['Destination'].unique()),
            random_state=42,
            n_jobs=-1
        )
        
        # Train the model
        print("Training XGBoost model...")
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            eval_metric='mlogloss',
            early_stopping_rounds=50,
            verbose=True
        )
        
        # Evaluate on validation set
        y_pred = self.model.predict(X_val)
        accuracy = accuracy_score(y_val, y_pred)
        print(f"\nValidation Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_val, y_pred))
        
        # Perform cross-validation
        cv_scores = cross_val_score(self.model, X, y, cv=5)
        print(f"\nCross-validation scores: {cv_scores}")
        print(f"Average CV score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # Print feature importance
        feature_importance = dict(zip(X.columns, self.model.feature_importances_))
        print("\nFeature Importance:")
        for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
            print(f"{feature}: {importance:.4f}")
        
        # Save the model and encoders
        self.save_model()
        print("Model training completed and saved")
        
    def predict(self, user_preferences, df):
        """Make predictions with enhanced scoring system"""
        print("\n=== Starting Prediction Process ===")
        
        if self.model is None:
            print("Model is None, attempting to load...")
            self.load_model()
        
        try:
            # Validate input data
            required_fields = ['budget', 'destination_type', 'travel_purpose', 'travel_season', 'municipality']
            for field in required_fields:
                if field not in user_preferences:
                    raise ValueError(f"Missing required field: {field}")
                if not user_preferences[field]:
                    raise ValueError(f"Empty value for field: {field}")

            # Preprocess user preferences
            input_data = pd.DataFrame([{
                'Budget': float(str(user_preferences['budget']).replace(',', '')),
                'Destination_Type': str(user_preferences['destination_type']),
                'Travel_Purpose': str(user_preferences['travel_purpose']),
                'Travel_season': str(user_preferences['travel_season']),
                'Municipality': str(user_preferences['municipality'])
            }])
            
            # Transform categorical features
            for column in ['Destination_Type', 'Travel_Purpose', 'Travel_season', 'Municipality']:
                try:
                    if input_data[column].iloc[0] in self.label_encoders[column].classes_:
                        input_data[column] = self.label_encoders[column].transform([input_data[column].iloc[0]])[0]
                    else:
                        print(f"Warning: {column} value not found in training data. Using default value.")
                        input_data[column] = 0
                except Exception as e:
                    print(f"Error transforming {column}: {str(e)}")
                    input_data[column] = 0
            
            # Normalize budget
            input_data['Budget'] = (input_data['Budget'] - self.budget_scaler['mean']) / self.budget_scaler['std']
            
            # Add engineered features
            input_data['Budget_Type'] = input_data['Budget'] * input_data['Destination_Type']
            input_data['Budget_Purpose'] = input_data['Budget'] * input_data['Travel_Purpose']
            input_data['Budget_Season'] = input_data['Budget'] * input_data['Travel_season']
            input_data['Type_Purpose'] = input_data['Destination_Type'] * input_data['Travel_Purpose']
            input_data['Type_Season'] = input_data['Destination_Type'] * input_data['Travel_season']
            input_data['Purpose_Season'] = input_data['Travel_Purpose'] * input_data['Travel_season']
            input_data['Budget_Squared'] = input_data['Budget'] ** 2
            input_data['Budget_Cubed'] = input_data['Budget'] ** 3
            
            # Get predictions with probability scores
            predictions = self.model.predict_proba(input_data)
            
            # Get top 5 destinations with highest probability
            top_indices = np.argsort(predictions[0])[-5:][::-1]
            top_destinations = self.model.classes_[top_indices]
            
            # Get predictions with confidence scores and additional features
            predictions_list = []
            for idx, dest in enumerate(top_destinations):
                dest_data = df[df['Destination'] == dest]
                if not dest_data.empty:
                    confidence_score = float(predictions[0][np.where(self.model.classes_ == dest)[0][0]])
                    
                    # Enhanced scoring system
                    budget_match = 1 - abs(float(user_preferences['budget']) - float(dest_data['Budget'].iloc[0].replace(',', ''))) / float(user_preferences['budget'])
                    type_match = 1 if user_preferences['destination_type'] == dest_data['Destination_Type'].iloc[0] else 0.5
                    purpose_match = 1 if user_preferences['travel_purpose'] == dest_data['Travel_Purpose'].iloc[0] else 0.5
                    season_match = 1 if user_preferences['travel_season'] == dest_data['Travel_season'].iloc[0] else 0.5
                    
                    # Weighted scoring with emphasis on confidence and budget
                    final_score = (
                        0.35 * confidence_score +
                        0.25 * budget_match +
                        0.15 * type_match +
                        0.15 * purpose_match +
                        0.10 * season_match
                    )
                    
                    prediction = {
                        'destination': str(dest),
                        'confidence_score': final_score,
                        'budget_match': budget_match,
                        'type_match': type_match,
                        'purpose_match': purpose_match,
                        'season_match': season_match
                    }
                    predictions_list.append(prediction)
            
            if not predictions_list:
                return [{
                    'destination': 'Dahican Surf Resort',
                    'confidence_score': 1.0,
                    'budget_match': 1.0,
                    'type_match': 1.0,
                    'purpose_match': 1.0,
                    'season_match': 1.0
                }]
            
            # Sort predictions by final score
            predictions_list.sort(key=lambda x: x['confidence_score'], reverse=True)
            
            return predictions_list
            
        except Exception as e:
            print(f"\nError in predict method: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return [{
                'destination': 'Dahican Surf Resort',
                'confidence_score': 1.0,
                'budget_match': 1.0,
                'type_match': 1.0,
                'purpose_match': 1.0,
                'season_match': 1.0
            }]
    
    def save_model(self):
        """Save the model and encoders"""
        if not os.path.exists('models'):
            os.makedirs('models')
        
        joblib.dump(self.model, 'models/xgboost_model.joblib')
        joblib.dump(self.label_encoders, 'models/xgboost_label_encoders.joblib')
        joblib.dump(self.budget_scaler, 'models/xgboost_budget_scaler.joblib')
    
    def load_model(self):
        """Load the saved model and encoders"""
        try:
            self.model = joblib.load('models/xgboost_model.joblib')
            self.label_encoders = joblib.load('models/xgboost_label_encoders.joblib')
            self.budget_scaler = joblib.load('models/xgboost_budget_scaler.joblib')
        except:
            raise Exception("Model not found. Please train the model first.") 