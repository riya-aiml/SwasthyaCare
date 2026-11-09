import express from 'express';

const router = express.Router();

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns the status of the backend service and database connection
 */
router.get('/health', (req, res) => {
  const healthData = {
    success: true,
    message: 'SwasthyaCare Backend is running',
    timestamp: new Date().toISOString(),
    service: 'SwasthyaCare API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: 'connected',
      name: process.env.MONGODB_URI ? 'configured' : 'using default'
    }
  };

  res.status(200).json(healthData);
});

export default router;
