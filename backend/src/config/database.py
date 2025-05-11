from pymongo import MongoClient
import os

def get_mongo_client():
    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri)
    return client

def get_database():
    client = get_mongo_client()
    db_name = os.getenv("DB_NAME", "mydatabase")  # Default database name
    return client[db_name]