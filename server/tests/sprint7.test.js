import assert from 'assert';

/**
 * Sprint 7 Dashboards & End-to-End Integration Test Suite
 * Tests:
 * 1. Role-specific dashboards (Patient, Doctor, Admin, Hospital Management)
 * 2. Role-based authorization & boundary enforcement (403 Forbidden)
 * 3. Management aggregate privacy barrier (NO patient PII / individual medical records)
 * 4. Automatic appointment lifecycle notification triggers (REQUESTED, APPROVED)
 * 5. End-to-end integration across appointment, notification, and follow-up triage
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
  console.log('🧪 Starting Sprint 7 Dashboards & E2E Integration Tests...\n');
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

  const timestamp = Date.now();
  let patientToken, doctorToken, adminToken, managementToken;
  let patientUser, doctorUser;
  let createdSlotId, createdAppointmentId;

  // ============================================
  // Setup: Register 4 Distinct Role Accounts
  // ============================================
  console.log('--- Setup: Accounts Across All 4 Roles ---');

  await test('Setup: Register Patient', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `patient_s7_${timestamp}@test.com`,
        password: 'Password123',
        firstName: 'Ananya',
        lastName: 'Iyer',
        role: 'patient',
      }),
    });
    assert.strictEqual(res.status, 201);
    patientToken = res.data.data.token;
    patientUser = res.data.data.user;
  });

  await test('Setup: Register Doctor', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `doctor_s7_${timestamp}@test.com`,
        password: 'Password123',
        firstName: 'Dr. Vikram',
        lastName: 'Mehta',
        role: 'doctor',
      }),
    });
    assert.strictEqual(res.status, 201);
    doctorToken = res.data.data.token;
    doctorUser = res.data.data.user;
  });

  await test('Setup: Register Admin', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `admin_s7_${timestamp}@test.com`,
        password: 'Password123',
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin',
      }),
    });
    assert.strictEqual(res.status, 201);
    adminToken = res.data.data.token;
  });

  await test('Setup: Register Hospital Management', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `management_s7_${timestamp}@test.com`,
        password: 'Password123',
        firstName: 'Kavita',
        lastName: 'Deshmukh',
        role: 'hospital_management',
      }),
    });
    assert.strictEqual(res.status, 201);
    managementToken = res.data.data.token;
  });

  // Setup Slot for Doctor
  await test('Setup: Doctor creates an availability slot', async () => {
    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: '2028-12-15',
        startTime: '10:00',
        endTime: '10:30',
        consultationType: 'in-person',
      }),
    });
    assert.strictEqual(res.status, 201);
    createdSlotId = res.data.data.slot._id;
  });

  // ============================================
  // TEST SUITE 1: Patient Dashboard (S7-01)
  // ============================================
  console.log('\n--- Test Suite 1: Patient Dashboard ---');

  await test('1.1 Patient can view their personalized dashboard', async () => {
    const res = await apiCall('/dashboards/patient', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.summary);
    assert.strictEqual(typeof res.data.data.summary.upcomingAppointments, 'number');
    assert.ok(Array.isArray(res.data.data.activeCarePlans));
    assert.ok(Array.isArray(res.data.data.recentUpdates));
  });

  await test('1.2 Doctor is forbidden from accessing patient dashboard (403)', async () => {
    const res = await apiCall('/dashboards/patient', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  // ============================================
  // TEST SUITE 2: Doctor Dashboard (S7-02)
  // ============================================
  console.log('\n--- Test Suite 2: Doctor Dashboard ---');

  await test('2.1 Doctor can view their clinical dashboard', async () => {
    const res = await apiCall('/dashboards/doctor', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.summary);
    assert.strictEqual(typeof res.data.data.summary.pendingRequests, 'number');
    assert.ok(Array.isArray(res.data.data.pendingRequests));
    assert.ok(Array.isArray(res.data.data.todayAppointments));
    assert.ok(Array.isArray(res.data.data.flaggedUpdates));
  });

  await test('2.2 Patient is forbidden from accessing doctor dashboard (403)', async () => {
    const res = await apiCall('/dashboards/doctor', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // ============================================
  // TEST SUITE 3: Admin Dashboard (S7-03)
  // ============================================
  console.log('\n--- Test Suite 3: Admin Dashboard ---');

  await test('3.1 Admin can view system distribution and doctor onboarding queue', async () => {
    const res = await apiCall('/dashboards/admin', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const data = res.data.data;
    assert.ok(data.userDistribution.total >= 4);
    assert.ok(data.userDistribution.patients >= 1);
    assert.ok(data.userDistribution.doctors >= 1);
    assert.ok(data.userDistribution.admins >= 1);
    assert.ok(data.userDistribution.hospital_management >= 1);
    assert.ok(Array.isArray(data.doctorOnboardingQueue));
  });

  await test('3.2 Non-admin is forbidden from accessing admin dashboard (403)', async () => {
    const res = await apiCall('/dashboards/admin', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // ============================================
  // TEST SUITE 4: Hospital Management Privacy Safeguards (S7-04)
  // ============================================
  console.log('\n--- Test Suite 4: Management Aggregate Privacy Safeguards ---');

  await test('4.1 Hospital Management can access aggregate reporting', async () => {
    const res = await apiCall('/dashboards/management', {
      method: 'GET',
      headers: { Authorization: `Bearer ${managementToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const data = res.data.data;

    assert.ok(data.appointmentMetrics);
    assert.strictEqual(typeof data.appointmentMetrics.approvalRatePercentage, 'number');
    assert.strictEqual(typeof data.appointmentMetrics.cancellationRatePercentage, 'number');

    assert.ok(data.careFollowUpMetrics);
    assert.strictEqual(typeof data.careFollowUpMetrics.averageRecoveryRating, 'number');

    assert.ok(Array.isArray(data.clinicalSpecialties));
    assert.ok(data.notificationReliability);
    assert.strictEqual(typeof data.notificationReliability.deliverySuccessRatePercentage, 'number');
  });

  await test('4.2 Management dashboard guarantees NO individual patient PII exposure', async () => {
    const res = await apiCall('/dashboards/management', {
      method: 'GET',
      headers: { Authorization: `Bearer ${managementToken}` },
    });
    const stringified = JSON.stringify(res.data);

    // Verify absence of sensitive personal identity tokens
    assert.ok(!stringified.includes('Ananya'));
    assert.ok(!stringified.includes('patient_s7_'));
    assert.ok(!stringified.includes('password'));
    assert.ok(!stringified.includes('symptoms'));
  });

  await test('4.3 Regular patients cannot access management aggregate reporting (403)', async () => {
    const res = await apiCall('/dashboards/management', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // ============================================
  // TEST SUITE 5: Integrated Appointment Notifications (S7-05)
  // ============================================
  console.log('\n--- Test Suite 5: Integrated Appointment Notifications ---');

  await test('5.1 Booking an appointment automatically enqueues notification for doctor', async () => {
    const res = await apiCall('/appointments/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        slotId: createdSlotId,
        reason: 'Post-op cardiology review',
        symptoms: 'Mild exertion fatigue',
      }),
    });
    assert.strictEqual(res.status, 201);
    createdAppointmentId = res.data.data.appointment._id;

    // Doctor checks their reminders/notifications
    const notifRes = await apiCall('/follow-ups/reminders', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.strictEqual(notifRes.status, 200);
    const jobs = notifRes.data.data.jobs;
    const apptNotif = jobs.find(
      j =>
        (j.metadata?.appointmentId?._id || j.metadata?.appointmentId)?.toString() === createdAppointmentId.toString() &&
        j.metadata?.statusChange === 'REQUESTED'
    );
    assert.ok(apptNotif, 'Expected REQUESTED notification job in doctor queue');
    assert.strictEqual(apptNotif.channel, 'email');
    assert.strictEqual((apptNotif.recipient?._id || apptNotif.recipient).toString(), doctorUser._id.toString());
  });

  await test('5.2 Doctor approving appointment enqueues notification for patient', async () => {
    const res = await apiCall(`/appointments/${createdAppointmentId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.strictEqual(res.status, 200);

    // Patient checks their reminders/notifications
    const notifRes = await apiCall('/follow-ups/reminders', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert.strictEqual(notifRes.status, 200);
    const jobs = notifRes.data.data.jobs;
    const approvedNotif = jobs.find(
      j =>
        (j.metadata?.appointmentId?._id || j.metadata?.appointmentId)?.toString() === createdAppointmentId.toString() &&
        j.metadata?.statusChange === 'APPROVED'
    );
    assert.ok(approvedNotif, 'Expected APPROVED notification job in patient queue');
    assert.strictEqual((approvedNotif.recipient?._id || approvedNotif.recipient).toString(), patientUser._id.toString());
  });

  // ============================================
  // TEST SUITE 6: End-to-End Workflow Integration (S7-06 & S7-10)
  // ============================================
  console.log('\n--- Test Suite 6: End-to-End Clinical Follow-Up Integration ---');

  let activePlanId;
  await test('6.1 Doctor creates post-discharge care plan', async () => {
    const res = await apiCall('/follow-ups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        patientId: patientUser._id,
        diagnosis: 'Acute Coronary Syndrome Post-Stenting',
        dischargeDate: new Date().toISOString(),
        followUpDate: '2028-12-28',
        instructions: 'Cardiac rehabilitation protocol and medication adherence',
        medications: [
          { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', durationDays: 90 },
          { name: 'Ticagrelor', dosage: '90mg', frequency: 'Twice daily', durationDays: 90 },
        ],
        warningSymptoms: ['Chest tightness', 'Shortness of breath at rest', 'Dizziness'],
        reminderCadenceDays: [1, 3, 7, 14],
      }),
    });
    assert.strictEqual(res.status, 201);
    activePlanId = res.data.data.plan._id;
  });

  await test('6.2 Patient submits recovery update with warning symptoms', async () => {
    const res = await apiCall(`/follow-ups/${activePlanId}/recovery-updates`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        recoveryRating: 2,
        painLevel: 6,
        symptomsNotes: 'Patient experienced chest tightness on climbing stairs',
        vitals: {
          bloodPressureSystolic: 154,
          bloodPressureDiastolic: 96,
          heartRate: 102,
          temperatureCelsius: 37.1,
        },
        hasWarningSymptoms: true,
      }),
    });
    assert.strictEqual(res.status, 201);
  });

  await test('6.3 Doctor dashboard immediately flags the patient in triage queue', async () => {
    const res = await apiCall('/dashboards/doctor', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.strictEqual(res.status, 200);
    const flagged = res.data.data.flaggedUpdates;
    assert.ok(flagged.length > 0);
    const urgentUpdate = flagged.find(u => u.hasWarningSymptoms === true);
    assert.ok(urgentUpdate, 'Expected urgent update with warning symptoms on doctor dashboard');
  });

  await test('6.4 Patient dashboard reflects active plan and updated recovery metrics', async () => {
    const res = await apiCall('/dashboards/patient', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.summary.activeCarePlans >= 1);
    assert.ok(res.data.data.recentUpdates.length >= 1);
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
