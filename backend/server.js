const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const TravelPreference = require('./models/TravelPreference');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Using MongoDB URI:', MONGODB_URI);
    
    // Test database connection
    return TravelPreference.findOne().exec();
  })
  .then((testDoc) => {
    console.log('Database connection test successful');
    if (testDoc) {
      console.log('Found existing document:', testDoc);
    } else {
      console.log('No existing documents found');
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Load destinations data
let destinations = [];
const csvPath = path.join(__dirname, 'dataset', 'Mati-City.csv');

// Function to load CSV data
function loadCSVData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Log the first few records to verify data structure
        if (destinations.length < 2) {
          console.log('Sample CSV data:', {
            destination: data.Destination,
            type: typeof data.Destination,
            raw: data
          });
        }
        destinations.push(data);
      })
      .on('end', () => {
        console.log('CSV file successfully loaded');
        console.log(`Loaded ${destinations.length} destinations`);
        console.log('First destination:', destinations[0]);
        resolve();
      })
      .on('error', (error) => {
        console.error('Error loading CSV file:', error);
        reject(error);
      });
  });
}

// Initialize server
async function startServer() {
  try {
    // Load CSV data first
    await loadCSVData();
    
    // Start the server
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Server URL: http://localhost:${port}`);
      console.log('Available endpoints:');
      console.log('  GET  /');
      console.log('  GET  /api/destinations');
      console.log('  GET  /api/preferences');
      console.log('  POST /api/recommendations');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ITBAN Backend API' });
});

// Get all destinations
app.get('/api/destinations', (req, res) => {
  console.log('GET /api/destinations - Returning all destinations');
  res.json({
    status: 'success',
    destinations: destinations
  });
});

// Get all saved preferences
app.get('/api/preferences', async (req, res) => {
  console.log('GET /api/preferences - Fetching all preferences');
  try {
    const preferences = await TravelPreference.find().sort({ created_at: -1 });
    console.log('Retrieved preferences:', preferences);
    res.json({
      status: 'success',
      preferences: preferences
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recommendations and save preferences
app.post('/api/recommendations', async (req, res) => {
  console.log('POST /api/recommendations - Processing new recommendation request');
  try {
    const userPreferences = req.body;
    console.log('Received preferences:', JSON.stringify(userPreferences, null, 2));

    // Validate required fields
    const requiredFields = ['destination_type', 'travel_purpose', 'travel_season', 'budget'];
    for (const field of requiredFields) {
      if (!userPreferences[field]) {
        console.log(`Missing required field: ${field}`);
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // First, save the user preferences to MongoDB
    try {
      console.log('Creating new travel preference document...');
      const travelPreference = new TravelPreference({
        budget: parseFloat(userPreferences.budget),
        destination_type: userPreferences.destination_type,
        travel_season: userPreferences.travel_season,
        travel_purpose: userPreferences.travel_purpose,
        municipality: userPreferences.municipality,
        group_type: userPreferences.group_type,
        number_of_people: parseInt(userPreferences.number_of_people),
        trip_duration: parseInt(userPreferences.trip_duration)
      });

      console.log('Travel preference document created:', JSON.stringify(travelPreference, null, 2));

      const savedPreference = await travelPreference.save();
      console.log('Successfully saved user preferences:', JSON.stringify(savedPreference, null, 2));
      console.log('Saved document _id:', savedPreference._id);
      console.log('Document ID type:', typeof savedPreference._id);
      console.log('Document ID string:', savedPreference._id.toString());

      // Then, get recommendations
      const recommendations = destinations
        .filter(dest => {
          const destBudget = parseFloat(dest.Budget.replace(/,/g, ''));
          const userBudget = parseFloat(userPreferences.budget);
          
          const budgetMatch = Math.abs(destBudget - userBudget) <= (userBudget * 0.2);
          const typeMatch = dest.Destination_Type.toLowerCase() === userPreferences.destination_type.toLowerCase();
          const purposeMatch = dest.Travel_Purpose.toLowerCase() === userPreferences.travel_purpose.toLowerCase();
          const seasonMatch = dest.Travel_season.toLowerCase() === userPreferences.travel_season.toLowerCase();
          
          console.log('Destination data:', {
            rawDestination: dest.Destination,
            destinationType: typeof dest.Destination,
            budgetMatch,
            typeMatch,
            purposeMatch,
            seasonMatch
          });
          
          return budgetMatch && typeMatch && purposeMatch && seasonMatch;
        })
        .map(dest => {
          console.log('Creating recommendation for destination:', dest.Destination);
          return {
            destination: dest.Destination,
            packing_tips: dest['Packing Tips'],
            budget: dest.Budget,
            destination_type: dest.Destination_Type,
            travel_purpose: dest.Travel_Purpose,
            travel_season: dest.Travel_season,
            municipality: dest.Municipality,
            similarity_score: 1.0
          };
        })
        .slice(0, 5);

      console.log('Final recommendations before sending:', JSON.stringify(recommendations, null, 2));

      let finalRecommendations = recommendations;

      // If no exact matches, return top 5 based on type and purpose only
      if (recommendations.length === 0) {
        console.log('No exact matches found, trying partial matches...');
        
        finalRecommendations = destinations
          .filter(dest => {
            const typeMatch = dest.Destination_Type.toLowerCase() === userPreferences.destination_type.toLowerCase();
            const purposeMatch = dest.Travel_Purpose.toLowerCase() === userPreferences.travel_purpose.toLowerCase();
            return typeMatch && purposeMatch;
          })
          .map(dest => ({
            destination: dest.Destination,
            packing_tips: dest['Packing Tips'],
            budget: dest.Budget,
            destination_type: dest.Destination_Type,
            travel_purpose: dest.Travel_Purpose,
            travel_season: dest.Travel_season,
            municipality: dest.Municipality,
            similarity_score: 0.8
          }))
          .slice(0, 5);
      }

      // Update the saved preference with recommendations
      savedPreference.recommendations = finalRecommendations;
      await savedPreference.save();
      console.log('Updated saved preference with recommendations:', JSON.stringify(savedPreference, null, 2));

      // Calculate daily budget based on trip duration
      const dailyBudget = parseFloat(userPreferences.budget) / parseFloat(userPreferences.trip_duration);
      
      // Add budget calculations to recommendations
      const recommendationsWithBudget = finalRecommendations.map(rec => ({
        ...rec,
        daily_budget: dailyBudget.toFixed(2),
        total_budget: userPreferences.budget,
        trip_duration: userPreferences.trip_duration,
        packing_tips: rec.packing_tips || 'No packing tips available for this destination'
      }));

      console.log('Final recommendations with budget and packing tips:', JSON.stringify(recommendationsWithBudget, null, 2));

      res.json({
        status: 'success',
        message: finalRecommendations.length === 0 ? 'No matches found. Please try different preferences.' : 'Recommendations found.',
        recommendations: {
          prescriptive: recommendationsWithBudget,
          predictive: finalRecommendations
        },
        saved_preference_id: savedPreference._id
      });

    } catch (dbError) {
      console.error('Database error details:', {
        name: dbError.name,
        message: dbError.message,
        stack: dbError.stack,
        code: dbError.code,
        errors: dbError.errors
      });
      if (dbError.errors) {
        Object.keys(dbError.errors).forEach((key) => {
          console.error(`Validation error for ${key}:`, dbError.errors[key].message);
        });
      }
      res.status(500).json({
        status: 'error',
        message: 'Failed to save preferences to database',
        error: dbError.message,
        validation: dbError.errors ? Object.keys(dbError.errors).map(key => dbError.errors[key].message) : undefined
      });
    }

  } catch (error) {
    console.error('Error processing recommendations:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      details: error.stack
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 'error',
    message: `Not Found: ${req.method} ${req.url}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    status: 'error',
    error: 'Internal server error',
    details: err.stack
  });
}); 