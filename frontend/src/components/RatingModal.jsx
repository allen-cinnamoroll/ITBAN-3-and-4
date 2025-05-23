import React from 'react';
import { Modal, Box, Typography, Grid, Rating, Stack, Button, Paper } from '@mui/material';
import './RecommendationsModal.css'; // Reuse modal styles

const RatingModal = ({
  open,
  onClose,
  ratings,
  averageRatings,
  handleRatingChange,
  handleSubmitRating
}) => {
  // Wrap submit to also close modal
  const handleSubmitAndClose = () => {
    handleSubmitRating();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="rating-modal-title"
      aria-describedby="rating-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box className="recommendations-modal-box rating-modal-compact" sx={{ mb: 0, pb: 0 }}>
        <Typography id="rating-modal-title" className="recommendations-modal-title" variant="h5" gutterBottom>
          Rate Your Experience
        </Typography>
        <Paper elevation={0} className="recommendations-modal-rating" style={{ background: "transparent", boxShadow: "none" }}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1">System Satisfaction</Typography>
                <Rating
                  value={ratings.system_satisfaction_score}
                  onChange={(event, newValue) => handleRatingChange('system_satisfaction_score', newValue)}
                  precision={0.5}
                />
                <Typography variant="caption" color="text.secondary">
                  Average Rating: {averageRatings.system_satisfaction_score.toFixed(1)} / 5.0
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1">Analytics Satisfaction</Typography>
                <Rating
                  value={ratings.analytics_satisfaction_score}
                  onChange={(event, newValue) => handleRatingChange('analytics_satisfaction_score', newValue)}
                  precision={0.5}
                />
                <Typography variant="caption" color="text.secondary">
                  Average Rating: {averageRatings.analytics_satisfaction_score.toFixed(1)} / 5.0
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sx={{ mb: 0, pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5, mb: 0, pb: 0 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitAndClose}
                  disabled={ratings.system_satisfaction_score === 0 || ratings.analytics_satisfaction_score === 0}
                >
                  Submit Rating
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Modal>
  );
};

export default RatingModal;