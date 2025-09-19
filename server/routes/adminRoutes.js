const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getAnalytics
} = require('../controllers/adminController');

// All admin routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Analytics
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Destination management
router.get('/destinations', getDestinations);
router.post('/destinations', createDestination);
router.put('/destinations/:id', updateDestination);
router.delete('/destinations/:id', deleteDestination);

module.exports = router;