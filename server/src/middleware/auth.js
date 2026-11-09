import { verifyToken, extractToken } from '../utils/jwt.js';
import User from '../modules/users/user.model.js';

/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 * Adds user information to req.user if authenticated
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No token provided.',
        },
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database (without password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found.',
        },
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is deactivated.',
        },
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token.',
      },
    });
  }
};

/**
 * Authorization Middleware Factory
 * Creates middleware to check if user has required role(s)
 * @param {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required.',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to access this resource.',
        },
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't reject if no token
 * Useful for routes that change behavior based on auth but don't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail - user just won't be authenticated
  }

  next();
};
