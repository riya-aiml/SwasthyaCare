import assert from 'assert';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ChatSession from '../src/modules/chat/chatSession.model.js';
import ChatMessage, { CHAT_INTENTS, ACTION_TYPES } from '../src/modules/chat/chatMessage.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swasthyacare';

async function runSchemaValidationTests() {
  console.log('🧪 Starting Chat Schema & Taxonomy Validation Test Suite (Phase 3)...');

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  const dummyUserId = new mongoose.Types.ObjectId();

  try {
    // 1. Verify Taxonomy Enums
    console.log('--- Test Suite 1: Unified Intent Taxonomy & Action Types ---');
    assert(CHAT_INTENTS.includes('INTENT_EMERGENCY'), 'Must include INTENT_EMERGENCY');
    assert(CHAT_INTENTS.includes('INTENT_NAVIGATION'), 'Must include INTENT_NAVIGATION');
    assert(CHAT_INTENTS.includes('INTENT_CLINICAL_QA'), 'Must include INTENT_CLINICAL_QA');
    assert(CHAT_INTENTS.includes('INTENT_REPORT_EXPLANATION'), 'Must include INTENT_REPORT_EXPLANATION');
    assert(CHAT_INTENTS.includes('INTENT_ASSESSMENT_EXPLANATION'), 'Must include INTENT_ASSESSMENT_EXPLANATION');
    assert(CHAT_INTENTS.includes('INTENT_APPOINTMENT_HELP'), 'Must include INTENT_APPOINTMENT_HELP');
    assert(CHAT_INTENTS.includes('INTENT_APPOINTMENT_ACTION'), 'Must include INTENT_APPOINTMENT_ACTION');
    assert(CHAT_INTENTS.includes('INTENT_QUEUE_HELP'), 'Must include INTENT_QUEUE_HELP');
    assert(CHAT_INTENTS.includes('INTENT_FOLLOW_UP_HELP'), 'Must include INTENT_FOLLOW_UP_HELP');
    assert(CHAT_INTENTS.includes('INTENT_MEDICINE_INFORMATION'), 'Must include INTENT_MEDICINE_INFORMATION');
    assert(CHAT_INTENTS.includes('INTENT_HUMAN_SUPPORT'), 'Must include INTENT_HUMAN_SUPPORT');
    assert(CHAT_INTENTS.includes('INTENT_GENERAL_CHITCHAT'), 'Must include INTENT_GENERAL_CHITCHAT');
    assert(CHAT_INTENTS.includes('INTENT_UNCLEAR'), 'Must include INTENT_UNCLEAR');
    // Backward compatibility aliases
    assert(CHAT_INTENTS.includes('INTENT_APP_ACTION'), 'Must include INTENT_APP_ACTION alias');
    assert(CHAT_INTENTS.includes('INTENT_APP_NAVIGATION'), 'Must include INTENT_APP_NAVIGATION alias');
    assert(CHAT_INTENTS.includes('INTENT_UNKNOWN'), 'Must include INTENT_UNKNOWN alias');
    console.log('✅ PASS: Complete 13-intent taxonomy + backward compatible aliases verified.');

    // 2. ChatSession Schema Validation
    console.log('\n--- Test Suite 2: ChatSession Schema, Retention & Structured Metadata ---');
    const session = await ChatSession.create({
      user: dummyUserId,
      role: 'patient',
      title: 'Diabetes & BP Consultation',
      metadata: {
        clientIp: '127.0.0.1',
        userAgent: 'Mozilla/5.0 SwasthyaTest/1.0',
        patientAge: 48,
        patientGender: 'female',
        sourceChannel: 'web_portal',
        initialIntent: 'INTENT_CLINICAL_QA',
      },
    });

    assert(session._id, 'Session should have _id');
    assert.strictEqual(session.status, 'active');
    assert.strictEqual(session.metadata.patientAge, 48);
    assert.strictEqual(session.metadata.patientGender, 'female');
    assert(session.retentionExpiresAt instanceof Date, 'Should have automatic retention expiration date');
    assert(session.retentionExpiresAt > new Date(), 'Retention should expire in the future');
    console.log('✅ PASS: ChatSession created with structured metadata and retentionExpiresAt.');

    // 3. ChatMessage Schema Validation with Citations & Action Proposal
    console.log('\n--- Test Suite 3: ChatMessage Validation with Citations & Parameters ---');
    const message = await ChatMessage.create({
      session: session._id,
      user: dummyUserId,
      role: 'assistant',
      content: 'Here is the ICMR dietary advice for managing pre-diabetes.',
      intent: 'INTENT_CLINICAL_QA',
      isEmergency: false,
      citations: [
        {
          docId: 'DOC-CLIN-01',
          title: 'ICMR Guidelines for Management of Type 2 Diabetes 2025',
          sourceOrganization: 'ICMR',
          snippet: 'Fasting plasma glucose between 100-125 mg/dL defines impaired fasting glucose.',
        },
      ],
      actionProposal: {
        actionType: 'BOOK_APPOINTMENT',
        targetResource: 'appointments',
        parameters: {
          doctorId: 'DOC-1234',
          doctorName: 'Dr. Priya Sharma',
          specialty: 'Endocrinology',
          appointmentDate: new Date('2026-11-20T10:00:00Z'),
          reason: 'Routine pre-diabetes checkup',
        },
        status: 'proposed',
        requiresConfirmation: true,
      },
      feedback: {
        rating: 'helpful',
        comment: 'Very clear explanation.',
        submittedAt: new Date(),
      },
    });

    assert(message._id, 'Message should have _id');
    assert.strictEqual(message.intent, 'INTENT_CLINICAL_QA');
    assert.strictEqual(message.citations.length, 1);
    assert.strictEqual(message.citations[0].docId, 'DOC-CLIN-01');
    assert.strictEqual(message.actionProposal.actionType, 'BOOK_APPOINTMENT');
    assert.strictEqual(message.actionProposal.parameters.doctorName, 'Dr. Priya Sharma');
    assert.strictEqual(message.feedback.rating, 'helpful');
    assert.strictEqual(message.isDeleted, false);
    console.log('✅ PASS: ChatMessage validated with structured citations, action parameters, and feedback.');

    // 4. Test Soft-Deletion on Session
    console.log('\n--- Test Suite 4: Soft-Deletion Lifecycle ---');
    session.status = 'deleted';
    session.deletedAt = new Date();
    await session.save();

    const fetchedSession = await ChatSession.findById(session._id);
    assert.strictEqual(fetchedSession.status, 'deleted');
    assert(fetchedSession.deletedAt instanceof Date, 'deletedAt timestamp must be recorded');
    console.log('✅ PASS: Session soft-deletion records status="deleted" and deletedAt timestamp.');

    // Clean up test documents
    await ChatMessage.deleteMany({ session: session._id });
    await ChatSession.deleteOne({ _id: session._id });
    console.log('🧹 Cleanup: Test session and messages removed.');

    console.log('\n========================================');
    console.log('🎉 All Phase 3 Schema Tests Passed Successfully!');
    console.log('========================================');
  } catch (err) {
    console.error('❌ Schema test failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runSchemaValidationTests();
