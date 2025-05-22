import pandas as pd
import logging

logger = logging.getLogger(__name__)

class RuleBasedModel:
    def __init__(self):
        self.df = None

    def load_data(self, df):
        """Load the dataset"""
        # Standardize column names
        df.columns = [col.strip() for col in df.columns]
        # Convert all string columns to lowercase for case-insensitive matching
        for col in df.select_dtypes(include=['object']).columns:
            df[col] = df[col].str.lower()
        self.df = df
        logger.info(f"Rule-based model loaded data with {len(df)} records")
        logger.info(f"Available columns: {df.columns.tolist()}")

    def predict(self, user_preferences):
        """
        Get prescriptive recommendations based on user preferences and trip duration
        """
        try:
            logger.debug(f"Getting prescriptive recommendations for preferences: {user_preferences}")
            
            # Extract user preferences and convert to lowercase
            trip_duration = int(user_preferences.get('trip_duration', 1))
            destination_type = user_preferences.get('destination_type', '').lower()
            travel_purpose = user_preferences.get('travel_purpose', '').lower()
            travel_season = user_preferences.get('travel_season', '').lower()
            municipality = user_preferences.get('municipality', '').lower()
            
            logger.debug(f"Extracted preferences: trip_duration={trip_duration}, destination_type={destination_type}, "
                        f"travel_purpose={travel_purpose}, travel_season={travel_season}, municipality={municipality}")
            
            # Filter destinations based on preferences
            filtered_df = self.df[
                (self.df['Destination_Type'].str.contains(destination_type, case=False, na=False)) &
                (self.df['Travel_Purpose'].str.contains(travel_purpose, case=False, na=False)) &
                (self.df['Travel_season'].str.contains(travel_season, case=False, na=False)) &
                (self.df['Municipality'].str.contains(municipality, case=False, na=False))
            ]
            
            logger.debug(f"DataFrame shape after filtering: {filtered_df.shape}")
            
            if filtered_df.empty:
                logger.warning("No destinations found matching the criteria")
                return []
            
            recommendations = []
            for _, destination in filtered_df.iterrows():
                try:
                    # Calculate total budget based on trip duration
                    daily_budget = float(str(destination['Budget']).replace(',', ''))
                    total_budget = daily_budget * trip_duration
                    
                    recommendation = {
                        'destination': str(destination['Destination']),
                        'daily_budget': str(destination['Budget']),
                        'total_budget': str(total_budget),
                        'trip_duration': trip_duration,
                        'destination_type': str(destination['Destination_Type']),
                        'travel_purpose': str(destination['Travel_Purpose']),
                        'travel_season': str(destination['Travel_season']),
                        'municipality': str(destination['Municipality'])
                    }
                    recommendations.append(recommendation)
                except Exception as e:
                    logger.error(f"Error processing destination {destination['Destination']}: {str(e)}")
                    continue
            
            # Sort recommendations by total budget
            recommendations.sort(key=lambda x: float(x['total_budget']))
            
            logger.debug(f"Generated {len(recommendations)} recommendations")
            return recommendations[:5]  # Return top 5 recommendations
        except Exception as e:
            logger.error(f"Error in rule-based predictions: {str(e)}")
            return [] 