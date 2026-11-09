import { validationResult } from 'express-validator';
import User from '../users/user.model.js';
import { generateToken } from '../../utils/jwt.js';

/**
 * Authentication Controller
 * Handles user registration, login, and logout
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const { email, password, firstName, lastName, role, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email already registered. Please use a different email or log in.',
        },
      });
    }

    // Create new user
    const user = new User({
      email,
      password, // Will be hashed by the pre-save middleware
      firstName,
      lastName,
      role: role || 'patient', // Default to patient if no role specified
      phoneNumber,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Get public profile (without password)
    const userProfile = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userProfile,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed. Please try again.',
      },
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password.',
        },
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Your account has been deactivated. Please contact support.',
        },
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password.',
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Get public profile
    const userProfile = user.getPublicProfile();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userProfile,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed. Please try again.',
      },
    });
  }
};

/**
 * Get current logged-in user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found.',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user information.',
      },
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 *
 * Note: With JWT, logout is primarily handled on the client side
 * by removing the token. This endpoint is for logging purposes
 * and can be extended later for token blacklisting.
 */
export const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you could:
    // 1. Add token to a blacklist in Redis
    // 2. Log the logout event
    // 3. Clear any server-side session data

    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed.',
      },
    });
  }
};
