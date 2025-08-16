const express = require('express');
const { 
  getUserPreferences, 
  updateUserPreferences, 
  deleteUserPreferences 
} = require('../controllers/preferencesController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user preferences
router.get('/', getUserPreferences);

// Create or update user preferences
router.post('/', updateUserPreferences);

// Update user preferences
router.put('/', updateUserPreferences);

// Delete user preferences
router.delete('/', deleteUserPreferences);

module.exports = router;
