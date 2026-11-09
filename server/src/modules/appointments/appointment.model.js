import mongoose from 'mongoose';

/**
 * Appointment Schema
 * Tracks patient appointment requests and their lifecycle
 *
 * State Machine:
 * PENDING → APPROVED → COMPLETED
 *        → REJECTED
 *        → CANCELLED
 * APPROVED → CANCELLED
 *          → NO_SHOW
 */
const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    doctorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Doctor profile reference is required'],
    },
    availabilitySlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AvailabilitySlot',
      required: [true, 'Availability slot reference is required'],
      index: true,
    },
    // Denormalized for quick queries
    appointmentDate: {
      type: String,
      required: true,
      index: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'PENDING',
      required: true,
      index: true,
    },
    consultationType: {
      type: String,
      enum: ['in-person', 'video'],
      default: 'in-person',
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    // Decision tracking
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
    },
    // Consultation notes (added after appointment)
    consultationNotes: {
      type: String,
      trim: true,
    },
    prescription: {
      type: String,
      trim: true,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for preventing double-booking on same slot
appointmentSchema.index({ availabilitySlot: 1, status: 1 });

// Index for quick patient/doctor history queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });

/**
 * State transition validator
 * Ensures only valid state changes are allowed
 */
appointmentSchema.methods.canTransitionTo = function (newStatus) {
  const currentStatus = this.status;

  const allowedTransitions = {
    PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
    REJECTED: [],
    CANCELLED: [],
    COMPLETED: [],
    NO_SHOW: [],
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
