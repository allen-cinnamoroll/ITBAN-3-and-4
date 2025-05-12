from pymongo import MongoClient
from pymongo.collection import Collection
from bson import ObjectId

def get_travel_input_collection(db) -> Collection:
    # Define the schema for MongoDB
    travel_input_schema = {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["budget", "destination_type", "trip_duration", "travel_season", "number_of_people", "municipality", "group_type", "travel_purpose", "created_at"],
                "properties": {
                    "budget": {
                        "bsonType": "double",
                        "description": "Budget must be a number"
                    },
                    "destination_type": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Must be a number between 1-5 representing destination type"
                    },
                    "trip_duration": {
                        "bsonType": "int",
                        "minimum": 1,
                        "description": "Must be a positive integer"
                    },
                    "travel_season": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 3,
                        "description": "Must be a number between 1-3 representing season"
                    },
                    "number_of_people": {
                        "bsonType": "int",
                        "minimum": 1,
                        "description": "Must be a positive integer"
                    },
                    "municipality": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 11,
                        "description": "Must be a number between 1-11 representing municipality"
                    },
                    "group_type": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 4,
                        "description": "Must be a number between 1-4 representing group type (Solo, Couple, Family, Friends)"
                    },
                    "travel_purpose": {
                        "bsonType": "int",
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Must be a number between 1-5 representing travel purpose"
                    },
                    "satisfaction_score": {
                        "bsonType": ["int", "null"],
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Optional satisfaction score (1-5)"
                    },
                    "system_satisfaction_score": {
                        "bsonType": ["int", "null"],
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Optional system satisfaction score (1-5)"
                    },
                    "analytics_satisfaction_score": {
                        "bsonType": ["int", "null"],
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Optional analytics satisfaction score (1-5)"
                    },
                    "created_at": {
                        "bsonType": "date",
                        "description": "Must be a valid datetime"
                    }
                }
            }
        }
    }

    # Create or get the collection with schema validation
    try:
        db.create_collection("travel_inputs", **travel_input_schema)
    except Exception:
        # Collection already exists
        db.command("collMod", "travel_inputs", **travel_input_schema)
    
    return db.travel_inputs