/**
 * SwasthyaCare — Post-Discharge Deterioration & Readmission Risk Service (ML-REC-01)
 * Evaluates patient daily recovery updates against clinical early warning (NEWS2) criteria,
 * medication adherence, longitudinal trajectory, and NLP adverse symptom markers.
 */

const getAIServiceBaseUrl = () => process.env.AI_SERVICE_URL || 'http://localhost:8005';
const TIMEOUT_MS = 3000;

// Clinical NLP patterns for local fallback execution
const NLP_WOUND_INFECTION_PATTERNS = [
  { regex: /\b(pus|ooz(ing|e)|drainage|foul[- ]smell(ing)?|yellowish discharge|cloudy fluid)\b/i, label: 'Wound Exudate / Potential Infection' },
  { regex: /\b(red(ness)? spread(ing)?|red streaks?|warm(th)? around incision|swollen incision)\b/i, label: 'Cellulitis / Surgical Site Erythema' },
  { regex: /\b(gaping|opened up|stitches tore|wound splitting|dehiscence)\b/i, label: 'Incision Dehiscence / Wound Breakdown' },
];

const NLP_RESPIRATORY_THROMBO_PATTERNS = [
  { regex: /\b(can'?t breathe|short(ness)? of breath|gasping|trouble breathing|wheezing badly)\b/i, label: 'Acute Dyspnea / Respiratory Compromise' },
  { regex: /\b(calf pain|swollen (leg|calf|ankle)|leg is hot and red|calf cramp)\b/i, label: 'Deep Vein Thrombosis (DVT) Warning' },
  { regex: /\b(chest pressure|tightness in chest|pain radiating to arm|crushing pain)\b/i, label: 'Cardiopulmonary Distress' },
];

const NLP_SYSTEMIC_NEURO_PATTERNS = [
  { regex: /\b(shivering violently|chills and shaking|rigors|teeth chattering)\b/i, label: 'Severe Rigors / Sepsis Precursor' },
  { regex: /\b(blackout|passed out|fainted|unsteady on feet|hallucinat(ing|ion)|confused)\b/i, label: 'Altered Sensorium / Syncope Risk' },
  { regex: /\b(unbearable pain|crying from pain|nothing helps the pain|worst pain)\b/i, label: 'Intractable Breakthrough Pain' },
];

/**
 * Deterministic local calculation engine (High-reliability fallback)
 */
export const evaluateRecoveryRiskLocal = (payload) => {
  let score = 0;
  const contributingFactors = [];
  const nlpAlerts = [];

  const {
    recovery_rating = 4,
    pain_level = 0,
    mobility_score = 'Normal',
    systolic_bp,
    diastolic_bp,
    heart_rate,
    temperature_celsius,
    oxygen_saturation,
    blood_glucose,
    medication_adherence = 'Full',
    current_symptoms = [],
    has_warning_symptoms = false,
    patient_notes = '',
    previous_pain_level,
    previous_recovery_rating,
  } = payload;

  // 1. Recovery Rating & Pain
  if (recovery_rating === 1) {
    score += 20;
    contributingFactors.push('Critically low overall recovery rating (1/5)');
  } else if (recovery_rating === 2) {
    score += 12;
    contributingFactors.push('Sub-optimal recovery rating (2/5)');
  } else if (recovery_rating === 3) {
    score += 5;
  }

  if (pain_level >= 8) {
    score += 22;
    contributingFactors.push(`Severe subjective pain reported (${pain_level}/10)`);
  } else if (pain_level >= 5) {
    score += 12;
    contributingFactors.push(`Moderate-to-high pain level (${pain_level}/10)`);
  } else if (pain_level >= 3) {
    score += 4;
  }

  // Mobility
  const mob = (mobility_score || '').toLowerCase();
  if (mob.includes('bedridden')) {
    score += 18;
    contributingFactors.push('Patient is bedridden / complete mobility impairment');
  } else if (mob.includes('significantly')) {
    score += 10;
    contributingFactors.push('Significantly restricted functional mobility');
  } else if (mob.includes('slightly')) {
    score += 4;
  }

  // 2. Vitals (NEWS2 Thresholds)
  if (systolic_bp != null) {
    const sbp = Number(systolic_bp);
    if (sbp > 170) {
      score += 20;
      contributingFactors.push(`Severe systolic hypertension (${sbp} mmHg)`);
    } else if (sbp > 150) {
      score += 10;
      contributingFactors.push(`Elevated systolic BP (${sbp} mmHg)`);
    } else if (sbp < 90) {
      score += 20;
      contributingFactors.push(`Hypotensive crisis (${sbp} mmHg)`);
    } else if (sbp < 100) {
      score += 8;
      contributingFactors.push(`Borderline low systolic BP (${sbp} mmHg)`);
    }
  }

  if (diastolic_bp != null) {
    const dbp = Number(diastolic_bp);
    if (dbp > 105) {
      score += 10;
      contributingFactors.push(`Elevated diastolic BP (${dbp} mmHg)`);
    } else if (dbp < 55) {
      score += 8;
      contributingFactors.push(`Low diastolic BP (${dbp} mmHg)`);
    }
  }

  if (heart_rate != null) {
    const hr = Number(heart_rate);
    if (hr > 120) {
      score += 18;
      contributingFactors.push(`Tachycardia (${hr} bpm)`);
    } else if (hr > 100) {
      score += 8;
      contributingFactors.push(`Elevated pulse (${hr} bpm)`);
    } else if (hr < 50) {
      score += 15;
      contributingFactors.push(`Bradycardia (${hr} bpm)`);
    }
  }

  if (temperature_celsius != null) {
    const temp = Number(temperature_celsius);
    if (temp >= 38.6) {
      score += 25;
      contributingFactors.push(`High pyrexia / fever (${temp.toFixed(1)} °C)`);
    } else if (temp >= 37.8) {
      score += 12;
      contributingFactors.push(`Low-grade fever (${temp.toFixed(1)} °C)`);
    } else if (temp < 35.5) {
      score += 15;
      contributingFactors.push(`Hypothermia warning (${temp.toFixed(1)} °C)`);
    }
  }

  if (oxygen_saturation != null) {
    const spo2 = Number(oxygen_saturation);
    if (spo2 < 90) {
      score += 30;
      contributingFactors.push(`Severe hypoxia (SpO2 ${spo2}%)`);
    } else if (spo2 < 94) {
      score += 18;
      contributingFactors.push(`Reduced oxygen saturation (SpO2 ${spo2}%)`);
    }
  }

  if (blood_glucose != null) {
    const bg = Number(blood_glucose);
    if (bg > 260) {
      score += 14;
      contributingFactors.push(`Acute hyperglycemia (${bg} mg/dL)`);
    } else if (bg < 70) {
      score += 15;
      contributingFactors.push(`Hypoglycemia alert (${bg} mg/dL)`);
    }
  }

  // 3. Medication Adherence
  const adh = (medication_adherence || '').toLowerCase();
  if (adh.includes('none')) {
    score += 22;
    contributingFactors.push('Medication discontinuation / zero adherence');
  } else if (adh.includes('missed')) {
    score += 15;
    contributingFactors.push('Missed critical prescribed medication doses');
  } else if (adh.includes('partial')) {
    score += 8;
    contributingFactors.push('Partial medication compliance reported');
  }

  // 4. Longitudinal Trajectory Velocity
  if (previous_pain_level != null) {
    const painDelta = pain_level - previous_pain_level;
    if (painDelta >= 3) {
      score += 15;
      contributingFactors.push(`Rapid pain escalation (+${painDelta} points since last check-in)`);
    } else if (painDelta >= 2) {
      score += 6;
    }
  }

  if (previous_recovery_rating != null) {
    const ratingDelta = previous_recovery_rating - recovery_rating;
    if (ratingDelta >= 2) {
      score += 10;
      contributingFactors.push(`Sharp decline in self-rated recovery (-${ratingDelta} points)`);
    }
  }

  if (has_warning_symptoms) {
    score += 25;
    contributingFactors.push('Patient flagged positive for clinician warning symptoms');
  }

  // 5. Clinical NLP Free-Text Notes Scanner
  if (patient_notes && patient_notes.trim()) {
    for (const item of NLP_WOUND_INFECTION_PATTERNS) {
      if (item.regex.test(patient_notes)) {
        score += 22;
        nlpAlerts.push(item.label);
        contributingFactors.push(`NLP: ${item.label} flagged in notes`);
        break;
      }
    }
    for (const item of NLP_RESPIRATORY_THROMBO_PATTERNS) {
      if (item.regex.test(patient_notes)) {
        score += 25;
        nlpAlerts.push(item.label);
        contributingFactors.push(`NLP: ${item.label} flagged in notes`);
        break;
      }
    }
    for (const item of NLP_SYSTEMIC_NEURO_PATTERNS) {
      if (item.regex.test(patient_notes)) {
        score += 18;
        nlpAlerts.push(item.label);
        contributingFactors.push(`NLP: ${item.label} flagged in notes`);
        break;
      }
    }
  }

  // 6. Normalization & Risk Tier Stratification
  const riskScore = Math.round(Math.min(Math.max(score, 5), 100) * 10) / 10;
  const healthIndex = Math.round(Math.max(0, 100 - riskScore) * 10) / 10;

  let riskTier = 'STABLE';
  let requiresEscalation = false;
  let clinicianRecommendation = 'ON TRACK: Recovery parameters, vitals, and functional mobility are within expected post-discharge thresholds.';
  let patientGuidance = 'Great work! Your recovery metrics indicate you are healing well on track. Continue following your prescribed diet, medications, and gentle mobility routine.';

  if (riskScore >= 60 || has_warning_symptoms || (oxygen_saturation && oxygen_saturation < 92)) {
    riskTier = 'CRITICAL_ATTENTION';
    requiresEscalation = true;
    clinicianRecommendation = 'URGENT: Patient exhibits acute deterioration signals or physiological instability. Contact patient within 4 hours to review symptoms, inspect surgical site/vitals, or instruct immediate emergency department presentation.';
    patientGuidance = 'Your reported recovery telemetry shows symptoms that require prompt clinical review. An alert has been dispatched to your clinician. If you experience severe chest pain, breathing difficulty, or uncontrollable bleeding, please call emergency services (112 / 108) immediately.';
  } else if (riskScore >= 30) {
    riskTier = 'MODERATE_RISK';
    requiresEscalation = false;
    clinicianRecommendation = 'MONITOR: Patient exhibits moderate discomfort, mild vital deviations, or partial medication compliance. Review medication adherence notes and check next scheduled check-in.';
    patientGuidance = 'Your recovery is progressing, but a few areas need close attention (such as rest, pain control, or medication schedule). Continue monitoring your symptoms closely and ensure all prescribed doses are taken on time.';
  }

  return {
    risk_score: riskScore,
    health_index: healthIndex,
    risk_tier: riskTier,
    contributing_factors: contributingFactors,
    nlp_detected_alerts: nlpAlerts,
    clinician_recommendation: clinicianRecommendation,
    patient_guidance: patientGuidance,
    requires_escalation: requiresEscalation,
    model_id: 'ML-REC-01',
    model_version: '1.0.0',
  };
};

/**
 * Assesses recovery deterioration with AI Service RPC and automatic resilient fallback
 */
export const assessRecoveryDeterioration = async (payload) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${getAIServiceBaseUrl()}/api/v1/predict/recovery-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (response.ok) {
      const data = await response.json();
      return {
        riskScore: data.risk_score,
        healthIndex: data.health_index,
        riskTier: data.risk_tier,
        contributingFactors: data.contributing_factors || [],
        nlpAlerts: data.nlp_detected_alerts || [],
        clinicianRecommendation: data.clinician_recommendation,
        patientGuidance: data.patient_guidance,
        requiresEscalation: Boolean(data.requires_escalation),
        calculatedAt: new Date(),
        modelId: data.model_id || 'ML-REC-01',
        modelVersion: data.model_version || '1.0.0',
      };
    }
  } catch (err) {
    // Service offline or timeout - fall through to local deterministic calculation
  } finally {
    clearTimeout(timeoutId);
  }

  // Local fallback execution
  const localRes = evaluateRecoveryRiskLocal(payload);
  return {
    riskScore: localRes.risk_score,
    healthIndex: localRes.health_index,
    riskTier: localRes.risk_tier,
    contributingFactors: localRes.contributing_factors,
    nlpAlerts: localRes.nlp_detected_alerts,
    clinicianRecommendation: localRes.clinician_recommendation,
    patientGuidance: localRes.patient_guidance,
    requiresEscalation: localRes.requires_escalation,
    calculatedAt: new Date(),
    modelId: localRes.model_id,
    modelVersion: localRes.model_version,
  };
};
