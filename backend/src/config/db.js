const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // In serverless / production environments, throwing the error allows Express middleware to handle it,
    // whereas process.exit(1) would crash the serverless container instantly.
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw err;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
