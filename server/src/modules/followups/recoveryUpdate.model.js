import mongoose from 'mongoose';

/**
 * Recovery Update Schema (Sprint 5: S5-02)
 * Patients submit periodic recovery self-assessments against their follow-up care plan
 */
const recoveryUpdateSchema = new mongoose.Schema(
  {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FollowUpPlan',
      required: [true, 'Follow-up plan reference is required'],
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    reportedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Subjective Patient Metrics
    recoveryRating: {
      type: Number,
      min: [1, 'Recovery rating must be between 1 and 5'],
      max: [5, 'Recovery rating must be between 1 and 5'],
      required: [true, 'Overall recovery rating (1-5) is required'],
    },
    painLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    mobilityScore: {
      type: String,
      enum: ['Normal', 'Slightly Restricted', 'Significantly Restricted', 'Bedridden'],
      default: 'Normal',
    },
    // Objective Vitals
    vitals: {
      bloodPressureSystolic: { type: Number },
      bloodPressureDiastolic: { type: Number },
      heartRate: { type: Number },
      temperatureCelsius: { type: Number },
      bloodGlucose: { type: Number },
      weightKg: { type: Number },
      oxygenSaturation: { type: Number },
    },
    // Medication Adherence
    medicationAdherence: {
      type: String,
      enum: ['Full', 'Partial', 'Missed', 'None'],
      default: 'Full',
      required: true,
    },
    adherenceNotes: {
      type: String,
      trim: true,
    },
    // Symptoms & Concerns
    currentSymptoms: [
      {
        type: String,
      },
    ],
    hasWarningSymptoms: {
      type: Boolean,
      default: false,
    },
    patientNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    // ML-REC-01: Post-Discharge Deterioration & Readmission Risk Assessment
    aiRiskAssessment: {
      riskScore: { type: Number, default: 10 },
      healthIndex: { type: Number, default: 90 },
      riskTier: {
        type: String,
        enum: ['STABLE', 'MODERATE_RISK', 'CRITICAL_ATTENTION'],
        default: 'STABLE',
      },
      contributingFactors: [{ type: String }],
      nlpAlerts: [{ type: String }],
      clinicianRecommendation: { type: String },
      patientGuidance: { type: String },
      requiresEscalation: { type: Boolean, default: false },
      calculatedAt: { type: Date, default: Date.now },
      modelId: { type: String, default: 'ML-REC-01' },
      modelVersion: { type: String, default: '1.0.0' },
    },
    // Clinician Triage & Review
    clinicianReview: {
      isReviewed: {
        type: Boolean,
        default: false,
        index: true,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['STABLE', 'NEEDS_ATTENTION', 'CRITICAL_URGENT'],
        default: 'STABLE',
      },
      clinicianFeedback: {
        type: String,
        trim: true,
      },
      escalationRequired: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
recoveryUpdateSchema.index({ plan: 1, reportedDate: -1 });
recoveryUpdateSchema.index({ patient: 1, reportedDate: -1 });

const RecoveryUpdate = mongoose.model('RecoveryUpdate', recoveryUpdateSchema);

export default RecoveryUpdate;
