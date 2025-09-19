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
    required: true,
    enum: ['cosine', 'hybrid', 'collaborative'],
    default: 'hybrid'
  },
  score: {
    type: Number,
    required: true,
    min: [0, 'Score cannot be negative'],
    max: [1, 'Score cannot exceed 1']
  },
  factors: {
    climate: {
      type: Number,
      min: [0, 'Climate factor cannot be negative'],
      max: [1, 'Climate factor cannot exceed 1']
    },
    budget: {
      type: Number,
      min: [0, 'Budget factor cannot be negative'],
      max: [1, 'Budget factor cannot exceed 1']
    },
    adventure: {
      type: Number,
      min: [0, 'Adventure factor cannot be negative'],
      max: [1, 'Adventure factor cannot exceed 1']
    },
    culture: {
      type: Number,
      min: [0, 'Culture factor cannot be negative'],
      max: [1, 'Culture factor cannot exceed 1']
    },
    nature: {
      type: Number,
      min: [0, 'Nature factor cannot be negative'],
      max: [1, 'Nature factor cannot exceed 1']
    },
    nightlife: {
      type: Number,
      min: [0, 'Nightlife factor cannot be negative'],
      max: [1, 'Nightlife factor cannot exceed 1']
    }
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
  },
  viewedAt: {
    type: Date
  },
  bookmarkedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
recommendationSchema.index({ userId: 1, generatedAt: -1 });
recommendationSchema.index({ userId: 1, algorithm: 1 });
recommendationSchema.index({ userId: 1, isBookmarked: 1 });
recommendationSchema.index({ destinationId: 1 });
recommendationSchema.index({ score: -1 });

// Update viewedAt when isViewed changes
recommendationSchema.pre('save', function(next) {
  if (this.isModified('isViewed') && this.isViewed && !this.viewedAt) {
    this.viewedAt = new Date();
  }
  if (this.isModified('isBookmarked') && this.isBookmarked && !this.bookmarkedAt) {
    this.bookmarkedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Recommendation', recommendationSchema);