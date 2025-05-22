import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Rating,
  Stack
} from '@mui/material';
import './SmartTourAI.css';
// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

function SmartTourAI() {
  const [formData, setFormData] = useState({
    budget: '',
    destinationType: '',
    tripDuration: '',
    travelSeason: '',
    numberOfPeople: '',
    municipality: '',
    groupType: '',
    travelPurpose: ''
  });

  const [errors, setErrors] = useState({
    budget: '',
    tripDuration: '',
    numberOfPeople: '',
    groupSize: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [recommendations, setRecommendations] = useState({
    predictive: []
  });

  const [ratings, setRatings] = useState({
    system_satisfaction_score: 0,
    analytics_satisfaction_score: 0
  });

  const [averageRatings, setAverageRatings] = useState({
    system_satisfaction_score: 0,
    analytics_satisfaction_score: 0
  });

  const destinationTypes = [
    { value: 1, label: 'Beach' },
    { value: 2, label: 'Mountain' },
    { value: 3, label: 'Cultural' },
    { value: 4, label: 'Nature' },
    { value: 5, label: 'Island' }
  ];

  const travelSeasons = [
    { value: 1, label: 'Summer (March-May)' },
    { value: 2, label: 'Rainy (June-October)' },
    { value: 3, label: 'Holiday Season (November-February)' }
  ];

  const municipalities = [
    { value: 1, label: 'Boston' },
    { value: 2, label: 'Cateel' },
    { value: 3, label: 'Baganga' },
    { value: 4, label: 'Caraga' },
    { value: 5, label: 'Manay' },
    { value: 6, label: 'Tarragona' },
    { value: 7, label: 'Banaybanay' },
    { value: 8, label: 'Lupon' },
    { value: 9, label: 'Mati City' },
    { value: 10, label: 'San Isidro' },
    { value: 11, label: 'Governor Generoso' }
  ];

  const groupTypes = [
    { value: 1, label: 'Solo' },
    { value: 2, label: 'Couple' },
    { value: 3, label: 'Family' },
    { value: 4, label: 'Friends' }
  ];

  const travelPurposes = [
    { value: 1, label: 'Relaxation' },
    { value: 2, label: 'Adventure' },
    { value: 3, label: 'Nature Appreciation' },
    { value: 4, label: 'Cultural Discovery' }
  ];

  const validateGroupSize = (groupType, numberOfPeople) => {
    const people = parseInt(numberOfPeople);
    
    if (!groupType || !numberOfPeople) return '';

    switch (parseInt(groupType)) {
      case 1: // Solo
        if (people !== 1) {
          return 'Solo travel must have exactly 1 person';
        }
        break;
      case 2: // Couple
        if (people !== 2) {
          return 'Couple travel must have exactly 2 people';
        }
        break;
      case 3: // Family
        if (people < 3) {
          return 'Family group must have 3 or more people';
        }
        break;
      case 4: // Friends
        if (people < 3) {
          return 'Friend group must have 3 or more people';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  const validateNumber = (name, value) => {
    if (value <= 0) {
      return `${name} must be greater than 0`;
    }
    return '';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);

    // Validate numeric fields
    if (['budget', 'tripDuration', 'numberOfPeople'].includes(name)) {
      const error = validateNumber(
        name === 'budget' ? 'Budget' :
        name === 'tripDuration' ? 'Trip duration' :
        'Number of people',
        parseFloat(value)
      );
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));

      // If changing number of people or if changing group type, validate group size
      if (name === 'numberOfPeople' || name === 'groupType') {
        const groupSizeError = validateGroupSize(
          name === 'groupType' ? value : formData.groupType,
          name === 'numberOfPeople' ? value : formData.numberOfPeople
        );
        setErrors(prev => ({
          ...prev,
          groupSize: groupSizeError
        }));
      }
    }

    // If changing group type, validate against current number of people
    if (name === 'groupType') {
      const groupSizeError = validateGroupSize(value, formData.numberOfPeople);
      setErrors(prev => ({
        ...prev,
        groupSize: groupSizeError
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check for any validation errors including group size
    const hasErrors = Object.values(errors).some(error => error !== '');
    const hasEmptyFields = Object.values(formData).some(value => value === '');

    // Additional group size validation before submission
    const groupSizeError = validateGroupSize(formData.groupType, formData.numberOfPeople);
    if (groupSizeError) {
      setErrors(prev => ({
        ...prev,
        groupSize: groupSizeError
      }));
      setSnackbar({
        open: true,
        message: groupSizeError,
        severity: 'error',
        duration: 3000
      });
      return;
    }

    if (hasErrors || hasEmptyFields) {
      setSnackbar({
        open: true,
        message: 'Please fix all errors and fill in all fields before submitting.',
        severity: 'error',
        duration: 3000
      });
      return;
    }
    
    try {
      // Get the label values for the selected options
      const selectedDestinationType = destinationTypes.find(type => type.value === parseInt(formData.destinationType))?.label || '';
      const selectedTravelSeason = travelSeasons.find(season => season.value === parseInt(formData.travelSeason))?.label.split(' ')[0] || '';
      const selectedTravelPurpose = travelPurposes.find(purpose => purpose.value === parseInt(formData.travelPurpose))?.label || '';
      const selectedMunicipality = municipalities.find(municipality => municipality.value === parseInt(formData.municipality))?.label || '';
      const selectedGroupType = groupTypes.find(type => type.value === parseInt(formData.groupType))?.label || '';

      // Format the request data to match backend expectations
      const requestData = {
        budget: parseFloat(formData.budget),
        destination_type: selectedDestinationType.toLowerCase(),
        travel_season: selectedTravelSeason.toLowerCase(),
        travel_purpose: selectedTravelPurpose.toLowerCase(),
        municipality: selectedMunicipality.toLowerCase(),
        group_type: selectedGroupType.toLowerCase(),
        number_of_people: parseInt(formData.numberOfPeople),
        trip_duration: parseInt(formData.tripDuration)
      };

      console.log('Sending request to:', axios.defaults.baseURL + '/api/recommendations');
      console.log('Request data:', JSON.stringify(requestData, null, 2));

      const response = await axios.post('/api/recommendations', requestData);
      
      console.log('Raw response data:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'success') {
        // Log the saved preference ID
        console.log('Saved preference ID:', response.data.saved_preference_id);
        
        // Process both prescriptive and predictive recommendations
        let prescriptiveRecs = [];
        let predictiveRecs = [];

        if (response.data.recommendations) {
          // Handle predictive recommendations first
          if (response.data.recommendations.predictive) {
            predictiveRecs = response.data.recommendations.predictive.map(rec => {
              const destination = rec.destination || rec.Destination || 'Unknown Destination';
              console.log('Processing predictive recommendation:', { destination, packing_tips: rec.packing_tips });
              return {
                ...rec,
                destination: destination
              };
            });
          }

          // Handle prescriptive recommendations
          if (response.data.recommendations.prescriptive) {
            console.log('Raw prescriptive recommendations:', response.data.recommendations.prescriptive);
            prescriptiveRecs = response.data.recommendations.prescriptive.map(rec => {
              console.log('Processing prescriptive recommendation:', rec);
              return {
                ...rec,
                destination: rec.destination || 'Unknown Destination',
                packing_tips: rec.packing_tips || 'No packing tips available for this destination'
              };
            });
          } else if (predictiveRecs.length > 0) {
            // If no prescriptive recommendations, use predictive ones
            console.log('Using predictive recommendations as prescriptive');
            prescriptiveRecs = predictiveRecs.map(rec => {
              const dailyBudget = parseFloat(rec.budget.replace(/,/g, ''));
              const totalBudget = dailyBudget * parseInt(formData.tripDuration);
              console.log('Converting predictive to prescriptive:', {
                destination: rec.destination,
                packing_tips: rec.packing_tips,
                dailyBudget,
                totalBudget
              });
              return {
                ...rec,
                destination: rec.destination,
                daily_budget: dailyBudget.toFixed(2),
                total_budget: totalBudget.toFixed(2),
                trip_duration: parseInt(formData.tripDuration),
                packing_tips: rec.packing_tips || 'No packing tips available for this destination'
              };
            });
          }
        }

        console.log('Processed prescriptive recommendations:', JSON.stringify(prescriptiveRecs, null, 2));
        console.log('Processed predictive recommendations:', JSON.stringify(predictiveRecs, null, 2));

        const newRecommendations = {
          prescriptive: prescriptiveRecs,
          predictive: predictiveRecs
        };

        console.log('Setting recommendations state:', JSON.stringify(newRecommendations, null, 2));
        setRecommendations(newRecommendations);
        
        setSnackbar({
          open: true,
          message: 'Successfully saved preferences and got recommendations!',
          severity: 'success',
          duration: 6000
        });
      } else {
        throw new Error(response.data.message || 'Failed to get recommendations');
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'Failed to get recommendations. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message.includes('Network Error')) {
        errorMessage += 'Please check if the backend server is running.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
        duration: 3000
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const renderRecommendations = () => {
    console.log('Rendering recommendations. Current state:', recommendations);
    
    // Check if we have any recommendations
    if (!recommendations || (!recommendations.prescriptive?.length && !recommendations.predictive?.length)) {
      console.log('No recommendations to display');
      return null;
    }

    return (
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Prescriptive Recommendations */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Budget Prescription
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Based on your trip duration and destination preferences
              </Typography>
              {recommendations.prescriptive?.length > 0 ? (
                recommendations.prescriptive.map((rec, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {rec.destination}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Daily Budget: ₱{rec.daily_budget}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Trip Duration: {rec.trip_duration} days
                      </Typography>
                      <Typography variant="h6" color="primary" paragraph>
                        Total Budget: ₱{rec.total_budget}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Packing Tips:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Since you're going to {rec.destination_type}, you need to bring: {rec.packing_tips}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No prescriptive recommendations available.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Predictive Recommendations */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="secondary">
                Predictive Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Based on machine learning analysis
              </Typography>
              {recommendations.predictive?.length > 0 ? (
                recommendations.predictive.map((rec, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Based on your preferences, we predict you'd enjoy {rec.destination} most!
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No predictive recommendations available.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const handleRatingChange = (type, value) => {
    setRatings(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSubmitRating = async () => {
    try {
      const response = await axios.post('/api/ratings', {
        system_satisfaction_score: ratings.system_satisfaction_score,
        analytics_satisfaction_score: ratings.analytics_satisfaction_score
      });

      if (response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Thank you for your feedback!',
          severity: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit rating. Please try again.',
        severity: 'error',
        duration: 3000
      });
    }
  };

  // Add useEffect to fetch ratings when component mounts
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get('/api/ratings');
        if (response.data.status === 'success') {
          setAverageRatings(response.data.averages);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, []);

  return (
    <Container maxWidth="md" className="ai-content">
      <Paper elevation={3} className="form-paper">
        <Typography variant="h4" className="form-title" gutterBottom>
          Plan Your Trip in DavOr
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box className="form-container">
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              error={!!errors.budget}
              helperText={errors.budget}
              InputProps={{
                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
              }}
              className="form-field"
            />

            <TextField
              fullWidth
              label="Trip Duration (days)"
              name="tripDuration"
              type="number"
              value={formData.tripDuration}
              onChange={handleChange}
              error={!!errors.tripDuration}
              helperText={errors.tripDuration}
              className="form-field"
            />

            <FormControl fullWidth className="form-field">
              <InputLabel>Destination Type</InputLabel>
              <Select
                name="destinationType"
                value={formData.destinationType}
                onChange={handleChange}
                label="Destination Type"
              >
                {destinationTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth className="form-field">
              <InputLabel>Travel Season</InputLabel>
              <Select
                name="travelSeason"
                value={formData.travelSeason}
                onChange={handleChange}
                label="Travel Season"
              >
                {travelSeasons.map((season) => (
                  <MenuItem key={season.value} value={season.value}>
                    {season.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth className="form-field">
              <InputLabel>Travel Purpose</InputLabel>
              <Select
                name="travelPurpose"
                value={formData.travelPurpose}
                onChange={handleChange}
                label="Travel Purpose"
              >
                {travelPurposes.map((purpose) => (
                  <MenuItem key={purpose.value} value={purpose.value}>
                    {purpose.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth className="form-field">
              <InputLabel>Municipality</InputLabel>
              <Select
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                label="Municipality"
              >
                {municipalities.map((municipality) => (
                  <MenuItem key={municipality.value} value={municipality.value}>
                    {municipality.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth className="form-field">
              <InputLabel>Group Type</InputLabel>
              <Select
                name="groupType"
                value={formData.groupType}
                onChange={handleChange}
                label="Group Type"
                error={!!errors.groupSize}
              >
                {groupTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.groupSize && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {errors.groupSize}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Number of People"
              name="numberOfPeople"
              type="number"
              value={formData.numberOfPeople}
              onChange={handleChange}
              error={!!errors.numberOfPeople || !!errors.groupSize}
              helperText={errors.numberOfPeople || errors.groupSize}
              className="form-field"
            />

            <Box className="submit-button-container">
              <Button 
                variant="contained" 
                color="primary" 
                type="submit"
                size="large"
                className="submit-button"
              >
                Submit
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Render recommendations */}
      {renderRecommendations()}

      {/* Rating Footer */}
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Rate Your Experience
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">System Satisfaction</Typography>
              <Rating
                value={ratings.system_satisfaction_score}
                onChange={(event, newValue) => handleRatingChange('system_satisfaction_score', newValue)}
                precision={0.5}
              />
              <Typography variant="caption" color="text.secondary">
                Average Rating: {averageRatings.system_satisfaction_score.toFixed(1)} / 5.0
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">Analytics Satisfaction</Typography>
              <Rating
                value={ratings.analytics_satisfaction_score}
                onChange={(event, newValue) => handleRatingChange('analytics_satisfaction_score', newValue)}
                precision={0.5}
              />
              <Typography variant="caption" color="text.secondary">
                Average Rating: {averageRatings.analytics_satisfaction_score.toFixed(1)} / 5.0
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitRating}
                disabled={ratings.system_satisfaction_score === 0 || ratings.analytics_satisfaction_score === 0}
              >
                Submit Rating
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration || 6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SmartTourAI; 