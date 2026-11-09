import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
} from './user.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();

/**
 * User Routes
 * Base path: /api/users
 * All routes require authentication
 */

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize('admin'), getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Private (Own profile or Admin)
 */
router.get('/:id', authenticate, getUserProfile);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (Own profile or Admin)
 */
router.put('/:id', authenticate, updateUserProfile);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete/deactivate user account
 * @access  Private (Own profile or Admin)
 */
router.delete('/:id', authenticate, deleteUserAccount);

export default router;
