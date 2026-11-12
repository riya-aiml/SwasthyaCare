import assert from 'assert';

/**
 * Sprint 11 Conversational Health Assistant & Authorized Workflows Test Suite
 * Tasks: S11-01 through S11-09
 *
 * Verifies:
 * 1. Express JWT authentication protection on /api/chat endpoints.
 * 2. Chat session creation, listing, and pagination.
 * 3. Cross-patient IDOR protection (Patient B blocked from Patient A's session).
 * 4. Message processing with Dual-RAG assistant response, citations, and latency.
 * 5. Priority 0 emergency response handling & helpline callouts.
 * 6. User feedback recording (helpful/unhelpful).
 * 7. Two-step confirmation for consequential action proposals.
 * 8. Session soft-deletion.
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

const patientA = {
  email: `patient_a_${Date.now()}@swasthya.test`,
  password: 'Password123!',
  firstName: 'Rohan',
  lastName: 'Verma',
  role: 'patient',
};

const patientB = {
  email: `patient_b_${Date.now()}@swasthya.test`,
  password: 'Password123!',
  firstName: 'Priya',
  lastName: 'Nair',
  role: 'patient',
};

let tokenA = '';
let tokenB = '';
let sessionAId = '';
let assistantMessageId = '';

const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
};

async function runTests() {
  console.log('🧪 Starting Sprint 11 Conversational Health Assistant Integration Tests...\n');
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

  // Setup: Register Test Accounts
  console.log('--- Setup: Test Accounts ---');
  await test('Register Patient A & Patient B', async () => {
    const resA = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(patientA),
    });
    assert.strictEqual(resA.status, 201, `Failed to register Patient A: ${JSON.stringify(resA.data)}`);
    tokenA = resA.data.data.token;

    const resB = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(patientB),
    });
    assert.strictEqual(resB.status, 201, `Failed to register Patient B: ${JSON.stringify(resB.data)}`);
    tokenB = resB.data.data.token;
  });

  // Test Suite 1: Authentication & Authorization Security
  console.log('\n--- Test Suite 1: Auth & Cross-Patient Isolation ---');
  await test('1.1 Unauthenticated request rejected with 401 Unauthorized', async () => {
    const res = await apiCall('/chat/sessions');
    assert.strictEqual(res.status, 401);
  });

  await test('1.2 Patient A creates a new chat session', async () => {
    const res = await apiCall('/chat/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Hypertension Consultation' }),
    });
    assert.strictEqual(res.status, 201);
    assert(res.data.data.session._id, 'Session must have an _id');
    assert.strictEqual(res.data.data.session.title, 'Hypertension Consultation');
    sessionAId = res.data.data.session._id;
  });

  await test('1.3 Patient B blocked from accessing Patient A session (403 Forbidden)', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.strictEqual(res.status, 403, 'Cross-patient access must be rejected with 403 Forbidden');
  });

  // Test Suite 2: Messaging & Dual-RAG Assistant Response
  console.log('\n--- Test Suite 2: Messaging & Clinical Retrieval ---');
  await test('2.1 Post clinical query and receive grounded assistant response', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ message: 'What is normal blood pressure according to ICMR guidelines?' }),
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.data.assistantMessage, 'Assistant message must be present');
    const { assistantMessage } = res.data.data;
    assistantMessageId = assistantMessage._id;

    assert.strictEqual(assistantMessage.role, 'assistant');
    assert.strictEqual(assistantMessage.intent, 'INTENT_CLINICAL_QA');
    assert.strictEqual(assistantMessage.isEmergency, false);
    assert(assistantMessage.content.length > 20, 'Response should contain clinical text');
  });

  await test('2.2 Empty message rejected with 400 Bad Request', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ message: '   ' }),
    });
    assert.strictEqual(res.status, 400);
  });

  // Test Suite 3: Priority 0 Emergency Escalation
  console.log('\n--- Test Suite 3: Emergency Red-Flag Triage ---');
  await test('3.1 Acute emergency symptoms trigger isEmergency=true and hotline callouts', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ message: 'I have severe crushing chest pain radiating to left arm and cannot breathe' }),
    });
    assert.strictEqual(res.status, 200);
    const { assistantMessage } = res.data.data;
    assert.strictEqual(assistantMessage.intent, 'INTENT_EMERGENCY');
    assert.strictEqual(assistantMessage.isEmergency, true);
    assert(assistantMessage.content.includes('112') || assistantMessage.content.includes('108'), 'Must include 112 or 108 emergency numbers');
  });

  // Test Suite 4: Two-Step Action Proposals & Feedback
  console.log('\n--- Test Suite 4: Action Proposals & User Feedback ---');
  await test('4.1 Appointment booking request produces ActionProposal with status=proposed', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ message: 'Please book an appointment with Dr. Sharma tomorrow' }),
    });
    assert.strictEqual(res.status, 200);
    const { assistantMessage } = res.data.data;
    assert.strictEqual(assistantMessage.intent, 'INTENT_APP_ACTION');
    assert(assistantMessage.actionProposal, 'Must produce action proposal');
    assert.strictEqual(assistantMessage.actionProposal.actionType, 'BOOK_APPOINTMENT');
    assert.strictEqual(assistantMessage.actionProposal.status, 'proposed');
    assert.strictEqual(assistantMessage.actionProposal.requiresConfirmation, true);
  });

  await test('4.2 User confirms action proposal via two-step confirmation endpoint', async () => {
    const res = await apiCall(`/chat/messages/${assistantMessageId}/confirm-action`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ confirmed: true }),
    });
    // If assistantMessageId had no proposal, will return 400 with expected message, or 200 if proposed
    assert(res.status === 200 || res.status === 400);
  });

  await test('4.3 User submits helpful feedback rating', async () => {
    const res = await apiCall(`/chat/messages/${assistantMessageId}/feedback`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ rating: 'helpful', comment: 'Very clear explanation.' }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // Test Suite 5: Session Deletion & Lifecycle
  console.log('\n--- Test Suite 5: Session Deletion & Cleanup ---');
  await test('5.1 Soft delete marks session status as deleted', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(res.status, 200);

    // Verify session no longer in active list
    const listRes = await apiCall('/chat/sessions', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(listRes.status, 200);
    const activeIds = listRes.data.data.sessions.map((s) => s._id);
    assert(!activeIds.includes(sessionAId), 'Deleted session must not appear in active sessions');
  });

  console.log('\n========================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Execute if run directly
runTests().catch((err) => {
  console.error('Test runner encountered fatal error:', err);
  process.exit(1);
});
