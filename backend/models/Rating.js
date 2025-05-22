const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    system_satisfaction_score: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    analytics_satisfaction_score: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Rating', ratingSchema); 