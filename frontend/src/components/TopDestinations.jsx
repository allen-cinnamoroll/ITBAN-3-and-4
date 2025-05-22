import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Typography, Paper, Box } from '@mui/material';

function TopDestinations() {
  const [topDestinations, setTopDestinations] = useState([]);

  useEffect(() => {
    const fetchTopDestinations = async () => {
      try {
        const response = await axios.get('/api/destinations');
        if (response.data.status === 'success') {
          // Get all destinations and their recommendation counts
          const destinations = response.data.destinations;
          const destinationCounts = destinations.reduce((acc, dest) => {
            acc[dest.Destination] = (acc[dest.Destination] || 0) + 1;
            return acc;
          }, {});

          // Convert to array and sort by count
          const sortedDestinations = Object.entries(destinationCounts)
            .map(([destination, count]) => ({
              destination,
              count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          setTopDestinations(sortedDestinations);
        }
      } catch (error) {
        console.error('Error fetching top destinations:', error);
      }
    };

    fetchTopDestinations();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Top 5 Recommended Destinations
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={topDestinations}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="destination"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              name="Number of Recommendations"
              fill="#8884d8"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default TopDestinations; 