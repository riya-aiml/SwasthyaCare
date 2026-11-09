import assert from 'assert';

/**
 * Sprint 5 Post-Discharge Follow-Up Test Suite
 * Tests all follow-up care plans, recovery updates, reminders & authorization boundaries
 */

const BASE_URL = 'http://localhost:3001/api';

const testDoctor = {
  email: `doctor_sprint5_${Date.now()}@test.com`,
  password: 'Doctor123',
  firstName: 'Siddhartha',
  lastName: 'Mukherjee',
  role: 'doctor',
};

const testPatient1 = {
  email: `patient1_sprint5_${Date.now()}@test.com`,
  password: 'Patient123',
  firstName: 'Aarav',
  lastName: 'Patel',
  role: 'patient',
};

const testPatient2 = {
  email: `patient2_sprint5_${Date.now()}@test.com`,
  password: 'Patient123',
  firstName: 'Diya',
  lastName: 'Kapoor',
  role: 'patient',
};

let doctorToken = '';
let patient1Token = '';
let patient1Id = '';
let patient2Token = '';
let planId = '';
let recoveryUpdateId = '';

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
  console.log('🧪 Starting Sprint 5 Post-Discharge Follow-up Tests...\n');
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

  // Setup Users
  console.log('--- Setup Users ---');
  await test('Setup: Register Doctor', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testDoctor),
    });
    assert.strictEqual(res.status, 201);
    doctorToken = res.data.data.token;
  });

  await test('Setup: Register Patient 1', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient1),
    });
    assert.strictEqual(res.status, 201);
    patient1Token = res.data.data.token;
    patient1Id = res.data.data.user._id;
  });

  await test('Setup: Register Patient 2', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient2),
    });
    assert.strictEqual(res.status, 201);
    patient2Token = res.data.data.token;
  });

  // ============================================
  // TEST SUITE 1: Clinician Care Plan Creation
  // ============================================
  console.log('\n--- Plan Creation & Authorization Tests ---');

  await test('1.1 Doctor can create a follow-up plan for a patient', async () => {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 14);

    const res = await apiCall('/follow-ups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        patientId: patient1Id,
        diagnosis: 'Post-CABG Recovery Stage 1',
        followUpDate: followUpDate.toISOString(),
        instructions: 'Rest for 2 weeks. Avoid lifting heavy objects. Monitor BP twice daily.',
        medications: [
          { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily after breakfast', durationDays: 30 },
          { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', durationDays: 14 },
        ],
        targetMetrics: {
          bloodPressureTarget: '< 130/80 mmHg',
          pulseRange: '60-85 bpm',
        },
        warningSymptoms: ['Chest tightness', 'Shortness of breath at rest', 'Fever > 100.4 F'],
        reminderCadenceDays: [1, 3, 7, 14],
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.plan.diagnosis, 'Post-CABG Recovery Stage 1');
    assert.strictEqual(res.data.data.plan.medications.length, 2);
    planId = res.data.data.plan._id;
  });

  await test('1.2 Patient CANNOT create follow-up plans (403 Forbidden)', async () => {
    const res = await apiCall('/follow-ups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify({
        patientId: patient1Id,
        diagnosis: 'Unauthorized Self Plan',
        followUpDate: new Date().toISOString(),
        instructions: 'Test',
      }),
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  // ============================================
  // TEST SUITE 2: Patient Access Boundaries
  // ============================================
  console.log('\n--- Patient Access & Privacy Tests ---');

  await test('2.1 Patient 1 can view their own follow-up plans', async () => {
    const res = await apiCall('/follow-ups/my-plans', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient1Token}` },
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.plans.length >= 1);
    assert.strictEqual(res.data.data.plans[0]._id, planId);
  });

  await test('2.2 Patient 2 CANNOT access Patient 1\'s specific plan (403 Forbidden)', async () => {
    const res = await apiCall(`/follow-ups/${planId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient2Token}` },
    });

    assert.strictEqual(res.status, 403);
    assert.ok(res.data.error.message.includes('permission'));
  });

  await test('2.3 Patient 1 can retrieve their full plan with updates', async () => {
    const res = await apiCall(`/follow-ups/${planId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient1Token}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.plan._id, planId);
    assert.ok(Array.isArray(res.data.data.updates));
  });

  // ============================================
  // TEST SUITE 3: Patient Recovery Updates
  // ============================================
  console.log('\n--- Recovery Update Tests ---');

  await test('3.1 Patient 1 can submit a daily recovery update', async () => {
    const res = await apiCall(`/follow-ups/${planId}/recovery-updates`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify({
        recoveryRating: 4,
        painLevel: 2,
        mobilityScore: 'Slightly Restricted',
        vitals: {
          bloodPressureSystolic: 122,
          bloodPressureDiastolic: 78,
          heartRate: 72,
          temperatureCelsius: 36.8,
          oxygenSaturation: 98,
        },
        medicationAdherence: 'Full',
        adherenceNotes: 'Took all morning and evening doses as prescribed',
        currentSymptoms: ['Mild surgical site soreness'],
        hasWarningSymptoms: false,
        patientNotes: 'Feeling significantly stronger today, walked around the living room.',
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.update.recoveryRating, 4);
    assert.strictEqual(res.data.data.update.clinicianReview.status, 'STABLE');
    recoveryUpdateId = res.data.data.update._id;
  });

  await test('3.2 Patient 2 CANNOT submit recovery update to Patient 1\'s plan (403)', async () => {
    const res = await apiCall(`/follow-ups/${planId}/recovery-updates`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient2Token}` },
      body: JSON.stringify({
        recoveryRating: 3,
        patientNotes: 'Malicious update attempt',
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  await test('3.3 Recovery update with warning symptoms flags NEEDS_ATTENTION', async () => {
    const res = await apiCall(`/follow-ups/${planId}/recovery-updates`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify({
        recoveryRating: 2,
        painLevel: 6,
        hasWarningSymptoms: true,
        currentSymptoms: ['Shortness of breath at rest', 'Elevated temperature'],
        vitals: {
          bloodPressureSystolic: 165,
          bloodPressureDiastolic: 98,
        },
        patientNotes: 'Chest feeling tighter than yesterday',
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.data.update.clinicianReview.status, 'NEEDS_ATTENTION');
  });

  // ============================================
  // TEST SUITE 4: Clinician Review
  // ============================================
  console.log('\n--- Clinician Review Tests ---');

  await test('4.1 Clinician can view their assigned follow-up care plans', async () => {
    const res = await apiCall('/follow-ups/clinician/plans', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.plans.length >= 1);
  });

  await test('4.2 Clinician can review and provide feedback on patient recovery update', async () => {
    const res = await apiCall(`/follow-ups/updates/${recoveryUpdateId}/review`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        status: 'STABLE',
        clinicianFeedback: 'Vitals look excellent. Surgical site soreness is normal at this stage. Keep resting.',
        escalationRequired: false,
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.update.clinicianReview.isReviewed, true);
    assert.ok(res.data.data.update.clinicianReview.clinicianFeedback.includes('Vitals look excellent'));
  });

  await test('4.3 Patient CANNOT review recovery updates (403 Forbidden)', async () => {
    const res = await apiCall(`/follow-ups/updates/${recoveryUpdateId}/review`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify({
        status: 'STABLE',
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  // ============================================
  // TEST SUITE 5: Reminders & Notification Worker
  // ============================================
  console.log('\n--- Notification Jobs & Reminder Worker Tests ---');

  await test('5.1 Plan creation automatically scheduled reminder jobs for [1, 3, 7, 14] days', async () => {
    const res = await apiCall(`/follow-ups/reminders?planId=${planId}&type=RECOVERY_CHECKIN_PROMPT`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.jobs.length, 4); // Days 1, 3, 7, 14
    assert.strictEqual(res.data.data.jobs[0].status, 'PENDING');
  });

  await test('5.2 Notification content avoids unnecessary sensitive diagnosis details (S5 privacy criteria)', async () => {
    const res = await apiCall(`/follow-ups/reminders?planId=${planId}&type=RECOVERY_CHECKIN_PROMPT`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    const job = res.data.data.jobs[0];
    assert.ok(!job.message.includes('CABG'));
    assert.ok(job.message.includes('recovery reminder'));
  });

  await test('5.3 Reminder worker processes due notifications with attempt logging', async () => {
    const res = await apiCall('/follow-ups/reminders/process', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.processed >= 0);
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
