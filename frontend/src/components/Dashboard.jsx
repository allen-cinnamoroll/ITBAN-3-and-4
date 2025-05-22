import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import SmartTourAI from './SmartTourAI';
import SatisfactionKPIs from './SatisfactionKPIs';
import TopDestinations from './TopDestinations';
import DestinationTypesChart from './DestinationTypesChart';
import TravelSeasonsChart from './TravelSeasonsChart';
import MunicipalitiesChart from './MunicipalitiesChart';
import './Dashboard.css';

function Dashboard() {
  const text = "SmartTour DavOr";
  const [activeNav, setActiveNav] = useState('dashboard');
  
  const handleNavClick = (nav) => {
    setActiveNav(nav);
  };

  return (
    <Box className="dashboard-container">
      {/* Logo Section */}
      <AppBar position="static" className="logo-title">
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h4" component="div" className="logo-text">
            {text.split('').map((char, index) => (
              <span key={index} className="bounce-letter" style={{ animationDelay: `${index * 0.1}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </Typography>
        </Container>
      </AppBar>

      {/* Navigation Bar */}
      <AppBar position="static" className="main-navbar">
        <Container maxWidth="lg">
          <Toolbar className="nav-toolbar">
            <Box className="nav-links">
              <Typography 
                className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
              >
                <span>Dashboard</span>
              </Typography>
              <Typography 
                className={`nav-link ${activeNav === 'ai' ? 'active' : ''}`}
                onClick={() => handleNavClick('ai')}
              >
                <span>SmartTour AI</span>
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Content Area */}
      <Container maxWidth="lg" className="content-area">
        {activeNav === 'dashboard' ? (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              System Performance Metrics
            </Typography>
            <SatisfactionKPIs />
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <TopDestinations />
              </Grid>
              <Grid item xs={12} md={6}>
                <DestinationTypesChart />
              </Grid>
              <Grid item xs={12} md={6}>
                <TravelSeasonsChart />
              </Grid>
              <Grid item xs={12} md={6}>
                <MunicipalitiesChart />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <SmartTourAI />
        )}
      </Container>
    </Box>
  );
}

export default Dashboard; 