import mongoose from 'mongoose';

/**
 * Complete 13-Intent Taxonomy (with legacy aliases for backward compatibility)
 * Synchronized across MongoDB, Express Gateway, FastAPI, and React Frontend
 */
export const CHAT_INTENTS = [
  'INTENT_EMERGENCY',
  'INTENT_NAVIGATION',
  'INTENT_APP_NAVIGATION', // Alias for INTENT_NAVIGATION
  'INTENT_CLINICAL_QA',
  'INTENT_REPORT_EXPLANATION',
  'INTENT_ASSESSMENT_EXPLANATION',
  'INTENT_APPOINTMENT_HELP',
  'INTENT_APPOINTMENT_ACTION',
  'INTENT_APP_ACTION', // Alias for INTENT_APPOINTMENT_ACTION
  'INTENT_QUEUE_HELP',
  'INTENT_FOLLOW_UP_HELP',
  'INTENT_MEDICINE_INFORMATION',
  'INTENT_HUMAN_SUPPORT',
  'INTENT_GENERAL_CHITCHAT',
  'INTENT_UNCLEAR',
  'INTENT_UNKNOWN', // Alias for INTENT_UNCLEAR
];

export const ACTION_TYPES = [
  'BOOK_APPOINTMENT',
  'CANCEL_APPOINTMENT',
  'VIEW_RISK_REPORT',
  'SUBMIT_FOLLOWUP',
  'CONTACT_SUPPORT',
  'QUEUE_CHECK',
  'NONE',
];

/**
 * Action Proposal Parameters Schema
 * Replaces unrestricted Mixed with structured, validated fields
 */
const actionParametersSchema = new mongoose.Schema(
  {
    slotId: { type: String, trim: true },
    doctorId: { type: String, trim: true },
    doctorName: { type: String, trim: true },
    appointmentId: { type: String, trim: true },
    appointmentDate: { type: Date },
    appointmentTime: { type: String, trim: true },
    specialty: { type: String, trim: true },
    reportType: { type: String, trim: true },
    reason: { type: String, trim: true, maxlength: 500 },
    followupDate: { type: Date },
    queueToken: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false, strict: false }
);

/**
 * Citation Sub-Schema
 */
const citationSchema = new mongoose.Schema(
  {
    docId: { type: String, required: [true, 'Citation docId is required'], trim: true },
    title: { type: String, required: [true, 'Citation title is required'], trim: true },
    sourceOrganization: {
      type: String,
      required: [true, 'Citation sourceOrganization is required'],
      trim: true,
    },
    snippet: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

/**
 * Action Proposal Sub-Schema
 */
const actionProposalSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      enum: ACTION_TYPES,
      default: 'NONE',
    },
    targetResource: { type: String, trim: true },
    parameters: {
      type: actionParametersSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['proposed', 'confirmed', 'rejected', 'expired'],
      default: 'proposed',
    },
    requiresConfirmation: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/**
 * User Feedback Sub-Schema
 */
const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: String,
      enum: ['helpful', 'unhelpful', 'none'],
      default: 'none',
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters'],
    },
    submittedAt: {
      type: Date,
    },
  },
  { _id: false }
);

/**
 * Chat Message Schema (Sprint 9 & Phase 3 Unified Architecture)
 * Persists user and assistant messages, intent classification, source citations,
 * clinical safety flags, structured action proposals, and audit feedback.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: [true, 'Chat session reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [4000, 'Message content cannot exceed 4000 characters'],
      trim: true,
    },
    intent: {
      type: String,
      enum: CHAT_INTENTS,
      default: 'INTENT_UNCLEAR',
    },
    isEmergency: {
      type: Boolean,
      default: false,
      index: true,
    },
    citations: [citationSchema],
    actionProposal: {
      type: actionProposalSchema,
      default: null,
    },
    feedback: {
      type: feedbackSchema,
      default: () => ({ rating: 'none' }),
    },
    latencyMs: {
      type: Number,
      default: 0,
      min: 0,
    },
    provider: {
      type: String,
      default: 'deterministic-mock',
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// High-efficiency compound indexes
chatMessageSchema.index({ session: 1, createdAt: 1 });
chatMessageSchema.index({ user: 1, createdAt: -1 });
chatMessageSchema.index({ 'actionProposal.status': 1, 'actionProposal.actionType': 1 });
chatMessageSchema.index({ intent: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
