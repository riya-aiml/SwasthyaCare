import ChatSession from './chatSession.model.js';
import ChatMessage from './chatMessage.model.js';
import RiskAssessment from '../assessments/riskAssessment.model.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_AI_SERVICE_SECRET || 'swasthya-internal-dev-key-2026';

/**
 * Chat Service (Sprint 11: S11-02, S11-03, S11-04, S11-05, S11-06)
 * Handles session lifecycle, cross-patient isolation, context bounding,
 * FastAPI RPC communication, and two-step action confirmation.
 */
class ChatService {
  /**
   * Create a new chat session for authenticated user
   */
  async createSession(userId, userRole, { title, language = 'en', metadata = {} } = {}) {
    const defaultTitle = title || (userRole === 'doctor' ? 'Clinical Assistant Session' : 'General Health Consultation');

    const session = await ChatSession.create({
      user: userId,
      role: userRole,
      title: defaultTitle,
      language,
      metadata,
    });

    return session;
  }

  /**
   * List active sessions for authenticated user (paginated)
   */
  async getUserSessions(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      ChatSession.find({ user: userId, status: { $ne: 'deleted' } })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ChatSession.countDocuments({ user: userId, status: { $ne: 'deleted' } }),
    ]);

    return {
      sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get session details and recent message history (enforces user ownership)
   */
  async getSessionWithMessages(sessionId, userId, { limit = 50 } = {}) {
    const session = await ChatSession.findOne({
      _id: sessionId,
      status: { $ne: 'deleted' },
    });

    if (!session) {
      const error = new Error('Chat session not found.');
      error.statusCode = 404;
      throw error;
    }

    // Strict patient-data isolation (S11-04 IDOR check)
    if (session.user.toString() !== userId.toString()) {
      const error = new Error('Forbidden: You do not have permission to access this chat session.');
      error.statusCode = 403;
      throw error;
    }

    const messages = await ChatMessage.find({ session: sessionId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    return { session, messages };
  }

  /**
   * Soft-delete a chat session
   */
  async deleteSession(sessionId, userId) {
    const session = await ChatSession.findOne({ _id: sessionId });

    if (!session) {
      const error = new Error('Chat session not found.');
      error.statusCode = 404;
      throw error;
    }

    if (session.user.toString() !== userId.toString()) {
      const error = new Error('Forbidden: You cannot delete another user\'s session.');
      error.statusCode = 403;
      throw error;
    }

    session.status = 'deleted';
    await session.save();

    return { success: true, message: 'Session deleted successfully.' };
  }

  /**
   * Post user message and generate assistant response via FastAPI Dual-RAG RPC
   */
  async processUserMessage(sessionId, user, content) {
    const session = await ChatSession.findOne({
      _id: sessionId,
      status: 'active',
    });

    if (!session) {
      const error = new Error('Active chat session not found.');
      error.statusCode = 404;
      throw error;
    }

    // Ownership verification
    if (session.user.toString() !== user._id.toString()) {
      const error = new Error('Forbidden: You cannot post messages to another user\'s session.');
      error.statusCode = 403;
      throw error;
    }

    // Persist User Message
    const userMessage = await ChatMessage.create({
      session: sessionId,
      user: user._id,
      role: 'user',
      content: content.trim(),
    });

    // Retrieve bounded conversation context (Last 10 turns for context bounding)
    const recentMessages = await ChatMessage.find({ session: sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const conversationHistory = recentMessages.reverse().map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Enrich with authorized patient context (Task S11-06)
    let patientContext = {
      fullName: user.fullName || `${user.firstName} ${user.lastName}`,
      role: user.role,
    };

    if (user.role === 'patient') {
      try {
        const recentAssessments = await RiskAssessment.find({ patient: user._id })
          .sort({ createdAt: -1 })
          .limit(2)
          .select('taskId prediction probability outputLabel createdAt')
          .lean();
        patientContext.recentAssessments = recentAssessments;
      } catch (err) {
        // Non-blocking context enrichment
      }
    }

    // Call FastAPI internal RPC
    let aiResponse;
    try {
      const rpcPayload = {
        user_id: user._id.toString(),
        user_role: user.role,
        message: content.trim(),
        conversation_history: conversationHistory,
        patient_context: patientContext,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${AI_SERVICE_URL}/api/v1/chat/internal-orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service-Key': INTERNAL_SERVICE_KEY,
        },
        body: JSON.stringify(rpcPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        aiResponse = await res.json();
      } else {
        throw new Error(`AI service returned HTTP ${res.status}`);
      }
    } catch (err) {
      // Graceful offline fallback if FastAPI is temporarily unreachable
      aiResponse = {
        intent: 'INTENT_CLINICAL_QA',
        is_emergency: false,
        response_text:
          'SwasthyaCare Assistant is temporarily operating in protected mode. ' +
          'For acute symptoms, please call 112 or 108. For appointment bookings, visit our Doctor Discovery portal.',
        citations: [],
        action_proposal: null,
        latency_ms: 10,
        provider: 'resilient-local-fallback',
      };
    }

    // Format action proposal if returned
    let formattedActionProposal = null;
    if (aiResponse.action_proposal && aiResponse.action_proposal.action_type !== 'NONE') {
      formattedActionProposal = {
        actionType: aiResponse.action_proposal.action_type,
        targetResource: aiResponse.action_proposal.target_resource,
        parameters: aiResponse.action_proposal.parameters,
        status: 'proposed',
        requiresConfirmation: aiResponse.action_proposal.requires_confirmation ?? true,
      };
    }

    // Persist Assistant Message
    const assistantMessage = await ChatMessage.create({
      session: sessionId,
      user: user._id,
      role: 'assistant',
      content: aiResponse.response_text,
      intent: aiResponse.intent,
      isEmergency: aiResponse.is_emergency,
      citations: (aiResponse.citations || []).map((c) => ({
        docId: c.doc_id,
        title: c.title,
        sourceOrganization: c.source_organization,
        snippet: c.snippet,
      })),
      actionProposal: formattedActionProposal,
      latencyMs: aiResponse.latency_ms || 0,
      provider: aiResponse.provider || 'deterministic-mock',
    });

    // Update Session Metadata
    session.messageCount += 2;
    session.lastMessagePreview = aiResponse.response_text.substring(0, 190);
    session.lastMessageAt = new Date();
    await session.save();

    return {
      userMessage,
      assistantMessage,
    };
  }

  /**
   * Submit feedback (thumbs-up/down) on assistant message
   */
  async recordFeedback(messageId, userId, { rating, comment = '' }) {
    if (!['helpful', 'unhelpful'].includes(rating)) {
      const error = new Error('Rating must be "helpful" or "unhelpful".');
      error.statusCode = 400;
      throw error;
    }

    const message = await ChatMessage.findOne({ _id: messageId });
    if (!message) {
      const error = new Error('Message not found.');
      error.statusCode = 404;
      throw error;
    }

    if (message.user.toString() !== userId.toString()) {
      const error = new Error('Forbidden: You cannot provide feedback on another user\'s message.');
      error.statusCode = 403;
      throw error;
    }

    message.feedback = {
      rating,
      comment: comment.trim(),
      submittedAt: new Date(),
    };
    await message.save();

    return { success: true, message: 'Feedback recorded successfully.' };
  }

  /**
   * Confirm or reject an action proposal (Two-step confirmation for consequential actions)
   */
  async handleActionConfirmation(messageId, userId, { confirmed }) {
    const message = await ChatMessage.findOne({ _id: messageId });
    if (!message) {
      const error = new Error('Message not found.');
      error.statusCode = 404;
      throw error;
    }

    if (message.user.toString() !== userId.toString()) {
      const error = new Error('Forbidden.');
      error.statusCode = 403;
      throw error;
    }

    if (!message.actionProposal || message.actionProposal.actionType === 'NONE') {
      const error = new Error('No action proposal found for this message.');
      error.statusCode = 400;
      throw error;
    }

    message.actionProposal.status = confirmed ? 'confirmed' : 'rejected';
    await message.save();

    return {
      success: true,
      actionStatus: message.actionProposal.status,
      actionType: message.actionProposal.actionType,
      message: confirmed
        ? `Action ${message.actionProposal.actionType} confirmed by user.`
        : 'Action cancelled by user.',
    };
  }
}

export default new ChatService();
