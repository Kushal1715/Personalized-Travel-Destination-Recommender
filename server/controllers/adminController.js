const User = require('../models/User');
const Destination = require('../models/Destination');
const UserPreference = require('../models/UserPreference');
const Recommendation = require('../models/Recommendation');
const TravelHistory = require('../models/TravelHistory');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalDestinations,
      totalRecommendations,
      totalPreferences,
      recentUsers,
      topDestinations,
      recommendationStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Destination.countDocuments(),
      Recommendation.countDocuments(),
      UserPreference.countDocuments(),
      User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt'),
      Destination.find()
        .sort({ averageRating: -1 })
        .limit(5)
        .select('name country averageRating totalReviews'),
      Recommendation.aggregate([
        {
          $group: {
            _id: '$algorithm',
            count: { $sum: 1 },
            avgScore: { $avg: '$score' }
          }
        }
      ])
    ]);

    // Calculate growth metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsersThisMonth,
      newRecommendationsThisMonth
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Recommendation.countDocuments({ generatedAt: { $gte: thirtyDaysAgo } })
    ]);

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalDestinations,
        totalRecommendations,
        totalPreferences,
        newUsersThisMonth,
        newRecommendationsThisMonth
      },
      recentUsers,
      topDestinations,
      recommendationStats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user role or status
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      UserPreference.deleteMany({ userId }),
      Recommendation.deleteMany({ userId }),
      TravelHistory.deleteMany({ userId })
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all destinations with pagination
const getDestinations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', country = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    if (country) filter.country = country;

    const [destinations, total] = await Promise.all([
      Destination.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Destination.countDocuments(filter)
    ]);

    res.json({
      destinations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDestinations: total,
        hasNext: skip + destinations.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new destination
const createDestination = async (req, res) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();

    res.status(201).json({ message: 'Destination created successfully', destination });
  } catch (error) {
    console.error('Create destination error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation error', details: errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update destination
const updateDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;
    
    const destination = await Destination.findByIdAndUpdate(
      destinationId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ message: 'Destination updated successfully', destination });
  } catch (error) {
    console.error('Update destination error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation error', details: errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete destination
const deleteDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const destination = await Destination.findByIdAndDelete(destinationId);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    // Also delete related recommendations
    await Recommendation.deleteMany({ destinationId });

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get system analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User analytics
    const userAnalytics = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Recommendation analytics
    const recommendationAnalytics = await Recommendation.aggregate([
      {
        $match: { generatedAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$generatedAt' },
            month: { $month: '$generatedAt' },
            day: { $dayOfMonth: '$generatedAt' }
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Algorithm performance
    const algorithmPerformance = await Recommendation.aggregate([
      {
        $group: {
          _id: '$algorithm',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' }
        }
      }
    ]);

    // Top countries by recommendations
    const topCountries = await Recommendation.aggregate([
      {
        $lookup: {
          from: 'destinations',
          localField: 'destinationId',
          foreignField: '_id',
          as: 'destination'
        }
      },
      {
        $unwind: '$destination'
      },
      {
        $group: {
          _id: '$destination.country',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      period: `${days} days`,
      userAnalytics,
      recommendationAnalytics,
      algorithmPerformance,
      topCountries
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getAnalytics
};
