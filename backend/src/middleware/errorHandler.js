/**
 * Central error-handling middleware.
 * Catches all errors forwarded by controllers / asyncHandler.
 */
const errorHandler = (err, _req, res, _next) => {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
