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
    required: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  photos: [{
    type: String
  }],
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 day']
  },
  travelCompanions: {
    type: String,
    enum: ['solo', 'couple', 'family', 'friends', 'business']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
travelHistorySchema.index({ userId: 1, visitDate: -1 });
travelHistorySchema.index({ destinationId: 1 });
travelHistorySchema.index({ userId: 1, destinationId: 1 }, { unique: true });

module.exports = mongoose.model('TravelHistory', travelHistorySchema);
