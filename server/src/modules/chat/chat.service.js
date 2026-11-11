import User from '../users/user.model.js';
import RiskAssessment from '../assessments/riskAssessment.model.js';
import Appointment from '../appointments/appointment.model.js';

const getAIServiceBaseUrl = () => process.env.AI_SERVICE_URL || 'http://localhost:8005';
const getInternalSecret = () => process.env.INTERNAL_AI_SERVICE_SECRET || 'swasthya-internal-dev-key-2026';
const TIMEOUT_MS = 8000;

// Emergency fallback trigger patterns for offline resilience (Airbag safety)
const OFFLINE_EMERGENCY_TRIGGERS = [
  /chest\s+pain/i,
  /radiat(ing|es).*left\s+arm/i,
  /shortness\s+of\s+breath/i,
  /difficulty\s+breathing/i,
  /facial\s+droop/i,
  /slurr(ed|ing)\s+speech/i,
  /sudden\s+weakness/i,
  /loss\s+of\s+consciousness/i,
  /coughing\s+blood/i,
  /suicid(e|al)/i,
];

/**
 * Gathers authorized, non-confidential context for the authenticated patient (Tasks S11-05, S11-06, S11-07)
 */
export const buildPatientContext = async (patientId) => {
  try {
    const user = await User.findById(patientId).select('firstName lastName').lean();
    if (!user) return null;

    // Fetch latest completed ML risk assessment
    const latestAssessment = await RiskAssessment.findOne({
      patient: patientId,
      assessmentStatus: 'completed',
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch next upcoming appointment
    const nextAppointment = await Appointment.findOne({
      patient: patientId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['PENDOR_CONFIRMED', 'PENDING', 'APPROVED'] },
    })
      .sort({ appointmentDate: 1 })
      .populate('doctor', 'firstName lastName')
      .lean();

    const patientContext = {
      patient_id: String(patientId),
      first_name: user.firstName || 'Patient',
    };

    if (latestAssessment) {
      patientContext.latest_assessment = {
        task_id: latestAssessment.taskId,
        model_id: latestAssessment.modelId,
        model_version: latestAssessment.modelVersion,
        probability: latestAssessment.probability,
        output_label: latestAssessment.outputLabel,
        contributing_factors: (latestAssessment.contributingFactors || []).slice(0, 3),
      };
    }

    if (nextAppointment) {
      patientContext.next_appointment = {
        date: nextAppointment.appointmentDate,
        status: nextAppointment.status,
        doctor_name: nextAppointment.doctor
          ? `Dr. ${nextAppointment.doctor.firstName} ${nextAppointment.doctor.lastName}`
          : 'Attending Clinician',
      };
    }

    return patientContext;
  } catch (error) {
    console.error('buildPatientContext error:', error.message);
    return null;
  }
};

/**
 * Invokes the Python FastAPI conversational RAG microservice with fallback safety (Tasks S11-01, S11-12)
 */
export const queryAssistantRAG = async ({
  sessionId,
  userId,
  message,
  locale = 'en',
  patientContext = null,
}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${getAIServiceBaseUrl()}/internal/v1/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Service-Key': getInternalSecret(),
      },
      body: JSON.stringify({
        session_id: String(sessionId),
        user_id: String(userId),
        message: message.trim(),
        locale: locale === 'hi' ? 'hi' : 'en',
        patient_context: patientContext,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI service returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      intent: data.intent || 'APP_HELP',
      content: data.content,
      citations: (data.citations || []).map((c) => ({
        sourceId: c.source_id,
        title: c.title,
        urlOrSection: c.url_or_section,
      })),
      actionSuggestion: {
        type: data.action_suggestion?.type || 'NONE',
        label: data.action_suggestion?.label || null,
        target: data.action_suggestion?.target || null,
        payload: data.action_suggestion?.payload || null,
      },
      isEmergency: Boolean(data.is_emergency),
      disclaimer: data.disclaimer || 'EDUCATIONAL DECISION-SUPPORT PROTOTYPE ONLY',
    };
  } catch (error) {
    console.warn(`Assistant RAG offline/fallback: ${error.message}`);

    // Offline Airbag Emergency Check
    for (const pattern of OFFLINE_EMERGENCY_TRIGGERS) {
      if (pattern.test(message)) {
        return {
          intent: 'EMERGENCY_RED_FLAG',
          content:
            '⚠️ EMERGENCY MEDICAL ALERT (Offline Pre-Check): The symptoms you mentioned may indicate an acute medical emergency. Please call National Emergency Services (112 or 108) or report to the nearest emergency department immediately.',
          citations: [],
          actionSuggestion: {
            type: 'EMERGENCY_MODAL',
            label: 'Call Emergency (112)',
            target: 'tel:112',
          },
          isEmergency: true,
          disclaimer: 'EMERGENCY TRIAGE NOTICE: Automated assistant cannot handle acute medical emergencies.',
        };
      }
    }

    // Standard Non-Diagnostic Graceful Fallback
    return {
      intent: 'APP_HELP',
      content:
        'I am currently operating in offline navigation mode. I can help guide you through SwasthyaCare platform features (Booking appointments, viewing ML Risk Assessments, and OPD Queue status), though real-time clinical guideline retrieval is temporarily limited.',
      citations: [],
      actionSuggestion: {
        type: 'NAVIGATE_TAB',
        label: 'View Appointments',
        target: 'appointments',
      },
      isEmergency: false,
      disclaimer: 'EDUCATIONAL DECISION-SUPPORT PROTOTYPE ONLY: Offline navigation fallback.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
