import RiskAssessment from './riskAssessment.model.js';

const getAIServiceBaseUrl = () => process.env.AI_SERVICE_URL || 'http://localhost:8005';
const getInternalSecret = () => process.env.INTERNAL_AI_SERVICE_SECRET || 'swasthya-internal-dev-key-2026';
const TIMEOUT_MS = 8000;

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * 1. POST /api/assessments/diabetes
 * Executes ML-DIA-01 via internal RPC and stores immutable audit record in MongoDB
 */
export const createDiabetesAssessment = async (req, res) => {
  try {
    const { provenance, ...modelInputs } = req.body;

    const payload = {
      ...modelInputs,
      provenance: provenance || {
        source: 'manual_entry',
        patient_confirmed: true,
      },
    };

    const response = await fetchWithTimeout(
      `${getAIServiceBaseUrl()}/internal/v1/assessments/diabetes/current-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service-Key': getInternalSecret(),
        },
        body: JSON.stringify(payload),
      }
    );

    const mlResult = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: mlResult.detail || 'Diabetes current-status assessment failed',
      });
    }

    // Persist to MongoDB riskAssessments collection (ML-S7-05)
    const assessment = await RiskAssessment.create({
      patient: req.user._id,
      taskId: 'ML-DIA-01',
      modelId: mlResult.model_id,
      modelVersion: mlResult.model_version,
      assessmentStatus: mlResult.assessment_status || 'completed',
      prediction: mlResult.prediction,
      probability: mlResult.probability,
      outputLabel: mlResult.output_label,
      contributingFactors: mlResult.contributing_factors || [],
      clinicalRecommendations: mlResult.lifestyle_recommendations || [],
      limitations: mlResult.limitations || [],
      disclaimer: mlResult.disclaimer,
      provenance: {
        source: provenance?.source || 'manual_entry',
        patientConfirmed: provenance?.patientConfirmed !== undefined ? provenance.patientConfirmed : true,
        enteredAt: provenance?.enteredAt || new Date(),
      },
      evaluatedAt: mlResult.timestamp_utc ? new Date(mlResult.timestamp_utc) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('createDiabetesAssessment error:', error);
    res.status(503).json({
      success: false,
      error: {
        message: 'The diabetes clinical decision service is currently unavailable. Please consult your physician directly.',
        isServiceDown: true,
      },
    });
  }
};

/**
 * 2. POST /api/assessments/cardiovascular
 * Executes ML-CVD-01 via internal RPC and stores immutable audit record in MongoDB
 */
export const createCardiovascularAssessment = async (req, res) => {
  try {
    const { provenance, ...modelInputs } = req.body;

    const payload = {
      ...modelInputs,
      provenance: provenance || {
        source: 'manual_entry',
        patient_confirmed: true,
      },
    };

    const response = await fetchWithTimeout(
      `${getAIServiceBaseUrl()}/internal/v1/assessments/cardiovascular/current-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service-Key': getInternalSecret(),
        },
        body: JSON.stringify(payload),
      }
    );

    const mlResult = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: mlResult.detail || 'Cardiovascular current-status assessment failed',
      });
    }

    // Persist to MongoDB riskAssessments collection (ML-S7-05)
    const assessment = await RiskAssessment.create({
      patient: req.user._id,
      taskId: 'ML-CVD-01',
      modelId: mlResult.model_id,
      modelVersion: mlResult.model_version,
      assessmentStatus: mlResult.assessment_status || 'completed',
      prediction: mlResult.prediction,
      probability: mlResult.probability,
      outputLabel: mlResult.output_label,
      contributingFactors: mlResult.contributing_factors || [],
      clinicalRecommendations: mlResult.clinical_recommendations || [],
      limitations: mlResult.limitations || [],
      disclaimer: mlResult.disclaimer,
      provenance: {
        source: provenance?.source || 'manual_entry',
        patientConfirmed: provenance?.patientConfirmed !== undefined ? provenance.patientConfirmed : true,
        enteredAt: provenance?.enteredAt || new Date(),
      },
      evaluatedAt: mlResult.timestamp_utc ? new Date(mlResult.timestamp_utc) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('createCardiovascularAssessment error:', error);
    res.status(503).json({
      success: false,
      error: {
        message: 'The cardiovascular clinical decision service is currently unavailable. Please consult your cardiologist directly.',
        isServiceDown: true,
      },
    });
  }
};

/**
 * 3. GET /api/assessments/my-history
 * Patient retrieves their historical risk assessments (ML-S7-06)
 */
export const getMyAssessments = async (req, res) => {
  try {
    const filter = { patient: req.user._id };
    if (req.query.taskId) {
      filter.taskId = req.query.taskId;
    }

    const assessments = await RiskAssessment.find(filter)
      .sort({ evaluatedAt: -1 })
      .populate('reviewedBy', 'firstName lastName specialty')
      .lean();

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    console.error('getMyAssessments error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve assessment history' },
    });
  }
};

/**
 * 4. GET /api/assessments/:id
 * Retrieve a specific assessment with strict patient-isolation access control (ML-S7-06)
 */
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await RiskAssessment.findById(req.params.id)
      .populate('patient', 'firstName lastName email dateOfBirth gender')
      .populate('reviewedBy', 'firstName lastName specialty');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Assessment record not found' },
      });
    }

    // Access control: Patients cannot access assessments belonging to other patients
    if (req.user.role === 'patient' && assessment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied: You are not authorized to view another patient\'s clinical assessment.' },
      });
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('getAssessmentById error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve assessment record' },
    });
  }
};

/**
 * 5. GET /api/assessments/patient/:patientId
 * Clinician retrieves assessments for a specific patient (ML-S7-07)
 */
export const getPatientAssessmentsForClinician = async (req, res) => {
  try {
    const assessments = await RiskAssessment.find({ patient: req.params.patientId })
      .sort({ evaluatedAt: -1 })
      .populate('reviewedBy', 'firstName lastName specialty')
      .lean();

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    console.error('getPatientAssessmentsForClinician error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve patient assessments' },
    });
  }
};

/**
 * 6. POST /api/assessments/:id/review
 * Clinician attaches clinical review notes and sign-off (ML-S7-07)
 */
export const reviewAssessment = async (req, res) => {
  try {
    const { clinicianNotes } = req.body;

    if (!clinicianNotes || !clinicianNotes.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Clinician notes are required for assessment review.' },
      });
    }

    const assessment = await RiskAssessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Assessment record not found' },
      });
    }

    assessment.clinicianNotes = clinicianNotes.trim();
    assessment.reviewedBy = req.user._id;
    assessment.reviewedAt = new Date();

    await assessment.save();

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('reviewAssessment error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to save clinician review notes' },
    });
  }
};
