import assert from 'assert';

/**
 * Sprint 6 ML Inference Integration & Express Gateway Security Test Suite
 * Tests Tasks: ML-S6-01 through ML-S6-09 & ML-PB-10, ML-PB-11
 *
 * Verifies:
 * 1. Express JWT authentication protection on ML assessment routes.
 * 2. Secure server-to-server RPC with X-Internal-Service-Key.
 * 3. Health & model registry readiness endpoint (/api/ai/assessments/health).
 * 4. Diabetes current-status inference (ML-DIA-01).
 * 5. Cardiovascular current-status inference (ML-CVD-01).
 * 6. Input boundary validation and biological constraint enforcement.
 * 7. FDA SaMD compliant response structure (non-diagnostic labels & disclaimers).
 */

const BASE_URL = 'http://localhost:3001/api';

const testPatient = {
  email: `ml_patient_${Date.now()}@test.com`,
  password: 'Password123!',
  firstName: 'Aarav',
  lastName: 'Sharma',
  role: 'patient',
};

let userToken = '';

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
  console.log('🧪 Starting Sprint 6 ML Inference Integration Tests...\n');
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

  // Setup: Register Test Patient
  console.log('--- Setup: Test Patient ---');
  await test('Setup: Register Patient and Obtain JWT Token', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient),
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.data.token);
    userToken = res.data.data.token;
  });

  // ============================================
  // TEST SUITE 1: Security & Authentication Gates
  // ============================================
  console.log('\n--- Suite 1: Express Security & JWT Gates ---');

  await test('1.1 Unauthenticated requests to /api/ai/assessments/health are rejected (401)', async () => {
    const res = await apiCall('/ai/assessments/health', { method: 'GET' });
    assert.strictEqual(res.status, 401);
  });

  await test('1.2 Unauthenticated requests to diabetes assessment are rejected (401)', async () => {
    const res = await apiCall('/ai/assessments/diabetes/current-status', {
      method: 'POST',
      body: JSON.stringify({ age: 45 }),
    });
    assert.strictEqual(res.status, 401);
  });

  await test('1.3 Unauthenticated requests to cardiovascular assessment are rejected (401)', async () => {
    const res = await apiCall('/ai/assessments/cardiovascular/current-status', {
      method: 'POST',
      body: JSON.stringify({ age: 55 }),
    });
    assert.strictEqual(res.status, 401);
  });

  // ============================================
  // TEST SUITE 2: Internal Model Registry Health
  // ============================================
  console.log('\n--- Suite 2: Model Registry & Health Probe ---');

  await test('2.1 Authenticated client checks internal ML model readiness and operational status', async () => {
    const res = await apiCall('/ai/assessments/health', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'operational');
    assert.strictEqual(res.data.data.models_loaded['ML-DIA-01'], true);
    assert.strictEqual(res.data.data.models_loaded['ML-CVD-01'], true);
    assert.ok(res.data.data.metadata['ML-DIA-01']);
    assert.ok(res.data.data.metadata['ML-CVD-01']);
  });

  // ============================================
  // TEST SUITE 3: Diabetes Current-Status Inference (ML-DIA-01)
  // ============================================
  console.log('\n--- Suite 3: Diabetes Current-Status Inference (ML-DIA-01) ---');

  await test('3.1 Valid diabetes survey parameters return calibrated prediction and clinical factors', async () => {
    const payload = {
      age: 56,
      sex: 'female',
      bmi: 31.8,
      high_bp: true,
      high_chol: true,
      chol_check_5yr: true,
      stroke_history: false,
      heart_disease_or_attack: false,
      smoker: false,
      phys_activity: false,
      fruits_daily: true,
      veggies_daily: true,
      heavy_alcohol: false,
      gen_hlth: 3,
      ment_hlth_days: 2,
      phys_hlth_days: 5,
      diff_walk: false,
      any_healthcare: true,
      no_doc_bc_cost: false,
      education_level: 4,
      income_level: 5,
    };

    const res = await apiCall('/ai/assessments/diabetes/current-status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const assessment = res.data.data;
    assert.strictEqual(assessment.task_id, 'ML-DIA-01');
    assert.strictEqual(assessment.model_id, 'diabetes-current-status-lr');
    assert.strictEqual(assessment.model_version, '1.0.0');
    assert.strictEqual(assessment.assessment_status, 'completed');
    assert.ok(assessment.prediction === 0 || assessment.prediction === 1);
    assert.ok(assessment.probability >= 0.0 && assessment.probability <= 1.0);
    assert.ok(assessment.output_label.includes('Reported Profile'));
    assert.ok(assessment.contributing_factors.length > 0);
    assert.ok(assessment.lifestyle_recommendations.length > 0);
    assert.ok(assessment.limitations.length > 0);
    assert.ok(assessment.disclaimer.includes('EDUCATIONAL PROTOTYPE ONLY'));
  });

  await test('3.2 Biological boundary violation (BMI 85 kg/m²) is rejected with 422', async () => {
    const invalidPayload = {
      age: 45,
      sex: 'male',
      bmi: 85.0, // Exceeds physiological upper bound 70.0
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

    const res = await apiCall('/ai/assessments/diabetes/current-status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 422);
    assert.strictEqual(res.data.success, false);
  });

  // ============================================
  // TEST SUITE 4: Cardiovascular Current-Status Inference (ML-CVD-01)
  // ============================================
  console.log('\n--- Suite 4: Cardiovascular Current-Status Inference (ML-CVD-01) ---');

  await test('4.1 Diagnostic catheterization biomarkers return calibrated stenosis classification', async () => {
    const payload = {
      age: 60,
      sex: 'male',
      chest_pain_type: 4,
      resting_bp: 145,
      cholesterol: 275,
      fasting_blood_sugar_gt_120: true,
      resting_ecg: 2,
      max_heart_rate: 130,
      exercise_induced_angina: true,
      st_depression: 2.5,
      st_slope: 2,
      num_major_vessels: 2,
      thalassemia: 7,
    };

    const res = await apiCall('/ai/assessments/cardiovascular/current-status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const assessment = res.data.data;
    assert.strictEqual(assessment.task_id, 'ML-CVD-01');
    assert.strictEqual(assessment.model_id, 'cardiovascular-current-status-rf');
    assert.strictEqual(assessment.model_version, '1.0.0');
    assert.strictEqual(assessment.assessment_status, 'completed');
    assert.ok(assessment.prediction === 0 || assessment.prediction === 1);
    assert.ok(assessment.probability >= 0.0 && assessment.probability <= 1.0);
    assert.ok(assessment.output_label.includes('Biomarker Pattern'));
    assert.ok(assessment.contributing_factors.length > 0);
    assert.ok(assessment.clinical_recommendations.length > 0);
    assert.ok(assessment.limitations.length > 0);
    assert.ok(assessment.disclaimer.includes('EDUCATIONAL PROTOTYPE ONLY'));
  });

  await test('4.2 Invalid Thalassemia code is rejected with 422 Unprocessable Entity', async () => {
    const invalidPayload = {
      age: 50,
      sex: 'female',
      chest_pain_type: 2,
      resting_bp: 120,
      cholesterol: 200,
      fasting_blood_sugar_gt_120: false,
      resting_ecg: 0,
      max_heart_rate: 155,
      exercise_induced_angina: false,
      st_depression: 0.0,
      st_slope: 1,
      num_major_vessels: 0,
      thalassemia: 9, // Invalid: must be 3, 6, or 7
    };

    const res = await apiCall('/ai/assessments/cardiovascular/current-status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 422);
    assert.strictEqual(res.data.success, false);
  });

  console.log('\n========================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
