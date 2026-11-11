import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'New Health Conversation',
    },
    contextSummary: {
      type: String,
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'escalated'],
      default: 'active',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for strict multi-tenant isolation and chronological sorting
chatSessionSchema.index({ patient: 1, lastMessageAt: -1 });

export default mongoose.model('ChatSession', chatSessionSchema);
