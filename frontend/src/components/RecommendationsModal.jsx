import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, IconButton, Button, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import './RecommendationsModal.css';

const RecommendationsModal = ({
  open,
  onClose,
  recommendations,
  renderRecommendations, // not used in carousel mode
  ratings,
  averageRatings,
  handleRatingChange,
  handleSubmitRating
}) => {
  const prescriptive = recommendations.prescriptive || [];
  const predictive = recommendations.predictive || [];
  const maxLength = Math.max(prescriptive.length, predictive.length);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (open) setCurrent(0);
  }, [open]);

  const handlePrev = () => setCurrent((prev) => (prev > 0 ? prev - 1 : prev));
  const handleNext = () => setCurrent((prev) => (prev < maxLength - 1 ? prev + 1 : prev));

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="recommendations-modal-title"
      aria-describedby="recommendations-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box className="recommendations-modal-box" sx={{ position: 'relative', minWidth: { xs: 320, md: 500 } }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className="recommendations-modal-close-x"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: '#1976d2',
            zIndex: 10,
          }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>
        <Typography id="recommendations-modal-title" className="recommendations-modal-title" variant="h5" gutterBottom>
          Your Recommendations
        </Typography>
        <div className="recommendations-modal-content" style={{ minHeight: 350 }}>
          <Fade in={open} key={current} timeout={400}>
            <div>
              {/* Budget Prescription */}
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1, letterSpacing: 1 }}>
                Budget Prescription
              </Typography>
              <div className="recommendation-card" style={{ marginBottom: 16 }}>
                {prescriptive[current] ? (
                  <div style={{ padding: 16 }}>
                    <Typography variant="h6" gutterBottom>
                      {prescriptive[current].destination}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Daily Budget: ₱{prescriptive[current].daily_budget}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Trip Duration: {prescriptive[current].trip_duration} days
                    </Typography>
                    <Typography variant="h6" color="primary" paragraph>
                      Total Budget: ₱{prescriptive[current].total_budget}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Packing Tips:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Since you're going to {prescriptive[current].destination_type}, you need to bring: {prescriptive[current].packing_tips}
                    </Typography>
                  </div>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No prescriptive recommendation.
                  </Typography>
                )}
              </div>
              {/* Predictive Recommendation */}
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1, letterSpacing: 1 }}>
                Predictive Recommendation
              </Typography>
              <div className={`recommendation-card${current === 0 ? ' recommended-card' : ''}`}>
                <div style={{ padding: 16, position: 'relative' }}>
                  {current === 0 && predictive[current] && (
                    <span className="recommended-badge">
                      <span role="img" aria-label="star">⭐</span> Recommended for You
                    </span>
                  )}
                  {predictive[current] ? (
                    <Typography variant="h6" gutterBottom>
                      Based on your preferences, we predict you'd enjoy {predictive[current].destination} most!
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No predictive recommendation.
                    </Typography>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 16 }}>
                <IconButton onClick={handlePrev} disabled={current === 0}>
                  <ArrowBackIosNewIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {current + 1} / {maxLength}
                </Typography>
                <IconButton onClick={handleNext} disabled={current === maxLength - 1}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </div>
            </div>
          </Fade>
        </div>
      </Box>
    </Modal>
  );
};

export default RecommendationsModal;