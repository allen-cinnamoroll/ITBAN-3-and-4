const mongoose = require('mongoose');

const travelPreferenceSchema = new mongoose.Schema({
  budget: {
    type: Number,
    required: true
  },
  destination_type: {
    type: String,
    required: true
  },
  travel_season: {
    type: String,
    required: true
  },
  travel_purpose: {
    type: String,
    required: true
  },
  municipality: {
    type: String,
    required: true
  },
  group_type: {
    type: String,
    required: true
  },
  number_of_people: {
    type: Number,
    required: true
  },
  trip_duration: {
    type: Number,
    required: true
  },
  recommendations: [{
    destination: String,
    packing_tips: String,
    budget: String,
    destination_type: String,
    travel_purpose: String,
    travel_season: String,
    municipality: String,
    similarity_score: Number
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TravelPreference', travelPreferenceSchema); 