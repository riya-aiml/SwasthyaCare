import assert from 'assert';

/**
 * Sprint 3 Doctor Discovery & Availability Test Suite
 * Tests all tasks and acceptance criteria for Sprint 3
 */

const BASE_URL = 'http://localhost:3001/api';

const testDoctor = {
  email: `doc_sprint3_${Date.now()}@test.com`,
  password: 'DoctorPassword123',
  firstName: 'Alexander',
  lastName: 'Fleming',
  role: 'doctor',
  phoneNumber: '9876543299',
};

const testPatient = {
  email: `patient_sprint3_${Date.now()}@test.com`,
  password: 'PatientPassword123',
  firstName: 'Arthur',
  lastName: 'Conan',
  role: 'patient',
  phoneNumber: '9876543288',
};

let doctorToken = '';
let doctorUserId = '';
let doctorProfileId = '';
let patientToken = '';
let createdSlotId = '';

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
  console.log('🧪 Starting Sprint 3 Doctor & Availability Tests...\n');
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

  // Setup: Register Doctor and Patient
  console.log('--- Setup Users ---');
  await test('Setup: Register Doctor', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testDoctor),
    });
    assert.strictEqual(res.status, 201);
    doctorToken = res.data.data.token;
    doctorUserId = res.data.data.user._id;
  });

  await test('Setup: Register Patient', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient),
    });
    assert.strictEqual(res.status, 201);
    patientToken = res.data.data.token;
  });

  // ============================================
  // TEST SUITE 1: Doctor Profile APIs
  // ============================================
  console.log('\n--- Doctor Profile Tests ---');

  await test('1.1 Doctor can get/auto-provision their own profile', async () => {
    const res = await apiCall('/doctors/profile/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.profile._id);
    doctorProfileId = res.data.data.profile._id;
  });

  await test('1.2 Patient cannot access doctor profile/me endpoint', async () => {
    const res = await apiCall('/doctors/profile/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  await test('1.3 Doctor can update their own profile details', async () => {
    const res = await apiCall('/doctors/profile/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        specialty: 'Immunology & Infectious Disease',
        hospital: 'St. Mary London Teaching Hospital',
        experienceYears: 18,
        consultationFee: 800,
        bio: 'Discoverer of penicillin and pioneer in antibiotic therapeutics.',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.profile.specialty, 'Immunology & Infectious Disease');
    assert.strictEqual(res.data.data.profile.consultationFee, 800);
  });

  // ============================================
  // TEST SUITE 2: Doctor Directory & Discovery
  // ============================================
  console.log('\n--- Doctor Directory & Discovery Tests ---');

  await test('2.1 Anyone can search and list approved doctors', async () => {
    const res = await apiCall('/doctors?limit=10', { method: 'GET' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.doctors));
    assert.ok(res.data.data.doctors.length >= 1);
  });

  await test('2.2 Can search doctors by specialty filter', async () => {
    const res = await apiCall('/doctors?specialty=Senior%20Cardiologist', { method: 'GET' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.doctors.length >= 1);
    assert.strictEqual(res.data.data.doctors[0].specialty, 'Senior Cardiologist');
  });

  await test('2.3 Can get single doctor details by ID', async () => {
    const res = await apiCall(`/doctors/${doctorProfileId}`, { method: 'GET' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.doctor._id, doctorProfileId);
    assert.strictEqual(res.data.data.doctor.specialty, 'Immunology & Infectious Disease');
  });

  // ============================================
  // TEST SUITE 3: Availability Slot Management
  // ============================================
  console.log('\n--- Availability Slot Management Tests ---');

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  await test('3.1 Doctor can create a valid future availability slot', async () => {
    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: futureDateStr,
        startTime: '10:00',
        endTime: '10:30',
        durationMinutes: 30,
        isPriority: true,
        consultationType: 'both',
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.slot.date, futureDateStr);
    assert.strictEqual(res.data.data.slot.startTime, '10:00');
    createdSlotId = res.data.data.slot._id;
  });

  await test('3.2 System rejects slot creation for past dates', async () => {
    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: '2020-01-01',
        startTime: '10:00',
        endTime: '10:30',
      }),
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.message.includes('past'));
  });

  await test('3.3 System rejects slot where startTime >= endTime', async () => {
    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: futureDateStr,
        startTime: '11:30',
        endTime: '10:00',
      }),
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.message.includes('precede'));
  });

  await test('3.4 System rejects conflicting/overlapping slots for same doctor', async () => {
    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        date: futureDateStr,
        startTime: '10:15', // Overlaps with 10:00 - 10:30
        endTime: '10:45',
      }),
    });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
  });

  await test('3.5 Patient cannot create doctor availability slot', async () => {
    const res = await apiCall('/doctors/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        date: futureDateStr,
        startTime: '14:00',
        endTime: '14:30',
      }),
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  // ============================================
  // TEST SUITE 4: Slot Discovery & Deletion
  // ============================================
  console.log('\n--- Slot Listing & Deletion Tests ---');

  await test('4.1 Patient can view doctor bookable slots', async () => {
    const res = await apiCall(`/doctors/${doctorProfileId}/slots?date=${futureDateStr}`, {
      method: 'GET',
    });

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.data.slots));
    assert.strictEqual(res.data.data.slots.length, 1);
    assert.strictEqual(res.data.data.slots[0]._id, createdSlotId);
  });

  await test('4.2 Doctor can view their own schedule', async () => {
    const res = await apiCall('/doctors/availability/my-schedule', {
      method: 'GET',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.slots.length >= 1);
  });

  await test('4.3 Doctor can delete their unbooked availability slot', async () => {
    const res = await apiCall(`/doctors/availability/${createdSlotId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  await test('4.4 Deleted slot is no longer visible to patients', async () => {
    const res = await apiCall(`/doctors/${doctorProfileId}/slots?date=${futureDateStr}`, {
      method: 'GET',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.slots.length, 0);
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
