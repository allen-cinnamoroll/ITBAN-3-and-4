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

function MunicipalitiesChart() {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/municipalities');
        if (response.data.status === 'success') {
          setDistribution(response.data.distribution);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching municipalities distribution:', error);
        setError('Failed to load municipalities distribution');
        // Fallback data in case of error
        setDistribution([
          { name: "Mati City", value: 40 },
          { name: "Cateel", value: 25 },
          { name: "Baganga", value: 20 },
          { name: "Boston", value: 15 },
          { name: "Caraga", value: 10 },
          { name: "Manay", value: 8 },
          { name: "Tarragona", value: 7 },
          { name: "Banaybanay", value: 6 },
          { name: "Lupon", value: 5 },
          { name: "San Isidro", value: 4 },
          { name: "Governor Generoso", value: 3 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
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
        Preferred Municipalities
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
            <Bar
              dataKey="value"
              fill="#82ca9d"
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

export default MunicipalitiesChart;