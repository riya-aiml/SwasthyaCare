import mongoose from 'mongoose';

/**
 * Chat Message Schema (Sprint 9: S9-05)
 * Persists user and assistant messages, intent classification, source citations,
 * clinical safety flags, and user feedback audits.
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
    },
    intent: {
      type: String,
      enum: [
        'INTENT_EMERGENCY',
        'INTENT_APP_ACTION',
        'INTENT_APP_NAVIGATION',
        'INTENT_REPORT_EXPLANATION',
        'INTENT_CLINICAL_QA',
        'INTENT_GENERAL_CHITCHAT',
        'INTENT_UNKNOWN',
      ],
      default: 'INTENT_UNKNOWN',
    },
    isEmergency: {
      type: Boolean,
      default: false,
      index: true,
    },
    citations: [
      {
        docId: { type: String, required: true },
        title: { type: String, required: true },
        sourceOrganization: { type: String, required: true },
        snippet: { type: String },
      },
    ],
    actionProposal: {
      actionType: {
        type: String,
        enum: [
          'BOOK_APPOINTMENT',
          'CANCEL_APPOINTMENT',
          'VIEW_RISK_REPORT',
          'SUBMIT_FOLLOWUP',
          'NONE',
        ],
        default: 'NONE',
      },
      targetResource: { type: String },
      parameters: { type: mongoose.Schema.Types.Mixed },
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
    feedback: {
      rating: {
        type: String,
        enum: ['helpful', 'unhelpful', 'none'],
        default: 'none',
      },
      comment: {
        type: String,
        maxlength: 500,
      },
      submittedAt: {
        type: Date,
      },
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      default: 'deterministic-mock',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for chronologically retrieving messages within a session
chatMessageSchema.index({ session: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
