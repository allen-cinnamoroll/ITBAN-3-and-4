from pymongo import MongoClient
from pymongo.collection import Collection
from bson import ObjectId

def get_travel_input_collection(db) -> Collection:
    # Define the schema for MongoDB
    travel_input_schema = {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["budget", "destination_type", "trip_duration", "travel_season", "number_of_people", "municipality", "created_at"],
                "properties": {
                    "budget": {
                        "bsonType": "double",
                        "description": "Budget must be a number"
                    },
                    "destination_type": {
                        "bsonType": "string",
                        "enum": ["Beach", "Mountain", "Cultural", "Nature", "Cities"],
                        "description": "Must be one of the enum values"
                    },
                    "trip_duration": {
                        "bsonType": "int",
                        "minimum": 1,
                        "description": "Must be a positive integer"
                    },
                    "travel_season": {
                        "bsonType": "string",
                        "enum": ["Summer (March-May)", "Rainy (June-October)", "Holiday Season (November-February)"],
                        "description": "Must be one of the defined seasons"
                    },
                    "number_of_people": {
                        "bsonType": "int",
                        "minimum": 1,
                        "description": "Must be a positive integer"
                    },
                    "municipality": {
                        "bsonType": "string",
                        "enum": ["Boston", "Cateel", "Baganga", "Caraga", "Manay", "Tarragona", 
                                "Banaybanay", "Lupon", "Mati City", "San Isidro", "Governor Generoso"],
                        "description": "Must be one of the listed municipalities"
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