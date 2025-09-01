const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Store all preferences as flexible fields
  budget: String,
  travelStyle: [String],
  interests: [String],
  preferredClimate: String,
  preferredDuration: String,
  preferredSeason: String,
  accommodationType: String,
  transportationPreference: String,
  groupSize: String,
  accessibility: [String],
  // Allow any additional fields
  [String]: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  strict: false // Allow additional fields
});

// Create index for better query performance
userPreferenceSchema.index({ userId: 1 });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
