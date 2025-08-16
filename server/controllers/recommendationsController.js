const UserPreference = require('../models/UserPreference');
const Destination = require('../models/Destination');
const Recommendation = require('../models/Recommendation');
const TravelHistory = require('../models/TravelHistory');
const CosineSimilarityRecommender = require('../ml/cosineSimilarity');
const HybridRecommender = require('../ml/hybridRecommender');

const cosineRecommender = new CosineSimilarityRecommender();
const hybridRecommender = new HybridRecommender();

// Get personalized recommendations for user
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { algorithm = 'hybrid', limit = 10 } = req.query;
    const userId = req.user._id;

    // Get user preferences
    const userPreferences = await UserPreference.findOne({ userId });
    if (!userPreferences) {
      return res.status(404).json({ 
        error: 'User preferences not found. Please set your travel preferences first.' 
      });
    }

    // Get all destinations
    const destinations = await Destination.find();
    if (destinations.length === 0) {
      return res.status(404).json({ error: 'No destinations available' });
    }

    let recommendations = [];

    // Generate recommendations based on algorithm
    if (algorithm === 'cosine') {
      recommendations = cosineRecommender.getRecommendations(userPreferences, destinations, limit);
    } else if (algorithm === 'hybrid') {
      recommendations = hybridRecommender.getRecommendations(userPreferences, destinations, limit);
    } else {
      return res.status(400).json({ error: 'Invalid algorithm. Use "cosine" or "hybrid"' });
    }

    // Save recommendations to database
    const recommendationPromises = recommendations.map(rec => {
      return Recommendation.findOneAndUpdate(
        { userId, destinationId: rec.destinationId },
        {
          userId,
          destinationId: rec.destinationId,
          algorithm,
          score: rec.finalScore || rec.similarity,
          factors: rec.factors,
          explanation: rec.explanation,
          isViewed: false,
          isBookmarked: false
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(recommendationPromises);

    res.json({
      algorithm,
      recommendations,
      userPreferences: {
        climate: userPreferences.climate,
        budget: userPreferences.budget,
        adventure: userPreferences.adventure,
        culture: userPreferences.culture,
        nature: userPreferences.nature,
        nightlife: userPreferences.nightlife
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's recommendation history
const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { algorithm, limit = 20, page = 1 } = req.query;

    const filter = { userId };
    if (algorithm) filter.algorithm = algorithm;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const recommendations = await Recommendation.find(filter)
      .populate('destinationId', 'name country city description imageUrl averageRating')
      .sort({ score: -1, generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recommendation.countDocuments(filter);

    res.json({
      recommendations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecommendations: total,
        hasNext: skip + recommendations.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get user recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark recommendation as viewed
const markRecommendationViewed = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user._id;

    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: recommendationId, userId },
      { isViewed: true },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json({ message: 'Recommendation marked as viewed', recommendation });
  } catch (error) {
    console.error('Mark recommendation viewed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle recommendation bookmark
const toggleRecommendationBookmark = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user._id;

    const recommendation = await Recommendation.findOne({ _id: recommendationId, userId });
    
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    recommendation.isBookmarked = !recommendation.isBookmarked;
    await recommendation.save();

    res.json({ 
      message: `Recommendation ${recommendation.isBookmarked ? 'bookmarked' : 'unbookmarked'}`,
      recommendation 
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get recommendation analysis
const getRecommendationAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const { destinationId } = req.params;

    const userPreferences = await UserPreference.findOne({ userId });
    const destination = await Destination.findById(destinationId);

    if (!userPreferences || !destination) {
      return res.status(404).json({ error: 'User preferences or destination not found' });
    }

    // Get analysis from hybrid recommender
    const analysis = hybridRecommender.analyzeRecommendation(userPreferences, destination);

    res.json({ analysis });
  } catch (error) {
    console.error('Get recommendation analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get recommendation insights
const getRecommendationInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const [userPreferences, recommendations, travelHistory] = await Promise.all([
      UserPreference.findOne({ userId }),
      Recommendation.find({ userId }).populate('destinationId', 'country climate budget adventure culture nature nightlife'),
      TravelHistory.find({ userId }).populate('destinationId', 'country climate budget adventure culture nature nightlife')
    ]);

    if (!userPreferences) {
      return res.status(404).json({ error: 'User preferences not found' });
    }

    // Calculate insights
    const insights = {
      totalRecommendations: recommendations.length,
      viewedRecommendations: recommendations.filter(r => r.isViewed).length,
      bookmarkedRecommendations: recommendations.filter(r => r.isBookmarked).length,
      averageRecommendationScore: recommendations.length > 0 
        ? recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length 
        : 0,
      topCountries: recommendations
        .map(r => r.destinationId?.country)
        .filter(Boolean)
        .reduce((acc, country) => {
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {}),
      preferenceMatch: {
        climate: userPreferences.climate,
        budget: userPreferences.budget,
        adventure: userPreferences.adventure,
        culture: userPreferences.culture,
        nature: userPreferences.nature,
        nightlife: userPreferences.nightlife
      }
    };

    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getUserRecommendations,
  markRecommendationViewed,
  toggleRecommendationBookmark,
  getRecommendationAnalysis,
  getRecommendationInsights
};
