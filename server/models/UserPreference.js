const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  climate: {
    type: Number,
    required: [true, 'Climate preference is required'],
    min: [1, 'Climate must be between 1 and 5'],
    max: [5, 'Climate must be between 1 and 5']
  },
  budget: {
    type: Number,
    required: [true, 'Budget preference is required'],
    min: [1, 'Budget must be between 1 and 5'],
    max: [5, 'Budget must be between 1 and 5']
  },
  adventure: {
    type: Number,
    required: [true, 'Adventure preference is required'],
    min: [1, 'Adventure must be between 1 and 5'],
    max: [5, 'Adventure must be between 1 and 5']
  },
  culture: {
    type: Number,
    required: [true, 'Culture preference is required'],
    min: [1, 'Culture must be between 1 and 5'],
    max: [5, 'Culture must be between 1 and 5']
  },
  nature: {
    type: Number,
    required: [true, 'Nature preference is required'],
    min: [1, 'Nature must be between 1 and 5'],
    max: [5, 'Nature must be between 1 and 5']
  },
  nightlife: {
    type: Number,
    required: [true, 'Nightlife preference is required'],
    min: [1, 'Nightlife must be between 1 and 5'],
    max: [5, 'Nightlife must be between 1 and 5']
  }
}, {
  timestamps: true
});

// Create index for better query performance
userPreferenceSchema.index({ userId: 1 });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
