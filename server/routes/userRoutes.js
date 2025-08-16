const express = require('express');
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser 
} = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/profile', authenticateToken, getCurrentUser);

module.exports = router;
