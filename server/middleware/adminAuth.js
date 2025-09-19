const User = require('../models/User');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // Check if user exists in request (from auth middleware)
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from database to check current role
    const user = await User.findById(req.user.userId).select('role isActive');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin privileges required',
        message: 'This action requires administrator access'
      });
    }

    // Add admin flag to request
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = adminAuth;