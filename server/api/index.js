import app from '../src/app.js';
import connectDB from '../src/config/database.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in Vercel function:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Database connection failed: ' + err.message },
    });
  }
  return app(req, res);
}
