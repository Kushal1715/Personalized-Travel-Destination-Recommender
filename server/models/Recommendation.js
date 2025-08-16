const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  algorithm: {
    type: String,
    enum: ['cosine_similarity', 'ahp', 'hybrid'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: [0, 'Score cannot be negative'],
    max: [1, 'Score cannot exceed 1']
  },
  factors: {
    climate: Number,
    budget: Number,
    adventure: Number,
    culture: Number,
    nature: Number,
    nightlife: Number
  },
  explanation: {
    type: String,
    maxlength: [500, 'Explanation cannot exceed 500 characters']
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  isBookmarked: {
    type: Boolean,
    default: false
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
recommendationSchema.index({ userId: 1, score: -1 });
recommendationSchema.index({ userId: 1, algorithm: 1 });
recommendationSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);
