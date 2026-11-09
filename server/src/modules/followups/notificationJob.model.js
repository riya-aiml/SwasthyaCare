import mongoose from 'mongoose';

/**
 * Notification Job Schema (Sprint 5: S5-07)
 * Background reminder queue with idempotency, retry metadata, and sanitized content
 */
const notificationJobSchema = new mongoose.Schema(
  {
    // Idempotency key to avoid duplicate jobs for the same reminder event
    deduplicationKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'in-app'],
      default: 'email',
    },
    recipientAddress: {
      type: String, // email address or phone number
      required: true,
    },
    type: {
      type: String,
      enum: [
        'DISCHARGE_FOLLOWUP_REMINDER',
        'RECOVERY_CHECKIN_PROMPT',
        'APPOINTMENT_REMINDER',
        'CRITICAL_ALERT_ESCALATION',
      ],
      required: true,
    },
    // Sanitized notification payload (avoids unnecessary sensitive medical details per S5 criteria)
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      planId: { type: mongoose.Schema.Types.ObjectId, ref: 'FollowUpPlan' },
      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
      dayNumber: { type: Number },
      statusChange: { type: String },
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    lastAttemptAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    deliveryLogs: [
      {
        attempt: Number,
        timestamp: { type: Date, default: Date.now },
        success: Boolean,
        providerResponse: String,
        error: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for querying due pending notifications
notificationJobSchema.index({ status: 1, scheduledFor: 1 });

const NotificationJob = mongoose.model('NotificationJob', notificationJobSchema);

export default NotificationJob;
