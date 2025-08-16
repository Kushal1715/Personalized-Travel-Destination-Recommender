const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_recommender';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    console.log(`🍃 Host: ${mongoose.connection.host}`);
    console.log(`🍃 Port: ${mongoose.connection.port}`);
    console.log(`🍃 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
