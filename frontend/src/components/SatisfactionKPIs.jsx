import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';

function SatisfactionKPIs() {
  const [ratings, setRatings] = useState({
    system_satisfaction_score: 0,
    analytics_satisfaction_score: 0,
    total_ratings: 0
  });

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get('/api/ratings');
        if (response.data.status === 'success') {
          setRatings({
            ...response.data.averages,
            total_ratings: response.data.ratings.length
          });
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchRatings, 30000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (score) => {
    if (score >= 2.5) return '#4caf50'; // Green for good
    return '#f44336'; // Red for poor
  };

  const getPercentage = (score) => Math.round((score / 5) * 100);

  const DonutKPI = ({ label, value }) => {
    const percent = getPercentage(value);
    const color = getColor(value);
    return (
      <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 150 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
          <CircularProgress
            variant="determinate"
            value={percent}
            size={70}
            thickness={5}
            sx={{ color: color, backgroundColor: '#f5f5f5', borderRadius: '50%' }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              width: '100%',
              height: '100%'
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: color, fontSize: '1.2rem' }}>
              {percent}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              ({value.toFixed(1)} / 5.0)
            </Typography>
          </Box>
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 500, fontSize: '1rem' }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
          Based on {ratings.total_ratings} ratings
        </Typography>
      </Paper>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <DonutKPI label="System Satisfaction" value={ratings.system_satisfaction_score} />
      </Grid>
      <Grid item xs={12} md={6}>
        <DonutKPI label="Analytics Satisfaction" value={ratings.analytics_satisfaction_score} />
      </Grid>
    </Grid>
  );
}

export default SatisfactionKPIs; 