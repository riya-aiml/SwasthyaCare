import User from './user.model.js';

/**
 * User Profile Controller
 * Handles user profile operations
 */

/**
 * Get user profile by ID
 * GET /api/users/:id
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is viewing their own profile or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to view this profile.',
        },
      });
    }

    const user = await User.findById(userId);

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
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user profile.',
      },
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/:id
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to update this profile.',
        },
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'firstName',
      'lastName',
      'phoneNumber',
      'dateOfBirth',
      'gender',
      'address',
      'emergencyContact',
      'profilePicture',
    ];

    // Fields that only doctors can update
    const doctorFields = ['specialization', 'experience'];

    // Fields that only admins can update
    const adminFields = ['role', 'isActive', 'isEmailVerified'];

    const updates = {};

    // Filter allowed updates
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Allow doctors to update doctor-specific fields
    if (req.user.role === 'doctor') {
      for (const key of doctorFields) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
    }

    // Allow admins to update admin-only fields
    if (req.user.role === 'admin') {
      for (const key of adminFields) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
    }

    // Prevent password updates through this endpoint
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password cannot be updated through this endpoint. Use /api/auth/change-password instead.',
        },
      });
    }

    // Prevent email updates (email is the unique identifier)
    if (req.body.email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email cannot be changed.',
        },
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

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
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile.',
      },
    });
  }
};

/**
 * Delete user account
 * DELETE /api/users/:id
 */
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only admins can delete accounts, or users can delete their own
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to delete this account.',
        },
      });
    }

    // Soft delete: just deactivate the account
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

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
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete account.',
      },
    });
  }
};

/**
 * Get all users (Admin only)
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => user.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          usersPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get users.',
      },
    });
  }
};
