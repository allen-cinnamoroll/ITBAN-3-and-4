import { useState, useEffect, useRef } from 'react';
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
import './ChartsDashboard.css';

function Dashboard() {
  const text = "SmartTour DavOr";
  const [activeNav, setActiveNav] = useState('dashboard');
  const bubbleLayerRef = useRef(null);

  const handleNavClick = (nav) => {
    setActiveNav(nav);
  };

  // Bubble scatter on click anywhere
  useEffect(() => {
    const handleClick = (e) => {
      const bubbleLayer = bubbleLayerRef.current;
      for (let i = 0; i < 8; i++) {
        const bubble = document.createElement('span');
        bubble.className = 'click-bubble';
        const angle = (i / 8) * 2 * Math.PI;
        const x = Math.cos(angle) * 40;
        const y = Math.sin(angle) * 40;
        bubble.style.left = `${e.clientX}px`;
        bubble.style.top = `${e.clientY}px`;
        bubble.style.setProperty('--tx', `${x}px`);
        bubble.style.setProperty('--ty', `${y}px`);
        bubbleLayer.appendChild(bubble);
        setTimeout(() => bubble.remove(), 700);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <Box className="dashboard-container">
      {/* Bubble layer for click effects */}
      <div ref={bubbleLayerRef} className="bubble-click-layer"></div>

      {/* Logo Section */}
      <AppBar position="static" className="logo-title">
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <span className="header-glow"></span>
          {/* Bubbles */}
          <div className="bubbles">
            {[...Array(8)].map((_, i) => (
              <span key={i} className={`bubble bubble-${i}`}></span>
            ))}
          </div>
          <Typography variant="h4" component="div" className="logo-text">
            {text.split('').map((char, index) => (
              <span key={index} className="bounce-letter" style={{ animationDelay: `${index * 0.1}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </Typography>
        </Container>
        <div className="wave-header-container">
          <svg className="wave-header-svg" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path
              d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
              fill="#2196f3"
              opacity="0.7"
            >
              <animate 
                attributeName="d"
                dur="8s"
                repeatCount="indefinite"
                values="
                  M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z;
                  M0,30 C400,60 1040,20 1440,30 L1440,80 L0,80 Z;
                  M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z
                "
              />
            </path>
          </svg>
        </div>
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
            <Typography variant="h5" gutterBottom className="system-metrics-title">
              System Performance Metrics
            </Typography>
            {/* KPIs Row */}
            <SatisfactionKPIs />
            {/* 2x2 Grid for the 4 charts */}
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
      {/* Wave Footer Animation */}
      <div className="wave-footer-container">
        <svg className="wave-footer-svg" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#2196f3"
            opacity="0.7"
          >
            <animate 
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z;
                M0,30 C400,60 1040,20 1440,30 L1440,80 L0,80 Z;
                M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z
              "
            />
          </path>
        </svg>
      </div>
      {/* Footer Bubbles */}
      <div className="footer-bubbles">
        {[...Array(8)].map((_, i) => (
          <span key={i} className={`bubble bubble-footer bubble-footer-${i}`}></span>
        ))}
      </div>

      {/* Animated background dots */}
      <div className="dashboard-bg-dots">
        <span className="dashboard-bg-dot dot1"></span>
        <span className="dashboard-bg-dot dot2"></span>
        <span className="dashboard-bg-dot dot3"></span>
      </div>
    </Box>
  );
}

export default Dashboard;