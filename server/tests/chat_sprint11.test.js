import assert from 'assert';

/**
 * Sprint 11 Conversational AI Assistant & Patient-Facing Workflows Test Suite
 * Tasks: S11-01 through S11-12
 *
 * Verifies:
 * 1. Authentication Enforcement (401 on unauthenticated access to /api/chat endpoints)
 * 2. Session Initialization & Default Assistant Welcome (S11-01, S11-02)
 * 3. Multi-Tenant Session Isolation (Patient B blocked with 403 from reading Patient A's session)
 * 4. Cross-Patient Posting Prevention (Patient B blocked with 403 from messaging Patient A's thread)
 * 5. Grounded Q&A with Dual-Scope Citations (Scope A App docs / Scope B ICMR guidelines)
 * 6. App Navigation Action Cards (booking & specialist assistance)
 * 7. Emergency Airbag Interception (Acute symptoms trigger immediate 112/108 alerts)
 * 8. User Feedback Rating Collection (S11-03)
 * 9. Contextual Page-Aware Quick Action Chips (S11-04)
 * 10. Right to Erasure / Cascade Deletion (S11-10)
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

async function runSprint11Tests() {
  console.log('🤖 Starting Sprint 11 Conversational Assistant & App Workflows Test Suite...\n');
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
  let patientAToken, patientAId;
  let patientBToken, patientBId;
  let sessionAId;
  let assistantMessageId;

  console.log('--- Phase 1: Authentication & Account Setup ---');
  await test('1.1 Setup: Register Patient A and Patient B', async () => {
    const [resA, resB] = await Promise.all([
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `patient_a_s11_${ts}@swasthya.test`,
          password: 'Password123!',
          firstName: 'Aarav',
          lastName: 'Sharma',
          role: 'patient',
        }),
      }),
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `patient_b_s11_${ts}@swasthya.test`,
          password: 'Password123!',
          firstName: 'Priya',
          lastName: 'Patel',
          role: 'patient',
        }),
      }),
    ]);

    assert.strictEqual(resA.status, 201);
    assert.strictEqual(resB.status, 201);
    patientAToken = resA.data.data.token;
    patientAId = resA.data.data.user.id;
    patientBToken = resB.data.data.token;
    patientBId = resB.data.data.user.id;
  });

  console.log('\n--- Phase 2: Route Security & Multi-Tenant Boundaries ---');
  await test('2.1 Authentication Enforcement: Unauthenticated requests return 401', async () => {
    const res = await apiCall('/chat/sessions');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  await test('2.2 Session Creation: Patient A creates a new conversation with welcome message', async () => {
    const res = await apiCall('/chat/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientAToken}` },
      body: JSON.stringify({ title: 'My Health Questions' }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.session._id);
    assert.strictEqual(res.data.data.session.title, 'My Health Questions');
    assert.ok(res.data.data.initialMessage);
    assert.strictEqual(res.data.data.initialMessage.sender, 'assistant');
    assert.ok(res.data.data.initialMessage.content.includes('SwasthyaCare AI Health Assistant'));

    sessionAId = res.data.data.session._id;
  });

  await test('2.3 Multi-Tenant Isolation: Patient B cannot access Patient A session (403)', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientBToken}` },
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.error.message.includes('Forbidden'));
  });

  await test('2.4 Cross-Patient Posting Prevention: Patient B cannot send message to Patient A session (403)', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientBToken}` },
      body: JSON.stringify({ message: 'Hello from unauthorized user' }),
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  console.log('\n--- Phase 3: Conversational Grounding, Citations & Action Cards ---');
  await test('3.1 App Workflow Grounding: Patient A asks about booking specialists', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientAToken}` },
      body: JSON.stringify({ message: 'How do I book an appointment with a cardiology specialist?' }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const { userMessage, assistantMessage } = res.data.data;

    assert.strictEqual(userMessage.sender, 'user');
    assert.strictEqual(assistantMessage.sender, 'assistant');
    assert.strictEqual(assistantMessage.intent, 'APPOINTMENT_ASSIST');
    assert.ok(assistantMessage.citations.length > 0);
    assert.ok(assistantMessage.citations.some((c) => c.sourceId.startsWith('SWC-APP')));
    assert.strictEqual(assistantMessage.actionSuggestion.type, 'NAVIGATE_TAB');
    assert.strictEqual(assistantMessage.actionSuggestion.target, 'directory');

    assistantMessageId = assistantMessage._id;
  });

  await test('3.2 Clinical Guideline Grounding: Patient A asks about blood pressure guidelines', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientAToken}` },
      body: JSON.stringify({ message: 'What is normal blood pressure according to ICMR guidelines?' }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const { assistantMessage } = res.data.data;

    assert.strictEqual(assistantMessage.intent, 'HEALTH_INFO');
    assert.ok(assistantMessage.citations.some((c) => c.sourceId.includes('ICMR-HTN')));
    assert.ok(assistantMessage.content.includes('120') || assistantMessage.content.includes('140'));
    assert.ok(assistantMessage.disclaimer.includes('EDUCATIONAL'));
  });

  await test('3.3 Emergency Airbag Interception: Crushing chest pain triggers emergency alert (112/108)', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientAToken}` },
      body: JSON.stringify({ message: 'I have severe crushing chest pain radiating to my left arm and jaw' }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const { assistantMessage } = res.data.data;

    assert.strictEqual(assistantMessage.isEmergency, true);
    assert.strictEqual(assistantMessage.intent, 'EMERGENCY_RED_FLAG');
    assert.ok(assistantMessage.content.includes('112') || assistantMessage.content.includes('108'));
    assert.strictEqual(assistantMessage.actionSuggestion.type, 'EMERGENCY_MODAL');
    assert.ok(assistantMessage.actionSuggestion.target.includes('112'));
  });

  console.log('\n--- Phase 4: Feedback, Quick Actions & Right to Erasure ---');
  await test('4.1 Feedback Collection: Patient submits helpful rating for assistant response', async () => {
    const res = await apiCall(`/chat/messages/${assistantMessageId}/feedback`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientAToken}` },
      body: JSON.stringify({ rating: 'helpful', comment: 'Very clear guidance' }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.rating, 'helpful');
  });

  await test('4.2 Contextual Quick Actions: Page-aware prompt chips for risk-assessment tab', async () => {
    const res = await apiCall('/chat/quick-actions?currentTab=risk-assessment', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientAToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.tab, 'risk-assessment');
    assert.ok(Array.isArray(res.data.data.chips));
    assert.ok(res.data.data.chips.length >= 2);
  });

  await test('4.3 Right to Erasure: Patient B blocked from deleting Patient A session (403)', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${patientBToken}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await test('4.4 Right to Erasure: Patient A cascade-deletes conversation and messages (200)', async () => {
    const res = await apiCall(`/chat/sessions/${sessionAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${patientAToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    // Subsequent retrieval returns 404
    const getRes = await apiCall(`/chat/sessions/${sessionAId}`, {
      headers: { Authorization: `Bearer ${patientAToken}` },
    });
    assert.strictEqual(getRes.status, 404);
  });

  console.log('\n================================================================');
  console.log(`🎉 Sprint 11 Chatbot & App Workflows Suite Complete: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSprint11Tests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
