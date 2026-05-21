const app = require('./src/app');
const connectDB = require('./src/config/db');

// In serverless, we maintain a cached database connection across function invocations
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  // Connect to database
  await connectDB();
  isConnected = true;
};

// Middleware wrapper to ensure database connection is established before serving any requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Failed to establish database connection in serverless function:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please try again later.'
    });
  }
});

module.exports = app;
