const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  handleValidationErrors
];

// Destination validation rules
const validateDestination = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination name must be between 2 and 100 characters'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('climate')
    .isInt({ min: 1, max: 5 })
    .withMessage('Climate rating must be between 1 and 5'),
  body('budget')
    .isInt({ min: 1, max: 5 })
    .withMessage('Budget rating must be between 1 and 5'),
  body('adventure')
    .isInt({ min: 1, max: 5 })
    .withMessage('Adventure rating must be between 1 and 5'),
  body('culture')
    .isInt({ min: 1, max: 5 })
    .withMessage('Culture rating must be between 1 and 5'),
  body('nature')
    .isInt({ min: 1, max: 5 })
    .withMessage('Nature rating must be between 1 and 5'),
  body('nightlife')
    .isInt({ min: 1, max: 5 })
    .withMessage('Nightlife rating must be between 1 and 5'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('averageRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Average rating must be between 0 and 5'),
  body('totalReviews')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total reviews must be a non-negative integer'),
  handleValidationErrors
];

// Travel history validation rules
const validateTravelHistory = [
  body('destinationId')
    .isMongoId()
    .withMessage('Valid destination ID is required'),
  body('visitDate')
    .isISO8601()
    .withMessage('Valid visit date is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('duration')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  body('travelCompanions')
    .isIn(['solo', 'couple', 'family', 'friends', 'business', 'group'])
    .withMessage('Invalid travel companions value'),
  body('accommodation')
    .optional()
    .isIn(['hotel', 'resort', 'hostel', 'airbnb', 'camping', 'other'])
    .withMessage('Invalid accommodation type'),
  body('transportation')
    .optional()
    .isIn(['plane', 'train', 'bus', 'car', 'boat', 'other'])
    .withMessage('Invalid transportation type'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array'),
  body('activities.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each activity name cannot exceed 100 characters'),
  body('highlights')
    .optional()
    .isArray()
    .withMessage('Highlights must be an array'),
  body('highlights.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each highlight cannot exceed 200 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters'),
  body('wouldRecommend')
    .optional()
    .isBoolean()
    .withMessage('Would recommend must be a boolean value'),
  handleValidationErrors
];

// User preferences validation rules
const validateUserPreferences = [
  body('budget')
    .optional()
    .isIn(['Budget', 'Moderate', 'Luxury', 'Ultra-Luxury'])
    .withMessage('Invalid budget preference'),
  body('travelStyle')
    .optional()
    .isArray()
    .withMessage('Travel style must be an array'),
  body('travelStyle.*')
    .optional()
    .isIn(['Adventure', 'Relaxation', 'Cultural', 'Food & Wine', 'Nature', 'Urban', 'Historical', 'Romantic', 'Family-Friendly'])
    .withMessage('Invalid travel style option'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('interests.*')
    .optional()
    .isIn(['Museums', 'Beaches', 'Mountains', 'Shopping', 'Nightlife', 'Hiking', 'Photography', 'Local Markets', 'Architecture', 'Wildlife', 'Spa & Wellness', 'Sports'])
    .withMessage('Invalid interest option'),
  body('preferredClimate')
    .optional()
    .isIn(['Tropical', 'Mediterranean', 'Temperate', 'Cold', 'Desert', 'Any'])
    .withMessage('Invalid climate preference'),
  body('preferredDuration')
    .optional()
    .isIn(['Weekend', 'Week', 'Two Weeks', 'Month', 'Long Term'])
    .withMessage('Invalid duration preference'),
  body('preferredSeason')
    .optional()
    .isIn(['Spring', 'Summer', 'Fall', 'Winter', 'Any'])
    .withMessage('Invalid season preference'),
  body('accommodationType')
    .optional()
    .isIn(['Hotel', 'Resort', 'Hostel', 'Vacation Rental', 'Camping', 'Any'])
    .withMessage('Invalid accommodation type'),
  body('transportationPreference')
    .optional()
    .isIn(['Public Transport', 'Rental Car', 'Walking', 'Bicycle', 'Guided Tours', 'Any'])
    .withMessage('Invalid transportation preference'),
  body('groupSize')
    .optional()
    .isIn(['Solo', 'Couple', 'Family', 'Small Group', 'Large Group'])
    .withMessage('Invalid group size'),
  body('accessibility')
    .optional()
    .isArray()
    .withMessage('Accessibility must be an array'),
  body('accessibility.*')
    .optional()
    .isIn(['Wheelchair Accessible', 'Elevator Access', 'Ground Floor Rooms', 'Accessible Bathrooms', 'Sign Language', 'Audio Guides', 'None'])
    .withMessage('Invalid accessibility option'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateDestination,
  validateTravelHistory,
  validateUserPreferences,
  validateObjectId,
  validatePagination,
  validateSearch
};