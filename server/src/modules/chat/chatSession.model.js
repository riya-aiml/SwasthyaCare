import mongoose from 'mongoose';

/**
 * Chat Session Schema (Sprint 9: S9-05)
 * Manages conversation lifecycle, patient isolation, and session-level metadata
 */
const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'hospital_management'],
      default: 'patient',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: 'New Health Consultation',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
      index: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessagePreview: {
      type: String,
      maxlength: 200,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user session listing
chatSessionSchema.index({ user: 1, status: 1, updatedAt: -1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
