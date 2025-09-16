const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getAnalytics
} = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.patch('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Destination management
router.get('/destinations', getDestinations);
router.post('/destinations', createDestination);
router.patch('/destinations/:destinationId', updateDestination);
router.delete('/destinations/:destinationId', deleteDestination);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
