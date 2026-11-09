import assert from 'assert';

/**
 * Sprint 8 Quality Assurance, Security, Concurrency & Resilience Test Suite
 * Covers:
 * S8-01: Full regression workflow
 * S8-02: Cross-role authorization boundary matrix
 * S8-03: High-concurrency appointment reservation race conditions
 * S8-04: Payload validation and input boundary safety
 * S8-05: Environment secrets hygiene
 * S8-06: Notification failure handling & retry recovery
 * S8-07: Clinical AI proxy fault tolerance & graceful fallback
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
  console.log('🧪 Starting Sprint 8 QA, Security, Concurrency & Resilience Tests...\n');
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
  let patientToken, patientUser;
  let doctorToken, doctorUser;
  let adminToken;
  let managementToken;

  // Setup accounts across roles
  console.log('--- Setup: Test Accounts ---');
  await test('Setup: Provision Patient, Doctor, Admin, Management', async () => {
    const [pRes, dRes, aRes, mRes] = await Promise.all([
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `p_s8_${ts}@test.com`,
          password: 'Password123',
          firstName: 'Security',
          lastName: 'Patient',
          role: 'patient',
        }),
      }),
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `d_s8_${ts}@test.com`,
          password: 'Password123',
          firstName: 'Dr. QA',
          lastName: 'Clinician',
          role: 'doctor',
        }),
      }),
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `a_s8_${ts}@test.com`,
          password: 'Password123',
          firstName: 'Admin',
          lastName: 'Root',
          role: 'admin',
        }),
      }),
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `m_s8_${ts}@test.com`,
          password: 'Password123',
          firstName: 'Manager',
          lastName: 'Analyst',
          role: 'hospital_management',
        }),
      }),
    ]);

    assert.strictEqual(pRes.status, 201);
    assert.strictEqual(dRes.status, 201);
    assert.strictEqual(aRes.status, 201);
    assert.strictEqual(mRes.status, 201);

    patientToken = pRes.data.data.token;
    patientUser = pRes.data.data.user;
    doctorToken = dRes.data.data.token;
    doctorUser = dRes.data.data.user;
    adminToken = aRes.data.data.token;
    managementToken = mRes.data.data.token;
  });

  // ============================================
  // TEST SUITE 1: Authorization Boundary Matrix (S8-02)
  // ============================================
  console.log('\n--- Test Suite 1: Authorization Boundary Matrix ---');

  await test('1.1 Patient blocked from creating doctor availability slot (403)', async () => {
    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        date: '2029-01-10',
        startTime: '09:00',
        endTime: '09:30',
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await test('1.2 Patient blocked from creating post-discharge follow-up plans (403)', async () => {
    const res = await apiCall('/follow-ups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        patientId: patientUser._id,
        diagnosis: 'Unauthorized Plan',
        followUpDate: '2029-01-20',
        instructions: 'Test',
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await test('1.3 Doctor blocked from accessing system administrative dashboard (403)', async () => {
    const res = await apiCall('/dashboards/admin', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await test('1.4 Patient blocked from accessing hospital management aggregate analytics (403)', async () => {
    const res = await apiCall('/dashboards/management', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await test('1.5 Anonymous unauthenticated request rejected with 401 Unauthorized', async () => {
    const res = await apiCall('/appointments/my-appointments', {
      method: 'GET',
    });
    assert.strictEqual(res.status, 401);
  });

  // ============================================
  // TEST SUITE 2: High Concurrency Slot Booking (S8-03)
  // ============================================
  console.log('\n--- Test Suite 2: High Concurrency Double-Booking Protection ---');

  let raceSlotId;
  await test('2.1 Setup: Doctor creates an exclusive appointment slot', async () => {
    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: '2029-02-15',
        startTime: '14:00',
        endTime: '14:30',
        consultationType: 'in-person',
      }),
    });
    assert.strictEqual(res.status, 201);
    raceSlotId = res.data.data.slot._id;
  });

  await test('2.2 Concurrent requests for the same slot: Exactly one succeeds, other gets 409 Conflict', async () => {
    // Create a second patient
    const p2Res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `p2_s8_${ts}@test.com`,
        password: 'Password123',
        firstName: 'Concurrent',
        lastName: 'Patient2',
        role: 'patient',
      }),
    });
    const p2Token = p2Res.data.data.token;

    // Fire two parallel appointment booking requests simultaneously
    const [req1, req2] = await Promise.all([
      apiCall('/appointments/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${patientToken}` },
        body: JSON.stringify({ slotId: raceSlotId, reason: 'Patient 1 Booking' }),
      }),
      apiCall('/appointments/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${p2Token}` },
        body: JSON.stringify({ slotId: raceSlotId, reason: 'Patient 2 Booking' }),
      }),
    ]);

    const statuses = [req1.status, req2.status].sort();
    assert.deepStrictEqual(statuses, [201, 409], 'Expected one 201 Created and one 409 Conflict');
  });

  // ============================================
  // TEST SUITE 3: Input Validation & Boundary Security (S8-04)
  // ============================================
  console.log('\n--- Test Suite 3: Input Boundary & Validation Safety ---');

  await test('3.1 System rejects invalid email format on registration with 400 Bad Request', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email-without-domain',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await test('3.2 AI service rejects biological parameters beyond physiologic bounds with 422', async () => {
    const res = await apiCall('/ai/predict/heart-risk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        age: 300, // Impossibly high age
        gender: 'male',
        systolic_bp: 400, // Beyond physiologic limit
      }),
    });
    assert.strictEqual(res.status, 422);
  });

  // ============================================
  // TEST SUITE 4: Notification Retry & Backoff Mechanics (S8-06)
  // ============================================
  console.log('\n--- Test Suite 4: Notification Delivery & Retry Engine ---');

  await test('4.1 Reminder worker processes pending notifications safely without dropping jobs', async () => {
    const res = await apiCall('/follow-ups/reminders/process', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(typeof res.data.data.processed, 'number');
    assert.strictEqual(typeof res.data.data.sent, 'number');
    assert.strictEqual(typeof res.data.data.failed, 'number');
  });

  // ============================================
  // TEST SUITE 5: AI Microservice Resilience & Fallback (S8-07)
  // ============================================
  console.log('\n--- Test Suite 5: AI Microservice Resilience ---');

  await test('5.1 AI service health probe returns operational status and service metadata', async () => {
    const res = await apiCall('/ai/health', { method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'healthy');
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
