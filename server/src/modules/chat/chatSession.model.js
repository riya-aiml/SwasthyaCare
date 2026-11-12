import mongoose from 'mongoose';

/**
 * Session Metadata Schema
 * Strictly typed metadata container replacing unrestricted Mixed types
 */
const sessionMetadataSchema = new mongoose.Schema(
  {
    clientIp: { type: String, trim: true },
    userAgent: { type: String, trim: true, maxlength: 300 },
    device: { type: String, trim: true, maxlength: 100 },
    patientAge: { type: Number, min: 0, max: 130 },
    patientGender: {
      type: String,
      enum: ['male', 'female', 'other', 'unknown'],
      default: 'unknown',
    },
    sourceChannel: { type: String, default: 'web_portal', trim: true },
    initialIntent: { type: String, trim: true },
  },
  { _id: false, strict: false }
);

/**
 * Chat Session Schema (Sprint 9 & Phase 3 Unified Architecture)
 * Manages conversation lifecycle, patient isolation, retention, and session-level metadata
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
    deletedAt: {
      type: Date,
      default: null,
    },
    retentionExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1-year clinical audit retention policy
      index: true,
    },
    metadata: {
      type: sessionMetadataSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-throughput queries and compliance cleanup
chatSessionSchema.index({ user: 1, status: 1, updatedAt: -1 });
chatSessionSchema.index({ status: 1, retentionExpiresAt: 1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
