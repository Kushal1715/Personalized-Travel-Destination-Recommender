const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  climate: {
    type: Number,
    required: [true, 'Climate rating is required'],
    min: [1, 'Climate must be between 1 and 5'],
    max: [5, 'Climate must be between 1 and 5']
  },
  budget: {
    type: Number,
    required: [true, 'Budget rating is required'],
    min: [1, 'Budget must be between 1 and 5'],
    max: [5, 'Budget must be between 1 and 5']
  },
  adventure: {
    type: Number,
    required: [true, 'Adventure rating is required'],
    min: [1, 'Adventure must be between 1 and 5'],
    max: [5, 'Adventure must be between 1 and 5']
  },
  culture: {
    type: Number,
    required: [true, 'Culture rating is required'],
    min: [1, 'Culture must be between 1 and 5'],
    max: [5, 'Culture must be between 1 and 5']
  },
  nature: {
    type: Number,
    required: [true, 'Nature rating is required'],
    min: [1, 'Nature must be between 1 and 5'],
    max: [5, 'Nature must be between 1 and 5']
  },
  nightlife: {
    type: Number,
    required: [true, 'Nightlife rating is required'],
    min: [1, 'Nightlife must be between 1 and 5'],
    max: [5, 'Nightlife must be between 1 and 5']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  imageUrl: {
    type: String
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
destinationSchema.index({ country: 1 });
destinationSchema.index({ climate: 1, budget: 1, adventure: 1, culture: 1, nature: 1, nightlife: 1 });
destinationSchema.index({ name: 'text', country: 'text', description: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);
