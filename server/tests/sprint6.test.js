import assert from 'assert';

/**
 * Sprint 6 AI Service & Clinical Decision Support Test Suite
 * Tests Heart Risk, Diabetes Risk, Medicine Package OCR, Disclaimers & Express proxy
 */

const BASE_URL = 'http://localhost:3001/api';

const testPatient = {
  email: `patient_sprint6_${Date.now()}@test.com`,
  password: 'Patient123',
  firstName: 'Priya',
  lastName: 'Menon',
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
  console.log('🧪 Starting Sprint 6 AI Service & Risk Models Tests...\n');
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

  // Setup User
  console.log('--- Setup User ---');
  await test('Setup: Register Patient', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient),
    });
    assert.strictEqual(res.status, 201);
    userToken = res.data.data.token;
  });

  // ============================================
  // TEST SUITE 1: Service Health & Connectivity
  // ============================================
  console.log('\n--- Service Connectivity Tests ---');

  await test('1.1 Express backend connects to Python FastAPI service health endpoint', async () => {
    const res = await apiCall('/ai/health', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'healthy');
    assert.strictEqual(res.data.data.service, 'SwasthyaCare AI Service');
  });

  await test('1.2 AI prediction routes require authentication (401 Unauthorized)', async () => {
    const res = await apiCall('/ai/predict/heart-risk', {
      method: 'POST',
      body: JSON.stringify({ age: 45 }),
    });
    assert.strictEqual(res.status, 401);
  });

  // ============================================
  // TEST SUITE 2: Heart Risk Inference Prototype
  // ============================================
  console.log('\n--- Heart Risk Model Tests ---');

  await test('2.1 Heart risk model returns score, category, factors & model metadata', async () => {
    const res = await apiCall('/ai/predict/heart-risk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        age: 58,
        gender: 'male',
        systolic_bp: 152,
        diastolic_bp: 94,
        total_cholesterol: 240,
        hdl_cholesterol: 38,
        smoker: true,
        diabetic: false,
        on_bp_medication: true,
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const result = res.data.data;
    assert.ok(result.ten_year_risk_percentage > 0);
    assert.ok(['LOW', 'BORDERLINE', 'INTERMEDIATE', 'HIGH'].includes(result.risk_category));
    assert.strictEqual(result.model_id, 'swasthya-cardiac-risk');
    assert.ok(result.model_version);
    assert.ok(result.timestamp_utc);
    assert.ok(result.contributing_factors.length > 0);
  });

  await test('2.2 Heart risk response contains mandatory clinical safety disclaimer', async () => {
    const res = await apiCall('/ai/predict/heart-risk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        age: 45,
        gender: 'female',
        systolic_bp: 120,
        diastolic_bp: 80,
        total_cholesterol: 180,
        hdl_cholesterol: 55,
        smoker: false,
        diabetic: false,
      }),
    });

    assert.strictEqual(res.status, 200);
    const disclaimer = res.data.data.disclaimer;
    assert.ok(disclaimer);
    assert.ok(disclaimer.includes('PRELIMINARY RISK ESTIMATE'));
    assert.ok(disclaimer.includes('DOES NOT constitute a medical diagnosis'));
  });

  await test('2.3 Out-of-range input is rejected with 422 Unprocessable Entity', async () => {
    const res = await apiCall('/ai/predict/heart-risk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        age: 180, // Invalid age
        gender: 'male',
        systolic_bp: 120,
        diastolic_bp: 80,
        total_cholesterol: 180,
        hdl_cholesterol: 55,
        smoker: false,
        diabetic: false,
      }),
    });

    assert.strictEqual(res.status, 422);
  });

  // ============================================
  // TEST SUITE 3: Diabetes Risk Inference Prototype
  // ============================================
  console.log('\n--- Diabetes Risk Model Tests ---');

  await test('3.1 Diabetes risk model calculates FINDRISC score & category', async () => {
    const res = await apiCall('/ai/predict/diabetes-risk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        age: 52,
        bmi: 31.5,
        waist_circumference_cm: 104.0,
        daily_physical_activity: false,
        diet_vegetables_daily: false,
        history_high_bp: true,
        history_high_glucose: true,
        family_history_diabetes: 'first_degree',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const result = res.data.data;
    assert.ok(result.risk_score >= 15);
    assert.ok(['HIGH', 'VERY_HIGH'].includes(result.risk_category));
    assert.ok(result.key_drivers.length >= 3);
    assert.ok(result.preventive_guidelines.length > 0);
    assert.ok(result.disclaimer.includes('PRELIMINARY RISK ESTIMATE'));
  });

  // ============================================
  // TEST SUITE 4: Medicine Package OCR & Matching
  // ============================================
  console.log('\n--- Medicine Package OCR Tests ---');

  await test('4.1 OCR extracts packaging tokens and matches candidate formulary medicine', async () => {
    const res = await apiCall('/ai/ocr/medicine', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        text: 'Lipitor Atorvastatin Calcium 20mg Film Coated Tablets',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const ocrResult = res.data.data;
    assert.strictEqual(ocrResult.is_inconclusive, false);
    assert.ok(ocrResult.candidate_matches.length > 0);
    const match = ocrResult.candidate_matches[0];
    assert.strictEqual(match.brand_name, 'Lipitor');
    assert.strictEqual(match.generic_name, 'Atorvastatin Calcium');
    assert.ok(ocrResult.safety_advisory.includes('Never start, discontinue, or alter dosages'));
  });

  await test('4.2 OCR returns explicit is_inconclusive: true on unrecognized/blurred text', async () => {
    const res = await apiCall('/ai/ocr/medicine', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        text: 'random gibberish text 12345 non-medicine',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.is_inconclusive, true);
  });

  // ============================================
  // Test Summary
  // ============================================
  console.log('\n========================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
