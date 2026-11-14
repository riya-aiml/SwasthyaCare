import FollowUpPlan from './followUpPlan.model.js';
import RecoveryUpdate from './recoveryUpdate.model.js';
import NotificationJob from './notificationJob.model.js';
import User from '../users/user.model.js';
import DoctorProfile from '../doctors/doctorProfile.model.js';
import { schedulePlanReminders, processDueNotifications } from './notificationService.js';
import { assessRecoveryDeterioration } from './recoveryRisk.service.js';

/**
 * Follow-up & Post-Discharge Controller (Sprint 5)
 */

/**
 * 1. POST /api/follow-ups
 * Clinician creates a new follow-up care plan for a patient
 * Acceptance Criteria: Only authorized clinicians can create follow-up plans.
 */
export const createFollowUpPlan = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only authorized clinicians can create follow-up care plans' },
      });
    }

    const {
      patientId,
      diagnosis,
      dischargeDate,
      followUpDate,
      instructions,
      medications = [],
      targetMetrics = {},
      warningSymptoms = [],
      reminderCadenceDays = [1, 3, 7, 14],
      appointmentId,
    } = req.body;

    if (!patientId || !diagnosis || !followUpDate || !instructions) {
      return res.status(400).json({
        success: false,
        error: { message: 'Patient ID, diagnosis, followUpDate, and instructions are required' },
      });
    }

    // Verify patient exists and is a patient
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        error: { message: 'Patient not found' },
      });
    }

    // Get doctor profile if available
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });

    // Create plan
    const plan = new FollowUpPlan({
      patient: patientId,
      doctor: req.user._id,
      doctorProfile: doctorProfile?._id,
      appointment: appointmentId,
      diagnosis,
      dischargeDate: dischargeDate || new Date(),
      followUpDate,
      instructions,
      medications,
      targetMetrics,
      warningSymptoms,
      reminderCadenceDays,
      status: 'ACTIVE',
    });

    await plan.save();

    // Automatically queue reminder notification jobs
    await schedulePlanReminders(plan, patient);

    await plan.populate([
      { path: 'patient', select: 'firstName lastName email phoneNumber' },
      { path: 'doctor', select: 'firstName lastName email' },
      { path: 'doctorProfile', select: 'fullName specialty hospital' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Follow-up care plan created and reminders scheduled successfully',
      data: { plan },
    });
  } catch (error) {
    console.error('createFollowUpPlan error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to create follow-up plan' },
    });
  }
};

/**
 * 2. GET /api/follow-ups/my-plans
 * Patient views their own follow-up plans
 * Acceptance Criteria: Patients can access only their own follow-up information.
 */
export const getMyFollowUpPlans = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access restricted to patients' },
      });
    }

    const { status } = req.query;
    const query = { patient: req.user._id };
    if (status) query.status = status;

    const plans = await FollowUpPlan.find(query)
      .populate('doctor', 'firstName lastName email')
      .populate('doctorProfile', 'fullName specialty hospital consultationFee')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { plans },
    });
  } catch (error) {
    console.error('getMyFollowUpPlans error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve follow-up plans' },
    });
  }
};

/**
 * 3. GET /api/follow-ups/clinician/plans
 * Clinician views all follow-up plans created by them
 */
export const getClinicianPlans = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access restricted to doctors' },
      });
    }

    const { status } = req.query;
    const query = { doctor: req.user._id };
    if (status) query.status = status;

    const plans = await FollowUpPlan.find(query)
      .populate('patient', 'firstName lastName email phoneNumber dateOfBirth bloodGroup')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { plans },
    });
  } catch (error) {
    console.error('getClinicianPlans error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve clinician plans' },
    });
  }
};

/**
 * 4. GET /api/follow-ups/:id
 * Get single plan with its recovery updates
 * Strict authorization: only assigned patient or doctor
 */
export const getFollowUpPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await FollowUpPlan.findById(id)
      .populate('patient', 'firstName lastName email phoneNumber dateOfBirth bloodGroup')
      .populate('doctor', 'firstName lastName email')
      .populate('doctorProfile', 'fullName specialty hospital');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { message: 'Follow-up plan not found' },
      });
    }

    // Access control: only assigned patient, assigned doctor, or admin
    const isPatient = plan.patient._id.toString() === req.user._id.toString();
    const isDoctor = plan.doctor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view this follow-up plan' },
      });
    }

    // Fetch associated recovery updates
    const updates = await RecoveryUpdate.find({ plan: id })
      .populate('clinicianReview.reviewedBy', 'firstName lastName')
      .sort({ reportedDate: -1 });

    res.status(200).json({
      success: true,
      data: { plan, updates },
    });
  } catch (error) {
    console.error('getFollowUpPlanById error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve follow-up plan' },
    });
  }
};

/**
 * 5. POST /api/follow-ups/:planId/recovery-updates
 * Patient submits daily/periodic recovery update
 * Acceptance Criteria: Patients can submit recovery updates to their own plans.
 */
export const submitRecoveryUpdate = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await FollowUpPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { message: 'Follow-up plan not found' },
      });
    }

    // Authorization: Only the plan's patient can submit updates
    if (plan.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only submit recovery updates for your own follow-up plan' },
      });
    }

    const recoveryRating = req.body.recoveryRating ?? req.body.recovery_rating;
    const painLevel = req.body.painLevel ?? req.body.pain_level ?? 0;
    const mobilityScore = req.body.mobilityScore ?? req.body.mobility_score ?? 'Normal';
    const vitals = req.body.vitals || {};
    const medicationAdherence = req.body.medicationAdherence ?? req.body.medication_adherence ?? 'Full';
    const adherenceNotes = req.body.adherenceNotes ?? req.body.adherence_notes;
    const currentSymptoms = req.body.currentSymptoms ?? req.body.current_symptoms ?? [];
    const hasWarningSymptoms = req.body.hasWarningSymptoms ?? req.body.has_warning_symptoms ?? false;
    const patientNotes = req.body.patientNotes ?? req.body.patient_notes ?? '';

    if (!recoveryRating) {
      return res.status(400).json({
        success: false,
        error: { message: 'Overall recovery rating (1-5) is required' },
      });
    }

    // 1. Fetch previous recovery update for this plan to compute longitudinal trajectory
    const previousUpdate = await RecoveryUpdate.findOne({ plan: planId }).sort({ reportedDate: -1 });

    const daysPostDischarge = Math.max(
      1,
      Math.round((Date.now() - new Date(plan.dischargeDate || plan.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    );

    // 2. Execute ML-REC-01 inference (Python FastAPI microservice with automatic resilient fallback)
    const mlAssessment = await assessRecoveryDeterioration({
      recovery_rating: Number(recoveryRating),
      pain_level: Number(painLevel),
      mobility_score: mobilityScore || 'Normal',
      systolic_bp: vitals?.bloodPressureSystolic ? Number(vitals.bloodPressureSystolic) : null,
      diastolic_bp: vitals?.bloodPressureDiastolic ? Number(vitals.bloodPressureDiastolic) : null,
      heart_rate: vitals?.heartRate ? Number(vitals.heartRate) : null,
      temperature_celsius: vitals?.temperatureCelsius ? Number(vitals.temperatureCelsius) : null,
      oxygen_saturation: vitals?.oxygenSaturation ? Number(vitals.oxygenSaturation) : null,
      blood_glucose: vitals?.bloodGlucose ? Number(vitals.bloodGlucose) : null,
      medication_adherence: medicationAdherence || 'Full',
      current_symptoms: currentSymptoms,
      has_warning_symptoms: Boolean(hasWarningSymptoms),
      patient_notes: patientNotes || '',
      days_post_discharge: daysPostDischarge,
      previous_pain_level: previousUpdate ? previousUpdate.painLevel : null,
      previous_recovery_rating: previousUpdate ? previousUpdate.recoveryRating : null,
    });

    const isCriticalAttention = Boolean(
      hasWarningSymptoms ||
      (vitals?.bloodPressureSystolic && vitals.bloodPressureSystolic > 160) ||
      mlAssessment.riskTier === 'CRITICAL_ATTENTION' ||
      mlAssessment.requiresEscalation
    );

    // Create recovery update
    const update = new RecoveryUpdate({
      plan: planId,
      patient: req.user._id,
      recoveryRating,
      painLevel,
      mobilityScore,
      vitals,
      medicationAdherence,
      adherenceNotes,
      currentSymptoms,
      hasWarningSymptoms,
      patientNotes,
      aiRiskAssessment: mlAssessment,
      clinicianReview: {
        isReviewed: false,
        status: isCriticalAttention ? 'NEEDS_ATTENTION' : 'STABLE',
      },
    });

    await update.save();

    // Update FollowUpPlan latest risk metrics for fast clinician triage
    plan.latestRiskTier = mlAssessment.riskTier;
    plan.latestRiskScore = mlAssessment.riskScore;
    plan.latestHealthIndex = mlAssessment.healthIndex;
    plan.lastReportedDate = new Date();
    await plan.save();

    // If warning symptoms or critical vitals reported, trigger an escalation notification to clinician
    if (isCriticalAttention) {
      const doctor = await User.findById(plan.doctor);
      if (doctor) {
        const deduplicationKey = `alert_${update._id}_clinician`;
        await NotificationJob.create({
          deduplicationKey,
          recipient: doctor._id,
          channel: 'email',
          recipientAddress: doctor.email,
          type: 'CRITICAL_ALERT_ESCALATION',
          subject: '⚠️ SwasthyaCare: Patient Recovery Alert',
          message: `Dr. ${doctor.lastName}, ML-REC-01 detected elevated patient deterioration risk (${mlAssessment.riskScore}%, ${mlAssessment.riskTier}). Contributing factors: ${mlAssessment.contributingFactors.slice(0, 2).join(', ')}. Please review the patient's care plan.`,
          metadata: { planId: plan._id, updateId: update._id },
          scheduledFor: new Date(),
          status: 'PENDING',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Recovery update recorded successfully',
      data: { update },
    });
  } catch (error) {
    console.error('submitRecoveryUpdate error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to submit recovery update' },
    });
  }
};

/**
 * 6. PUT /api/follow-ups/updates/:updateId/review
 * Clinician reviews a patient's recovery update
 * Acceptance Criteria: Authorized clinicians can review updates.
 */
export const reviewRecoveryUpdate = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only authorized clinicians can review recovery updates' },
      });
    }

    const { updateId } = req.params;
    const { status = 'STABLE', clinicianFeedback, escalationRequired = false } = req.body;

    const update = await RecoveryUpdate.findById(updateId).populate('plan');
    if (!update) {
      return res.status(404).json({
        success: false,
        error: { message: 'Recovery update not found' },
      });
    }

    // Authorization: Only the assigned clinician or admin
    if (update.plan.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the assigned clinician can review this update' },
      });
    }

    update.clinicianReview = {
      isReviewed: true,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      status,
      clinicianFeedback,
      escalationRequired,
    };

    await update.save();

    await update.populate([
      { path: 'patient', select: 'firstName lastName email' },
      { path: 'clinicianReview.reviewedBy', select: 'firstName lastName' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Recovery update reviewed successfully',
      data: { update },
    });
  } catch (error) {
    console.error('reviewRecoveryUpdate error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to review recovery update' },
    });
  }
};

/**
 * 7. POST /api/follow-ups/reminders/process
 * Triggers processing of due reminders (for testing / worker scheduler)
 */
export const triggerReminderProcessing = async (req, res) => {
  try {
    const results = await processDueNotifications();
    res.status(200).json({
      success: true,
      message: 'Reminder processing run completed',
      data: results,
    });
  } catch (error) {
    console.error('triggerReminderProcessing error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to process reminders' },
    });
  }
};

/**
 * 8. GET /api/follow-ups/reminders
 * View scheduled reminder jobs
 */
export const getScheduledReminders = async (req, res) => {
  try {
    const { status, planId, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (planId) query['metadata.planId'] = planId;
    if (type) query.type = type;

    // Filter by role: patient sees only their own, doctor sees reminders for their patients
    if (req.user.role === 'patient') {
      query.recipient = req.user._id;
    }

    const jobs = await NotificationJob.find(query)
      .populate('recipient', 'firstName lastName email')
      .sort({ scheduledFor: 1 });

    res.status(200).json({
      success: true,
      data: { jobs },
    });
  } catch (error) {
    console.error('getScheduledReminders error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve reminders' },
    });
  }
};
