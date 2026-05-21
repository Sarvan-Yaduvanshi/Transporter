const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Global middleware ──────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const firebaseAdmin = require('./config/firebaseAdmin');
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    firebase: firebaseAdmin.$initStatus,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || 'false',
      HAS_MONGO_URI: !!process.env.MONGO_URI,
      HAS_FIREBASE_ENV: !!process.env.FIREBASE_SERVICE_ACCOUNT
    }
  });
});

// ── API routes ─────────────────────────────────────────────
app.use('/api', routes);

// ── 404 fallback ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler (must be last) ───────────────────────────
app.use(errorHandler);

module.exports = app;
