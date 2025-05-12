import React, { useState } from 'react';
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
  Alert
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
    { value: 3, label: 'Food Trip' },
    { value: 4, label: 'Cultural Discovery' },
    { value: 5, label: 'Nature Appreciation' }
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
        severity: 'error'
      });
      return;
    }

    if (hasErrors || hasEmptyFields) {
      setSnackbar({
        open: true,
        message: 'Please fix all errors and fill in all fields before submitting.',
        severity: 'error'
      });
      return;
    }
    
    try {
      const response = await axios.post('/travel-input', {
        budget: parseFloat(formData.budget),
        destination_type: parseInt(formData.destinationType),
        trip_duration: parseInt(formData.tripDuration),
        travel_season: parseInt(formData.travelSeason),
        number_of_people: parseInt(formData.numberOfPeople),
        municipality: parseInt(formData.municipality),
        group_type: parseInt(formData.groupType),
        travel_purpose: parseInt(formData.travelPurpose)
      });

      setSnackbar({
        open: true,
        message: 'Successfully saved your travel preferences!',
        severity: 'success'
      });

      // Clear form after successful submission
      setFormData({
        budget: '',
        destinationType: '',
        tripDuration: '',
        travelSeason: '',
        numberOfPeople: '',
        municipality: '',
        groupType: '',
        travelPurpose: ''
      });
      setErrors({
        budget: '',
        tripDuration: '',
        numberOfPeople: '',
        groupSize: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'Failed to save travel preferences. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message.includes('Network Error')) {
        errorMessage += 'Please check if the backend server is running.';
      } else {
        errorMessage += 'Please try again.';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
                Get Recommendations
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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