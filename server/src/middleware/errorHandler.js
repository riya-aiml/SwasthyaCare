/**
 * Centralized Error Handler Middleware
 * Catches all errors and sends consistent JSON responses
 */

const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);

  // Default to 500 server error if no status code is set
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      // Only show stack trace in development mode
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export default errorHandler;
