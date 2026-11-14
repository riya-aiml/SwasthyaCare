import assert from 'assert';

/**
 * ML-REC-01: Post-Discharge Deterioration & Readmission ML Inference Test Suite
 * Tests full-stack integration between Node.js API Gateway, MongoDB, and Python AI Microservice.
 */

const BASE_URL = 'http://localhost:3001/api';

const testDoctor = {
  email: `doctor_ml_rec_${Date.now()}@test.com`,
  password: 'Doctor123',
  firstName: 'Vikram',
  lastName: 'Sarabhai',
  role: 'doctor',
};

const testPatient = {
  email: `patient_ml_rec_${Date.now()}@test.com`,
  password: 'Patient123',
  firstName: 'Pooja',
  lastName: 'Hegde',
  role: 'patient',
};

let doctorToken = '';
let patientToken = '';
let patientId = '';
let planId = '';

const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json();
  return { status: response.status, data };
};

async function runTests() {
  console.log('🧪 Starting ML-REC-01 Post-Discharge ML Deterioration Tests...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  };

  // 1. Setup Users & Care Plan
  console.log('--- 1. Setup Doctor, Patient & Follow-Up Plan ---');
  await test('1.1 Register Doctor and Patient', async () => {
    const docRes = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testDoctor),
    });
    assert.strictEqual(docRes.status, 201);
    doctorToken = docRes.data.data.token;

    const patRes = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient),
    });
    assert.strictEqual(patRes.status, 201);
    patientToken = patRes.data.data.token;
    patientId = patRes.data.data.user._id;
  });

  await test('1.2 Doctor creates care plan with medications and target metrics', async () => {
    const res = await apiCall('/follow-ups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        patientId,
        diagnosis: 'Post-Laparoscopic Cholecystectomy',
        followUpDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        instructions: 'Monitor wound dressing. Take oral analgesics as needed. Gentle mobilization.',
        medications: [
          { name: 'Cefixime', dosage: '200 mg', frequency: 'Twice daily', durationDays: 5 },
          { name: 'Paracetamol', dosage: '650 mg', frequency: 'As needed for pain', durationDays: 7 },
        ],
        targetMetrics: {
          bloodPressureTarget: '< 130/85',
          pulseRange: '60-90 bpm',
        },
        warningSymptoms: ['High fever > 38.5 C', 'Severe abdominal pain', 'Wound pus or active bleeding'],
      }),
    });
    assert.strictEqual(res.status, 201);
    planId = res.data.data.plan._id;
  });

  // 2. Direct ML Inference Endpoint
  console.log('\n--- 2. Direct AI Microservice Proxy Endpoint Tests ---');
  await test('2.1 POST /api/ai/predict/recovery-risk executes calibrated Random Forest inference', async () => {
    const res = await apiCall('/ai/predict/recovery-risk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        recovery_rating: 4,
        pain_level: 2,
        mobility_score: 'Normal',
        systolic_bp: 122,
        diastolic_bp: 78,
        heart_rate: 74,
        temperature_celsius: 36.8,
        oxygen_saturation: 98,
        medication_adherence: 'Full',
        patient_notes: 'Feeling good, taking short walks.',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const data = res.data.data;
    assert.strictEqual(data.model_id, 'ML-REC-01');
    assert.strictEqual(data.risk_tier, 'STABLE');
    assert.ok(data.health_index >= 70);
    assert.strictEqual(data.requires_escalation, false);
    assert.ok(Array.isArray(data.contributing_factors));
  });

  // 3. Recovery Update Submission with ML Scoring
  console.log('\n--- 3. Recovery Updates Ingesting ML-REC-01 Predictions ---');
  await test('3.1 Patient submits stable update: model returns STABLE and updates plan telemetry', async () => {
    const res = await apiCall(`/follow-ups/${planId}/recovery-updates`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        recoveryRating: 4,
        painLevel: 2,
        mobilityScore: 'Normal',
        vitals: {
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          heartRate: 72,
          temperatureCelsius: 36.7,
          oxygenSaturation: 98,
        },
        medicationAdherence: 'Full',
        patientNotes: 'Wound looks clean and dry. No fever.',
      }),
    });

    if (res.status !== 201) console.log("3.1 error response:", res.data);
    assert.strictEqual(res.status, 201);
    const update = res.data.data.update;
    assert.ok(update.aiRiskAssessment);
    assert.strictEqual(update.aiRiskAssessment.modelId, 'ML-REC-01');
    assert.strictEqual(update.aiRiskAssessment.riskTier, 'STABLE');
    assert.strictEqual(update.clinicianReview.status, 'STABLE');
    assert.ok(update.aiRiskAssessment.healthIndex >= 70);

    // Verify Plan metadata was updated
    const planRes = await apiCall(`/follow-ups/${planId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert.strictEqual(planRes.status, 200);
    assert.strictEqual(planRes.data.data.plan.latestRiskTier, 'STABLE');
  });

  await test('3.2 Patient submits adverse check-in: ML model flags CRITICAL_ATTENTION with NLP wound alerts', async () => {
    const res = await apiCall(`/follow-ups/${planId}/recovery-updates`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        recoveryRating: 1,
        painLevel: 9,
        mobilityScore: 'Bedridden',
        vitals: {
          bloodPressureSystolic: 172,
          bloodPressureDiastolic: 104,
          heartRate: 122,
          temperatureCelsius: 39.1,
          oxygenSaturation: 89,
        },
        medicationAdherence: 'None',
        hasWarningSymptoms: true,
        patientNotes: 'Incision is red and oozing cloudy pus. Shivering violently and trouble breathing.',
      }),
    });

    assert.strictEqual(res.status, 201);
    const update = res.data.data.update;
    assert.ok(update.aiRiskAssessment);
    assert.strictEqual(update.aiRiskAssessment.riskTier, 'CRITICAL_ATTENTION');
    assert.strictEqual(update.clinicianReview.status, 'NEEDS_ATTENTION');
    assert.ok(update.aiRiskAssessment.riskScore >= 60);
    assert.ok(update.aiRiskAssessment.requiresEscalation);
    assert.ok(update.aiRiskAssessment.nlpAlerts.length > 0);

    // Check plan reflects latest critical status
    const planRes = await apiCall(`/follow-ups/${planId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.strictEqual(planRes.status, 200);
    assert.strictEqual(planRes.data.data.plan.latestRiskTier, 'CRITICAL_ATTENTION');
  });

  console.log('\n========================================');
  console.log(`📊 ML-REC-01 Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
