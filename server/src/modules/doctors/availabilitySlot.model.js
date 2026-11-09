import mongoose from 'mongoose';

/**
 * Availability Slot Schema
 * Represents a bookable time window for a doctor
 */
const availabilitySlotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    doctorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor User reference is required'],
      index: true,
    },
    // Stored as ISO YYYY-MM-DD for deterministic date querying in UTC
    date: {
      type: String,
      required: [true, 'Date in YYYY-MM-DD format is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    // 24-hour HH:mm format
    startTime: {
      type: String,
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be HH:mm (24hr)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be HH:mm (24hr)'],
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 10,
      max: 120,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'booked', 'cancelled'],
      default: 'available',
      index: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPriority: {
      type: Boolean,
      default: false,
    },
    consultationType: {
      type: String,
      enum: ['in-person', 'video', 'both'],
      default: 'both',
    },
    bookedByPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: A doctor cannot have duplicate slots with the exact same date & startTime
availabilitySlotSchema.index(
  { doctor: 1, date: 1, startTime: 1 },
  { unique: true }
);

const AvailabilitySlot = mongoose.model('AvailabilitySlot', availabilitySlotSchema);

export default AvailabilitySlot;
