const express = require('express');
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  refreshToken
} = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin 
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/profile', authenticateToken, getCurrentUser);
router.post('/refresh', authenticateToken, refreshToken);

module.exports = router;
