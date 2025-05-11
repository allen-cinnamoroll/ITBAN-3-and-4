from flask import Flask, request, jsonify
from dotenv import load_dotenv
from pymongo import MongoClient
from models.travel_input_model import TravelInputModel
from schemas.travel_input_schema import get_travel_input_collection  # Updated import
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['ENV'] = 'development'
app.config['DEBUG'] = True

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client.get_database()
    travel_inputs = get_travel_input_collection(db)
    print(f"MongoDB connected successfully on {os.getenv('MONGODB_URI')}")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

@app.route('/')
def hello():
    return "Hello, Flask!"

# Example route to save travel input
@app.route('/travel-input', methods=['POST'])
def create_travel_input():
    try:
        data = request.get_json()
        travel_input = TravelInputModel.from_dict(data)
        result = travel_inputs.insert_one(travel_input.to_dict())
        return jsonify({"message": "Travel input saved successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Server running on port {port}")
    app.run(host='0.0.0.0', port=port)