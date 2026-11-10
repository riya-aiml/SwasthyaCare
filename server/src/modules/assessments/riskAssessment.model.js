import mongoose from 'mongoose';

/**
 * Risk Assessment Schema (Sprint 7: ML-S7-05)
 * Persists machine learning current-status decision support records
 * Enforces patient-data isolation, provenance tracking, and SaMD disclaimers
 */
const riskAssessmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    taskId: {
      type: String,
      required: [true, 'Task ID is required'],
      enum: ['ML-DIA-01', 'ML-CVD-01', 'FINDRISC-PROTOTYPE', 'FRAMINGHAM-PROTOTYPE'],
      index: true,
    },
    modelId: {
      type: String,
      required: [true, 'Model ID is required'],
    },
    modelVersion: {
      type: String,
      required: [true, 'Model version is required'],
      default: '1.0.0',
    },
    assessmentStatus: {
      type: String,
      enum: ['completed', 'inconclusive', 'rejected', 'failed'],
      default: 'completed',
    },
    prediction: {
      type: Number,
      enum: [0, 1],
      required: true,
    },
    probability: {
      type: Number,
      min: 0.0,
      max: 1.0,
      required: true,
    },
    outputLabel: {
      type: String,
      required: true,
    },
    contributingFactors: [
      {
        type: String,
      },
    ],
    clinicalRecommendations: [
      {
        type: String,
      },
    ],
    limitations: [
      {
        type: String,
      },
    ],
    disclaimer: {
      type: String,
      required: true,
    },
    provenance: {
      source: {
        type: String,
        enum: ['manual_entry', 'ocr_extraction', 'clinical_ehr_import'],
        default: 'manual_entry',
      },
      patientConfirmed: {
        type: Boolean,
        default: true,
      },
      enteredAt: {
        type: Date,
        default: Date.now,
      },
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Optional Clinician Review Notes (Task ML-S7-07)
    clinicianNotes: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient patient assessment history queries
riskAssessmentSchema.index({ patient: 1, evaluatedAt: -1 });

const RiskAssessment = mongoose.model('RiskAssessment', riskAssessmentSchema);

export default RiskAssessment;
