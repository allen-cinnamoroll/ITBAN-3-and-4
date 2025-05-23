import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import './ChartsDashboard.css';

function TravelSeasonsChart() {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/travel-seasons');
        if (response.data.status === 'success') {
          setDistribution(response.data.distribution);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching travel seasons distribution:', error);
        setError('Failed to load travel seasons distribution');
        // Fallback data in case of error
        setDistribution([
          { name: "Summer (March-May)", value: 45 },
          { name: "Rainy (June-October)", value: 25 },
          { name: "Holiday Season (November-February)", value: 30 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, []);

  if (loading) {
    return (
      <Paper elevation={3} className="chart-card">
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} className="chart-card">
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} className="chart-card">
      <Typography className="chart-title" gutterBottom>
        Preferred Travel Seasons
      </Typography>
      <Box className="chart-container">
        <ResponsiveContainer>
          <BarChart
            data={distribution}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis label={{ value: 'Number of Recommendations', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value} recommendations`, 'Count']} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default TravelSeasonsChart;