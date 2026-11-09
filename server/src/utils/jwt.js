import jwt from 'jsonwebtoken';

/**
 * JWT Utility Functions
 * Handles creating and verifying JWT tokens for authentication
 */

/**
 * Generate JWT Token
 * Creates a token containing the user's ID and role
 * @param {string} userId - MongoDB user ID
 * @param {string} role - User role (patient, doctor, admin, hospital_management)
 * @returns {string} JWT token
 */
export const generateToken = (userId, role) => {
  const payload = {
    id: userId,
    role: role,
  };

  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const options = {
    expiresIn: process.env.JWT_EXPIRE || '7d', // Token expires in 7 days
  };

  return jwt.sign(payload, secret, options);
};

/**
 * Verify JWT Token
 * Checks if a token is valid and not expired
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload (id, role)
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Extract token from Authorization header
 * Gets the token from "Bearer <token>" format
 * @param {object} req - Express request object
 * @returns {string|null} Token or null if not found
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  return null;
};
