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

function TopDestinations() {
  const [topDestinations, setTopDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopDestinations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/top-destinations');
        if (response.data.status === 'success') {
          setTopDestinations(response.data.destinations);
          setError(null);
        }
      } catch (error) {
        setError('Failed to load top destinations');
        setTopDestinations([
          { name: 'Mati City', recommendations: 150 },
          { name: 'Cateel', recommendations: 120 },
          { name: 'Boston', recommendations: 100 },
          { name: 'Baganga', recommendations: 80 },
          { name: 'Caraga', recommendations: 60 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDestinations();
  }, []);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} className="chart-card fade-in-up">
      <Typography className="chart-title" gutterBottom>
        Top 5 Recommended Destinations
      </Typography>
      <Box className="chart-container">
        <ResponsiveContainer>
          <BarChart
            data={topDestinations}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Recommendations', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value, name) => [`${value} recommendations`, name]} />
            <Bar
              dataKey="recommendations"
              fill="#1976d2"
              isAnimationActive={true}
              animationDuration={1200}
              animationBegin={200}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default TopDestinations;