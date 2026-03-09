const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB Connection Failed: ${err.message}`);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;