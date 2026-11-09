import mongoose from 'mongoose';

/**
 * Doctor Profile Schema
 * Extended information for users with role 'doctor'
 */
const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Medical specialty is required'],
      trim: true,
      index: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    experienceYears: {
      type: Number,
      default: 5,
      min: [0, 'Experience cannot be negative'],
    },
    hospital: {
      type: String,
      required: [true, 'Hospital or clinic affiliation is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
      default: 'General OPD',
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 500,
      min: [0, 'Fee cannot be negative'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    isAvailableForOnlineConsult: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approved for development/demo baseline
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
    },
  },
  {
    timestamps: true,
  }
);

// Search index on name, specialty, and hospital for directory search
doctorProfileSchema.index({
  fullName: 'text',
  specialty: 'text',
  hospital: 'text',
});

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

export default DoctorProfile;
