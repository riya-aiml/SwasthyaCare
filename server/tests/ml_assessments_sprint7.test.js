import assert from 'assert';

/**
 * Sprint 7 ML Application Integration, Persistence & Assessment History Test Suite
 * Tasks: ML-S7-01 through ML-S7-09 & ML-PB-12
 *
 * Verifies:
 * 1. Express creates and persists risk assessments to MongoDB (riskAssessments collection).
 * 2. Immutable audit trails with task ID, model ID, version, calibrated probability, and SaMD disclaimers.
 * 3. Patient history retrieval (GET /api/assessments/my-history).
 * 4. Critical Patient-Data Isolation (Patient B blocked from viewing Patient A's assessment).
 * 5. Clinician review capabilities (Doctor can view patient history & submit clinical review notes).
 * 6. Role-based authorization boundaries on clinician review endpoints.
 * 7. Physiologic boundary rejection preserves database integrity (no records saved on 422).
 */

const BASE_URL = 'http://localhost:3001/api';

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
  console.log('🧪 Starting Sprint 7 ML Application Integration & History Tests...\n');
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

  const ts = Date.now();
  let patient1Token, patient1Id;
  let patient2Token, patient2Id;
  let doctorToken, doctorId;
  let assessment1Id, assessment2Id;

  // Setup Accounts
  console.log('--- Setup: Register Test Accounts ---');
  await test('Setup: Register Patient 1, Patient 2, and Doctor', async () => {
    const [p1Res, p2Res, docRes] = await Promise.all([
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `p1_s7_${ts}@test.com`,
          password: 'Password123!',
          firstName: 'Ananya',
          lastName: 'Iyer',
          role: 'patient',
        }),
      }),
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `p2_s7_${ts}@test.com`,
          password: 'Password123!',
          firstName: 'Vikram',
          lastName: 'Patel',
          role: 'patient',
        }),
      }),
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `dr_s7_${ts}@test.com`,
          password: 'Password123!',
          firstName: 'Dr. Suresh',
          lastName: 'Rao',
          role: 'doctor',
        }),
      }),
    ]);

    assert.strictEqual(p1Res.status, 201);
    assert.strictEqual(p2Res.status, 201);
    assert.strictEqual(docRes.status, 201);

    patient1Token = p1Res.data.data.token;
    patient1Id = p1Res.data.data.user._id;

    patient2Token = p2Res.data.data.token;
    patient2Id = p2Res.data.data.user._id;

    doctorToken = docRes.data.data.token;
    doctorId = docRes.data.data.user._id;
  });

  // ============================================
  // SUITE 1: Assessment Execution & MongoDB Persistence (ML-S7-04 & ML-S7-05)
  // ============================================
  console.log('\n--- Suite 1: Assessment Execution & MongoDB Persistence ---');

  await test('1.1 Patient 1 submits diabetes assessment, receives calibrated prediction, and persists record', async () => {
    const payload = {
      age: 50,
      sex: 'female',
      bmi: 29.5,
      high_bp: true,
      high_chol: true,
      chol_check_5yr: true,
      stroke_history: false,
      heart_disease_or_attack: false,
      smoker: false,
      phys_activity: true,
      fruits_daily: true,
      veggies_daily: true,
      heavy_alcohol: false,
      gen_hlth: 3,
      ment_hlth_days: 1,
      phys_hlth_days: 2,
      diff_walk: false,
      any_healthcare: true,
      no_doc_bc_cost: false,
      education_level: 5,
      income_level: 6,
      provenance: {
        source: 'manual_entry',
        patientConfirmed: true,
      },
    };

    const res = await apiCall('/assessments/diabetes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    const doc = res.data.data;
    assert.ok(doc._id);
    assessment1Id = doc._id;
    assert.strictEqual(doc.patient.toString(), patient1Id.toString());
    assert.strictEqual(doc.taskId, 'ML-DIA-01');
    assert.strictEqual(doc.modelId, 'diabetes-current-status-lr');
    assert.strictEqual(doc.modelVersion, '1.0.0');
    assert.strictEqual(doc.assessmentStatus, 'completed');
    assert.ok(doc.probability >= 0.0 && doc.probability <= 1.0);
    assert.ok(doc.outputLabel.includes('Reported Profile'));
    assert.ok(doc.contributingFactors.length > 0);
    assert.ok(doc.clinicalRecommendations.length > 0);
    assert.ok(doc.disclaimer.includes('EDUCATIONAL PROTOTYPE ONLY'));
    assert.strictEqual(doc.provenance.source, 'manual_entry');
    assert.strictEqual(doc.provenance.patientConfirmed, true);
  });

  await test('1.2 Patient 1 submits cardiovascular assessment with OCR provenance and persists record', async () => {
    const payload = {
      age: 64,
      sex: 'male',
      chest_pain_type: 4,
      resting_bp: 150,
      cholesterol: 290,
      fasting_blood_sugar_gt_120: true,
      resting_ecg: 2,
      max_heart_rate: 120,
      exercise_induced_angina: true,
      st_depression: 2.8,
      st_slope: 2,
      num_major_vessels: 2,
      thalassemia: 7,
      provenance: {
        source: 'ocr_extraction',
        patientConfirmed: true,
      },
    };

    const res = await apiCall('/assessments/cardiovascular', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    const doc = res.data.data;
    assert.ok(doc._id);
    assessment2Id = doc._id;
    assert.strictEqual(doc.patient.toString(), patient1Id.toString());
    assert.strictEqual(doc.taskId, 'ML-CVD-01');
    assert.strictEqual(doc.modelId, 'cardiovascular-current-status-rf');
    assert.strictEqual(doc.prediction, 1);
    assert.ok(doc.outputLabel.includes('Biomarker Pattern'));
    assert.strictEqual(doc.provenance.source, 'ocr_extraction');
    assert.strictEqual(doc.provenance.patientConfirmed, true);
  });

  await test('1.3 Invalid biological input is rejected with 422 and does not persist record', async () => {
    const payload = {
      age: 45,
      sex: 'female',
      bmi: 88.0, // Invalid: exceeds max 70.0
      high_bp: false,
      high_chol: false,
      smoker: false,
      phys_activity: true,
      fruits_daily: true,
      veggies_daily: true,
      gen_hlth: 2,
      ment_hlth_days: 0,
      phys_hlth_days: 0,
    };

    const res = await apiCall('/assessments/diabetes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 422);
    assert.strictEqual(res.data.success, false);
  });

  // ============================================
  // SUITE 2: Patient Assessment History & Patient Isolation (ML-S7-06)
  // ============================================
  console.log('\n--- Suite 2: Patient Assessment History & Privacy Isolation ---');

  await test('2.1 Patient 1 retrieves their own assessment history (sees 2 records)', async () => {
    const res = await apiCall('/assessments/my-history', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient1Token}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.count, 2);
    assert.strictEqual(res.data.data.length, 2);
    assert.strictEqual(res.data.data[0].patient.toString(), patient1Id.toString());
  });

  await test('2.2 Patient 2 retrieves their own history (isolated: sees 0 records)', async () => {
    const res = await apiCall('/assessments/my-history', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient2Token}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.count, 0);
    assert.strictEqual(res.data.data.length, 0);
  });

  await test('2.3 CRITICAL SECURITY: Patient 2 is blocked from viewing Patient 1 assessment (403 Forbidden)', async () => {
    const res = await apiCall(`/assessments/${assessment1Id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient2Token}` },
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.error.message.includes('Access denied'));
  });

  await test('2.4 Patient 1 can retrieve their own assessment details by ID (200 OK)', async () => {
    const res = await apiCall(`/assessments/${assessment1Id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient1Token}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data._id.toString(), assessment1Id.toString());
  });

  // ============================================
  // SUITE 3: Clinician Review & Multi-Role Permissions (ML-S7-07)
  // ============================================
  console.log('\n--- Suite 3: Clinician Review View & Multi-Role Permissions ---');

  await test('3.1 Doctor can retrieve Patient 1 assessment history for clinical review', async () => {
    const res = await apiCall(`/assessments/patient/${patient1Id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.count, 2);
    assert.strictEqual(res.data.data.length, 2);
  });

  await test('3.2 Patient 2 is blocked from accessing Patient 1 history via clinician endpoint (403)', async () => {
    const res = await apiCall(`/assessments/patient/${patient1Id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient2Token}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await test('3.3 Doctor attaches clinical review notes and physician sign-off to assessment', async () => {
    const reviewPayload = {
      clinicianNotes: 'Confirmed Stage 2 hypertension and dyslipidemia. Ordered fasting plasma glucose and lipid panel. Advised aerobic exercise protocol.',
    };

    const res = await apiCall(`/assessments/${assessment1Id}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify(reviewPayload),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const updated = res.data.data;
    assert.strictEqual(updated.clinicianNotes, reviewPayload.clinicianNotes);
    assert.strictEqual(updated.reviewedBy.toString(), doctorId.toString());
    assert.ok(updated.reviewedAt);
  });

  await test('3.4 Patient cannot review or sign off on assessments (403 Forbidden)', async () => {
    const res = await apiCall(`/assessments/${assessment1Id}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify({ clinicianNotes: 'Attempted patient override' }),
    });

    assert.strictEqual(res.status, 403);
  });

  console.log('\n========================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
