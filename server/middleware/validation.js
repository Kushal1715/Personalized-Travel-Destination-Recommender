const { body, validationResult } = require('express-validator');

// Validation middleware
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

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// User login validation
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

// User profile update validation
const validateUserProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Destination validation
const validateDestination = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination name must be between 2 and 100 characters'),
  
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
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
  
  handleValidationErrors
];

// Travel history validation
const validateTravelHistory = [
  body('destinationId')
    .isMongoId()
    .withMessage('Invalid destination ID'),
  
  body('visitDate')
    .isISO8601()
    .withMessage('Visit date must be a valid date'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review must be no more than 1000 characters'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  
  body('travelCompanions')
    .optional()
    .isIn(['solo', 'couple', 'family', 'friends', 'business'])
    .withMessage('Invalid travel companions value'),
  
  handleValidationErrors
];

// User preferences validation
const validateUserPreferences = [
  body('budget')
    .optional()
    .isIn(['1', '2', '3', '4', '5'])
    .withMessage('Budget must be between 1 and 5'),
  
  body('travelStyle')
    .optional()
    .isArray()
    .withMessage('Travel style must be an array'),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('climate')
    .optional()
    .isIn(['tropical', 'temperate', 'continental', 'polar'])
    .withMessage('Invalid climate value'),
  
  body('duration')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserProfileUpdate,
  validatePasswordChange,
  validateDestination,
  validateTravelHistory,
  validateUserPreferences,
  handleValidationErrors
};
