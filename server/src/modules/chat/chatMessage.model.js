import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true },
    title: { type: String, required: true },
    urlOrSection: { type: String },
  },
  { _id: false }
);

const actionSuggestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['NAVIGATE_TAB', 'CONFIRM_BOOKING', 'CONFIRM_CANCEL', 'ESCALATE_DOCTOR', 'EMERGENCY_MODAL', 'NONE'],
      default: 'NONE',
    },
    label: { type: String },
    target: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: String,
      enum: ['helpful', 'unhelpful', 'neutral', null],
      default: null,
    },
    comment: { type: String, trim: true },
    submittedAt: { type: Date },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    intent: {
      type: String,
      enum: [
        'APP_HELP',
        'HEALTH_INFO',
        'ASSESSMENT_EXPLAIN',
        'REPORT_EXPLAIN',
        'APPOINTMENT_ASSIST',
        'EMERGENCY_RED_FLAG',
        'OUT_OF_SCOPE',
        'SYSTEM_NOTICE',
      ],
      default: 'APP_HELP',
    },
    citations: {
      type: [citationSchema],
      default: [],
    },
    actionSuggestion: {
      type: actionSuggestionSchema,
      default: () => ({ type: 'NONE' }),
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    disclaimer: {
      type: String,
      default: 'EDUCATIONAL DECISION-SUPPORT PROTOTYPE ONLY: SwasthyaCare Assistant provides non-diagnostic health navigation.',
    },
    feedback: {
      type: feedbackSchema,
      default: () => ({ rating: null }),
    },
  },
  { timestamps: true }
);

// Compound indexes for performant history retrieval and tenant security
chatMessageSchema.index({ session: 1, createdAt: 1 });
chatMessageSchema.index({ patient: 1, createdAt: -1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
