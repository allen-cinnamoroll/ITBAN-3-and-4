import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import './DashboardContent.css';

function DashboardContent() {
  return (
    <Container maxWidth="lg" className="dashboard-content">
      <Paper elevation={2} className="content-paper">
        <Typography variant="h4" className="content-title">
          Welcome to Dashboard
        </Typography>
        {/* Add your dashboard content here */}
      </Paper>
    </Container>
  );
}

export default DashboardContent; 