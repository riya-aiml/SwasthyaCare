import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Stores all user accounts (Patients, Doctors, Admins, Hospital Management)
 */
const userSchema = new mongoose.Schema(
  {
    // Basic Information
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'hospital_management'],
      default: 'patient',
      required: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Profile Picture (will be used later)
    profilePicture: {
      type: String,
    },

    // Doctor-specific fields (only used if role is 'doctor')
    specialization: {
      type: String,
    },
    licenseNumber: {
      type: String,
    },
    experience: {
      type: Number, // years of experience
    },

    // Emergency Contact (for patients)
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// ============================================
// MIDDLEWARE: Hash password before saving
// ============================================
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt (random string added to password for extra security)
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// METHOD: Compare entered password with hashed password
// ============================================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================================
// METHOD: Get public profile (without sensitive data)
// ============================================
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();

  // Remove sensitive fields
  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

// ============================================
// VIRTUAL: Full name
// ============================================
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Make sure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;
