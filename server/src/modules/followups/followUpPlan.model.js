import mongoose from 'mongoose';

/**
 * Follow-Up Plan Schema (Sprint 5: S5-01)
 * Created by authorized clinicians upon patient discharge or post-consultation
 */
const followUpPlanSchema = new mongoose.Schema(
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
    },
    // Associated appointment (optional)
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis or reason for follow-up is required'],
      trim: true,
    },
    dischargeDate: {
      type: Date,
      default: Date.now,
    },
    followUpDate: {
      type: Date,
      required: [true, 'Scheduled follow-up date is required'],
      index: true,
    },
    instructions: {
      type: String,
      required: [true, 'Discharge and care instructions are required'],
      trim: true,
    },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true }, // e.g. "Twice daily with meals"
        durationDays: { type: Number, default: 7 },
        specialInstructions: { type: String, trim: true },
      },
    ],
    targetMetrics: {
      bloodPressureTarget: { type: String, default: '< 130/85' },
      bloodGlucoseTarget: { type: String, default: '70-130 mg/dL' },
      pulseRange: { type: String, default: '60-100 bpm' },
      activityGoal: { type: String, default: '30 mins gentle walk' },
    },
    warningSymptoms: [
      {
        type: String, // e.g., "Shortness of breath", "Fever > 101 F", "Chest pain"
      },
    ],
    reminderCadenceDays: {
      type: [Number],
      default: [1, 3, 7, 14], // Remind at Day 1, Day 3, Day 7, Day 14 post-discharge
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    closedAt: {
      type: Date,
    },
    closingSummary: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a patient's active plans
followUpPlanSchema.index({ patient: 1, status: 1 });
followUpPlanSchema.index({ doctor: 1, status: 1 });

const FollowUpPlan = mongoose.model('FollowUpPlan', followUpPlanSchema);

export default FollowUpPlan;
