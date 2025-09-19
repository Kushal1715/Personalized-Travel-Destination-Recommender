const User = require('../models/User');
const Destination = require('../models/Destination');
const Recommendation = require('../models/Recommendation');
const TravelHistory = require('../models/TravelHistory');
const UserPreference = require('../models/UserPreference');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalDestinations,
      totalRecommendations,
      totalPreferences,
      newUsersThisMonth,
      newRecommendationsThisMonth,
      recentUsers,
      topDestinations,
      recommendationStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Destination.countDocuments(),
      Recommendation.countDocuments(),
      UserPreference.countDocuments(),
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      Recommendation.countDocuments({
        generatedAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      User.find()
        .select('name email createdAt role')
        .sort({ createdAt: -1 })
        .limit(5),
      Destination.find()
        .select('name country averageRating totalReviews')
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(5),
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

    const overview = {
      totalUsers,
      activeUsers,
      totalDestinations,
      totalRecommendations,
      totalPreferences,
      newUsersThisMonth,
      newRecommendationsThisMonth
    };

    res.json({
      overview,
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
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
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

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

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

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const [travelHistoryCount, recommendationsCount, preferences] = await Promise.all([
      TravelHistory.countDocuments({ userId: id }),
      Recommendation.countDocuments({ userId: id }),
      UserPreference.findOne({ userId: id })
    ]);

    res.json({
      user: {
        ...user.toObject(),
        stats: {
          travelHistoryCount,
          recommendationsCount,
          hasPreferences: !!preferences
        }
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data if present
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete related data
    await Promise.all([
      TravelHistory.deleteMany({ userId: id }),
      Recommendation.deleteMany({ userId: id }),
      UserPreference.deleteMany({ userId: id }),
      User.findByIdAndDelete(id)
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
    const { page = 1, limit = 20, search = '', country = '' } = req.query;
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
    if (country) filter.country = { $regex: country, $options: 'i' };

    const destinations = await Destination.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Destination.countDocuments(filter);

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

// Create destination
const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);

    res.status(201).json({
      message: 'Destination created successfully',
      destination
    });
  } catch (error) {
    console.error('Create destination error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update destination
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({
      message: 'Destination updated successfully',
      destination
    });
  } catch (error) {
    console.error('Update destination error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete destination
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if destination exists
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    // Delete related data
    await Promise.all([
      TravelHistory.deleteMany({ destinationId: id }),
      Recommendation.deleteMany({ destinationId: id }),
      Destination.findByIdAndDelete(id)
    ]);

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      userGrowth,
      recommendationTrends,
      popularDestinations,
      userEngagement,
      systemStats
    ] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Recommendation.aggregate([
        { $match: { generatedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$generatedAt' } },
            count: { $sum: 1 },
            avgScore: { $avg: '$score' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Destination.aggregate([
        {
          $lookup: {
            from: 'recommendations',
            localField: '_id',
            foreignField: 'destinationId',
            as: 'recommendations'
          }
        },
        {
          $lookup: {
            from: 'travelhistories',
            localField: '_id',
            foreignField: 'destinationId',
            as: 'travelHistory'
          }
        },
        {
          $addFields: {
            recommendationCount: { $size: '$recommendations' },
            travelCount: { $size: '$travelHistory' },
            totalEngagement: {
              $add: [
                { $size: '$recommendations' },
                { $size: '$travelHistory' }
              ]
            }
          }
        },
        { $sort: { totalEngagement: -1 } },
        { $limit: 10 }
      ]),
      User.aggregate([
        {
          $lookup: {
            from: 'travelhistories',
            localField: '_id',
            foreignField: 'userId',
            as: 'travelHistory'
          }
        },
        {
          $lookup: {
            from: 'recommendations',
            localField: '_id',
            foreignField: 'userId',
            as: 'recommendations'
          }
        },
        {
          $addFields: {
            travelCount: { $size: '$travelHistory' },
            recommendationCount: { $size: '$recommendations' },
            engagementScore: {
              $add: [
                { $multiply: [{ $size: '$travelHistory' }, 2] },
                { $size: '$recommendations' }
              ]
            }
          }
        },
        { $sort: { engagementScore: -1 } },
        { $limit: 10 }
      ]),
      {
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ isActive: true }),
        totalDestinations: await Destination.countDocuments(),
        totalRecommendations: await Recommendation.countDocuments(),
        totalTravelHistory: await TravelHistory.countDocuments(),
        avgRecommendationScore: await Recommendation.aggregate([
          { $group: { _id: null, avgScore: { $avg: '$score' } } }
        ])
      }
    ]);

    res.json({
      userGrowth,
      recommendationTrends,
      popularDestinations,
      userEngagement,
      systemStats: {
        ...systemStats,
        avgRecommendationScore: systemStats.avgRecommendationScore[0]?.avgScore || 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
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
};