import assert from 'assert';

/**
 * Sprint 2 Authentication Test Suite
 * Tests all authentication features and acceptance criteria
 */

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testPatient = {
  email: `patient_${Date.now()}@test.com`,
  password: 'TestPassword123',
  firstName: 'Jane',
  lastName: 'Doe',
  phoneNumber: '9876543210',
  role: 'patient',
};

const testDoctor = {
  email: `doctor_${Date.now()}@test.com`,
  password: 'DocPassword123',
  firstName: 'Dr. John',
  lastName: 'Smith',
  phoneNumber: '9876543211',
  role: 'doctor',
};

let patientToken = '';
let patientId = '';
let doctorToken = '';

/**
 * Helper to make API calls
 */
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

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting Sprint 2 Authentication Tests...\n');
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

  // ============================================
  // TEST SUITE 1: Registration Tests
  // ============================================
  console.log('--- Registration Tests ---');

  await test('1.1 Should register a new patient successfully', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.email, testPatient.email);
    assert.strictEqual(res.data.data.user.role, 'patient');
    assert.ok(res.data.data.token, 'Token should be returned');
    assert.strictEqual(res.data.data.user.password, undefined, 'Password should not be returned');

    patientToken = res.data.data.token;
    patientId = res.data.data.user._id;
  });

  await test('1.2 Should reject duplicate email registration', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testPatient),
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.error.message.includes('already registered'));
  });

  await test('1.3 Should reject registration with short password', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...testPatient,
        email: `short_${Date.now()}@test.com`,
        password: '123',
      }),
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await test('1.4 Should reject registration without password numbers', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...testPatient,
        email: `nonumber_${Date.now()}@test.com`,
        password: 'passwordonly',
      }),
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await test('1.5 Should register a doctor account', async () => {
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testDoctor),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.data.user.role, 'doctor');
    doctorToken = res.data.data.token;
  });

  // ============================================
  // TEST SUITE 2: Login Tests
  // ============================================
  console.log('\n--- Login Tests ---');

  await test('2.1 Should login successfully with valid credentials', async () => {
    const res = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testPatient.email,
        password: testPatient.password,
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token);
    assert.strictEqual(res.data.data.user.email, testPatient.email);
  });

  await test('2.2 Should reject login with wrong password', async () => {
    const res = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testPatient.email,
        password: 'wrongpassword',
      }),
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error.message, 'Invalid email or password.');
  });

  await test('2.3 Should reject login with non-existent email', async () => {
    const res = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'doesnotexist@test.com',
        password: 'TestPassword123',
      }),
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error.message, 'Invalid email or password.');
  });

  // ============================================
  // TEST SUITE 3: Protected Route & Token Tests
  // ============================================
  console.log('\n--- Protected Route Tests ---');

  await test('3.1 Should access /api/auth/me with valid token', async () => {
    const res = await apiCall('/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.email, testPatient.email);
  });

  await test('3.2 Should reject /api/auth/me without token', async () => {
    const res = await apiCall('/auth/me', {
      method: 'GET',
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.error.message.includes('No token provided'));
  });

  await test('3.3 Should reject /api/auth/me with invalid token', async () => {
    const res = await apiCall('/auth/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer invalid.token.here' },
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  // ============================================
  // TEST SUITE 4: Profile & Authorization Tests
  // ============================================
  console.log('\n--- Profile & Authorization Tests ---');

  await test('4.1 Patient should access their own profile', async () => {
    const res = await apiCall(`/users/${patientId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.user._id, patientId);
  });

  await test('4.2 Patient should update their own profile', async () => {
    const res = await apiCall(`/users/${patientId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        phoneNumber: '1112223333',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.user.phoneNumber, '1112223333');
  });

  await test('4.3 Patient cannot update email or password through profile update', async () => {
    const res = await apiCall(`/users/${patientId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        email: 'hacked@test.com',
      }),
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.message.includes('Email cannot be changed'));
  });

  await test('4.4 Patient cannot access all users list (Admin only)', async () => {
    const res = await apiCall('/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` },
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.error.message.includes('permission'));
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

// Run the tests
runTests().catch(console.error);
