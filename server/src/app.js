import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import doctorRoutes from './modules/doctors/doctor.routes.js';
import appointmentRoutes from './modules/appointments/appointment.routes.js';
import followUpRoutes from './modules/followups/followUp.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import assessmentRoutes from './modules/assessments/assessment.routes.js';
import dashboardRoutes from './modules/dashboards/dashboard.routes.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Port configuration
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing (allows frontend to call backend)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logger middleware (helps us see what requests are coming in)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/ai', aiRoutes); // Sprint 6: AI Clinical Decision Support & ML Current-Status
app.use('/api/assessments', assessmentRoutes); // Sprint 7: ML Risk Assessments & History
app.use('/api/dashboards', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Welcome to SwasthyaCare API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      documentation: '/api/docs'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the Express server
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Local URL: http://localhost:${PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
