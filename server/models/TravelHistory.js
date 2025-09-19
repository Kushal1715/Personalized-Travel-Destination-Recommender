const mongoose = require('mongoose');

const travelHistorySchema = new mongoose.Schema({
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
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  photos: [{
    type: String,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Photo must be a valid URL'
    }
  }],
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  travelCompanions: {
    type: String,
    required: [true, 'Travel companions is required'],
    enum: ['solo', 'couple', 'family', 'friends', 'business', 'group'],
    default: 'solo'
  },
  accommodation: {
    type: String,
    enum: ['hotel', 'resort', 'hostel', 'airbnb', 'camping', 'other']
  },
  transportation: {
    type: String,
    enum: ['plane', 'train', 'bus', 'car', 'boat', 'other']
  },
  activities: [{
    type: String,
    maxlength: [100, 'Activity name cannot exceed 100 characters']
  }],
  highlights: [{
    type: String,
    maxlength: [200, 'Highlight cannot exceed 200 characters']
  }],
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true
});

// Create indexes for better query performance
travelHistorySchema.index({ userId: 1, visitDate: -1 });
travelHistorySchema.index({ destinationId: 1 });
travelHistorySchema.index({ userId: 1, rating: -1 });
travelHistorySchema.index({ visitDate: -1 });

// Virtual for formatted visit date
travelHistorySchema.virtual('formattedVisitDate').get(function() {
  return this.visitDate.toLocaleDateString();
});

// Virtual for trip duration in days
travelHistorySchema.virtual('durationInDays').get(function() {
  return this.duration;
});

// Method to calculate trip cost per day
travelHistorySchema.methods.getCostPerDay = function() {
  if (this.duration > 0) {
    return Math.round(this.cost / this.duration * 100) / 100;
  }
  return 0;
};

// Method to get trip summary
travelHistorySchema.methods.getSummary = function() {
  return {
    destination: this.destinationId?.name || 'Unknown',
    visitDate: this.formattedVisitDate,
    duration: this.durationInDays,
    rating: this.rating,
    cost: this.cost,
    companions: this.travelCompanions
  };
};

module.exports = mongoose.model('TravelHistory', travelHistorySchema);