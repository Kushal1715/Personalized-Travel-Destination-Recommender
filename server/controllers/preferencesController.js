const UserPreference = require('../models/UserPreference');

// Get user preferences
const getUserPreferences = async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({ userId: req.user._id });

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create or update user preferences - SIMPLIFIED VERSION
const updateUserPreferences = async (req, res) => {
  try {
    // Just store whatever data comes in without validation
    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        ...req.body, // Store all incoming data as-is
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user preferences
const deleteUserPreferences = async (req, res) => {
  try {
    await UserPreference.findOneAndDelete({ userId: req.user._id });

    res.json({ message: 'Preferences deleted successfully' });
  } catch (error) {
    console.error('Delete preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  deleteUserPreferences
};
