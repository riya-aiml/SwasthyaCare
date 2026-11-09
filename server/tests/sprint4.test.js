import assert from 'assert';

/**
 * Sprint 4 Appointment Management Test Suite
 * Tests all appointment workflow including double-booking protection
 */

const BASE_URL = 'http://localhost:3001/api';

const testPatient1 = {
  email: `patient1_sprint4_${Date.now()}@test.com`,
  password: 'Patient123',
  firstName: 'Patient',
  lastName: 'One',
  role: 'patient',
};

const testPatient2 = {
  email: `patient2_sprint4_${Date.now()}@test.com`,
  password: 'Patient123',
  firstName: 'Patient',
  lastName: 'Two',
  role: 'patient',
};

const testDoctor = {
  email: `doctor_sprint4_${Date.now()}@test.com`,
  password: 'Doctor123',
  firstName: 'Test',
  lastName: 'Doctor',
  role: 'doctor',
};

let patient1Token = '';
let patient2Token = '';
let doctorToken = '';
let doctorUserId = '';
let testSlotId = '';
let appointment1Id = '';
let appointment2Id = '';

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
  console.log('🧪 Starting Sprint 4 Appointment Management Tests...\n');
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

  // Setup
  console.log('--- Setup Users & Slot ---');

  await test('Setup: Register Patient 1', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient1),
    });
    patient1Token = res.data.data.token;
  });

  await test('Setup: Register Patient 2', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient2),
    });
    patient2Token = res.data.data.token;
  });

  await test('Setup: Register Doctor', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testDoctor),
    });
    doctorToken = res.data.data.token;
    doctorUserId = res.data.data.user._id;
  });

  await test('Setup: Create availability slot', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];

    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: dateStr,
        startTime: '10:00',
        endTime: '10:30',
      }),
    });

    if (res.status !== 201) {
      console.log('   Slot creation error:', JSON.stringify(res.data, null, 2));
    }

    assert.strictEqual(res.status, 201);
    testSlotId = res.data.data.slot._id;
  });

  // ============================================
  // TEST SUITE 1: Appointment Request
  // ============================================
  console.log('\n--- Appointment Request Tests ---');

  await test('1.1 Patient can request an available slot', async () => {
    const res = await apiCall('/appointments/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify({
        slotId: testSlotId,
        reason: 'Regular checkup',
        symptoms: ['Fatigue', 'Headache'],
        consultationType: 'in-person',
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.appointment.status, 'PENDING');
    appointment1Id = res.data.data.appointment._id;
  });

  await test('1.2 New appointment starts with PENDING status', async () => {
    const res = await apiCall(`/appointments/${appointment1Id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient1Token}` },
    });

    assert.strictEqual(res.data.data.appointment.status, 'PENDING');
  });

  await test('1.3 CRITICAL: Patient 2 requesting the same reserved slot gets 409 Conflict (Double-Booking Prevention)', async () => {
    const res = await apiCall('/appointments/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient2Token}` },
      body: JSON.stringify({
        slotId: testSlotId,
        reason: 'Attempting to double-book slot 1',
      }),
    });

    // The slot is reserved by Patient 1, so Patient 2 must be rejected with 409 Conflict!
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
  });

  // Create slot 2 for Patient 2 so doctor has multiple appointments in queue
  let testSlot2Id = '';
  await test('1.4 Setup: Create slot 2 and Patient 2 requests it', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];

    const slotRes = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: dateStr,
        startTime: '11:00',
        endTime: '11:30',
      }),
    });
    assert.strictEqual(slotRes.status, 201);
    testSlot2Id = slotRes.data.data.slot._id;

    const apptRes = await apiCall('/appointments/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient2Token}` },
      body: JSON.stringify({
        slotId: testSlot2Id,
        reason: 'Consultation with Doctor',
      }),
    });
    assert.strictEqual(apptRes.status, 201);
    appointment2Id = apptRes.data.data.appointment._id;
  });

  // ============================================
  // TEST SUITE 2: Appointment History
  // ============================================
  console.log('\n--- Appointment History Tests ---');

  await test('2.1 Patient can view their own appointments', async () => {
    const res = await apiCall('/appointments/my-appointments', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient1Token}` },
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.appointments.length >= 1);
  });

  await test('2.2 Doctor can view appointments assigned to them', async () => {
    const res = await apiCall('/appointments/my-appointments', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.appointments.length >= 2);
  });

  await test('2.3 Doctor can view pending requests', async () => {
    const res = await apiCall('/appointments/pending', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.appointments.length >= 2);
  });

  // ============================================
  // TEST SUITE 3: Authorization
  // ============================================
  console.log('\n--- Authorization Tests ---');

  await test('3.1 Patient cannot approve appointments', async () => {
    const res = await apiCall(`/appointments/${appointment1Id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patient1Token}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await test('3.2 Patient cannot view another patient\'s appointment', async () => {
    const res = await apiCall(`/appointments/${appointment2Id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patient1Token}` },
    });

    assert.strictEqual(res.status, 403);
  });

  // ============================================
  // TEST SUITE 4: Approval & Double-Booking Protection
  // ============================================
  console.log('\n--- Approval & Double-Booking Tests ---');

  await test('4.1 Doctor can approve a pending appointment', async () => {
    const res = await apiCall(`/appointments/${appointment1Id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.appointment.status, 'APPROVED');
    assert.ok(res.data.data.appointment.reviewedBy);
    assert.ok(res.data.data.appointment.reviewedAt);
  });

  await test('4.2 Doctor can reject a pending appointment with reason', async () => {
    const res = await apiCall(`/appointments/${appointment2Id}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({ reason: 'Doctor unavailable at that hour' }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.appointment.status, 'REJECTED');
    assert.strictEqual(res.data.data.appointment.rejectionReason, 'Doctor unavailable at that hour');
  });

  await test('4.3 Approved slot is marked as booked', async () => {
    // Try to request the same slot again - should fail
    const res = await apiCall('/appointments/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient2Token}` },
      body: JSON.stringify({
        slotId: testSlotId,
        reason: 'Another attempt',
      }),
    });

    assert.strictEqual(res.status, 409);
    assert.ok(res.data.error.message.includes('no longer available') ||
              res.data.error.message.includes('pending or approved'));
  });

  // ============================================
  // TEST SUITE 5: State Machine & Invalid Transitions
  // ============================================
  console.log('\n--- State Machine Tests ---');

  await test('5.1 Cannot approve an already-approved appointment', async () => {
    const res = await apiCall(`/appointments/${appointment1Id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.message.includes('Cannot approve'));
  });

  await test('5.2 Cannot reject an already-rejected appointment', async () => {
    const res = await apiCall(`/appointments/${appointment2Id}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({ reason: 'Test' }),
    });

    assert.strictEqual(res.status, 400);
  });

  // ============================================
  // TEST SUITE 6: Rejection
  // ============================================
  console.log('\n--- Rejection Tests ---');

  // Create another slot and appointment for rejection test
  let rejectSlotId, rejectAppointmentId;

  await test('6.1 Setup: Create another slot', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 8);
    const dateStr = futureDate.toISOString().split('T')[0];

    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: dateStr,
        startTime: '14:00',
        endTime: '14:30',
      }),
    });
    rejectSlotId = res.data.data.slot._id;
  });

  await test('6.2 Setup: Patient requests the new slot', async () => {
    const res = await apiCall('/appointments/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify({
        slotId: rejectSlotId,
        reason: 'Follow-up',
      }),
    });
    rejectAppointmentId = res.data.data.appointment._id;
  });

  await test('6.3 Doctor can reject a pending appointment', async () => {
    const res = await apiCall(`/appointments/${rejectAppointmentId}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({ reason: 'Schedule conflict' }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.appointment.status, 'REJECTED');
    assert.strictEqual(res.data.data.appointment.rejectionReason, 'Schedule conflict');
  });

  await test('6.4 Rejected slot is released back to available', async () => {
    // Should be able to request the slot again
    const res = await apiCall('/appointments/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient2Token}` },
      body: JSON.stringify({
        slotId: rejectSlotId,
        reason: 'New request',
      }),
    });

    assert.strictEqual(res.status, 201);
  });

  // ============================================
  // TEST SUITE 7: Cancellation
  // ============================================
  console.log('\n--- Cancellation Tests ---');

  await test('7.1 Patient can cancel their approved appointment', async () => {
    const res = await apiCall(`/appointments/${appointment1Id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patient1Token}` },
      body: JSON.stringify({ reason: 'Personal emergency' }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.appointment.status, 'CANCELLED');
  });

  await test('7.2 Cancelled slot is released and becomes available again', async () => {
    const res = await apiCall('/appointments/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patient2Token}` },
      body: JSON.stringify({
        slotId: testSlotId,
        reason: 'Rebooking cancelled slot',
      }),
    });

    assert.strictEqual(res.status, 201);
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
