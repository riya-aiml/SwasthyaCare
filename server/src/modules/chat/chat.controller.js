import ChatSession from './chatSession.model.js';
import ChatMessage from './chatMessage.model.js';
import { buildPatientContext, queryAssistantRAG } from './chat.service.js';

/**
 * 1. POST /api/chat/sessions
 * Creates a new conversational session for the authenticated patient
 */
export const createSession = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { title } = req.body;

    const session = await ChatSession.create({
      patient: patientId,
      title: title?.trim() || 'New Health Conversation',
    });

    // Create initial welcoming greeting message
    const welcomeMessage = await ChatMessage.create({
      session: session._id,
      patient: patientId,
      sender: 'assistant',
      content: `Hello ${req.user.firstName || 'there'}! 👋 I am your SwasthyaCare AI Health Assistant. I can help explain your risk assessment factors, guide you through appointment booking, or answer general wellness questions based on official guidelines.\n\n*Notice: I provide navigation and education support — I do not provide clinical diagnoses or prescribe medication.*`,
      intent: 'APP_HELP',
      citations: [
        {
          sourceId: 'SWC-APP-01',
          title: 'SwasthyaCare Platform Architecture & Clinical Workflows',
          urlOrSection: 'Overview',
        },
      ],
      actionSuggestion: {
        type: 'NAVIGATE_TAB',
        label: 'View Appointments',
        target: 'appointments',
      },
      isEmergency: false,
    });

    return res.status(201).json({
      success: true,
      data: {
        session,
        initialMessage: welcomeMessage,
      },
    });
  } catch (error) {
    console.error('createSession error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create chat session' },
    });
  }
};

/**
 * 2. GET /api/chat/sessions
 * Lists all chat sessions for the authenticated patient (Multi-Tenant Isolated)
 */
export const listSessions = async (req, res) => {
  try {
    const patientId = req.user._id;

    const sessions = await ChatSession.find({ patient: patientId })
      .sort({ lastMessageAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('listSessions error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve chat sessions' },
    });
  }
};

/**
 * 3. GET /api/chat/sessions/:id
 * Retrieves a single session with tenant ownership verification
 */
export const getSession = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;

    const session = await ChatSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Chat session not found' },
      });
    }

    // Strict multi-tenant isolation check
    if (session.patient.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You cannot access chat sessions belonging to another patient' },
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('getSession error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve session details' },
    });
  }
};

/**
 * 4. DELETE /api/chat/sessions/:id
 * Right to Erasure: Cascading deletion of session and all associated messages (Task S11-10)
 */
export const deleteSession = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;

    const session = await ChatSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Chat session not found' },
      });
    }

    // Verify ownership
    if (session.patient.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You cannot delete chat sessions belonging to another patient' },
      });
    }

    // Cascade delete all chat messages belonging to this session
    await ChatMessage.deleteMany({ session: id, patient: patientId });

    // Delete session
    await ChatSession.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Chat session and all associated messages have been permanently deleted.',
    });
  } catch (error) {
    console.error('deleteSession error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to delete chat session' },
    });
  }
};

/**
 * 5. GET /api/chat/sessions/:id/messages
 * Retrieves chronological message history for a verified session
 */
export const getSessionMessages = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;

    const session = await ChatSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Chat session not found' },
      });
    }

    if (session.patient.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You do not have access to this conversation' },
      });
    }

    const messages = await ChatMessage.find({ session: id, patient: patientId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('getSessionMessages error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve message history' },
    });
  }
};

/**
 * 6. POST /api/chat/sessions/:id/messages
 * Processes patient query, queries FastAPI RAG, saves both messages, and returns structured answer
 */
export const sendMessage = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { id: sessionId } = req.params;
    const { message, locale = 'en' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message content is required and cannot be empty' },
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message exceeds the maximum allowed length of 2000 characters' },
      });
    }

    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Chat session not found' },
      });
    }

    if (session.patient.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You cannot post in another patient session' },
      });
    }

    // 1. Save user query in MongoDB
    const userMessage = await ChatMessage.create({
      session: sessionId,
      patient: patientId,
      sender: 'user',
      content: message.trim(),
    });

    // Auto-update session title if it's the first user message
    if (session.title === 'New Health Conversation') {
      const trimmedTitle = message.trim().slice(0, 36);
      session.title = trimmedTitle.length < message.trim().length ? `${trimmedTitle}...` : trimmedTitle;
    }
    session.lastMessageAt = new Date();
    await session.save();

    // 2. Build patient context from DB (Task S11-05)
    const patientContext = await buildPatientContext(patientId);

    // 3. Query internal AI microservice
    const ragResult = await queryAssistantRAG({
      sessionId,
      userId: patientId,
      message: message.trim(),
      locale,
      patientContext,
    });

    // 4. Save assistant response in MongoDB
    const assistantMessage = await ChatMessage.create({
      session: sessionId,
      patient: patientId,
      sender: 'assistant',
      content: ragResult.content,
      intent: ragResult.intent,
      citations: ragResult.citations,
      actionSuggestion: ragResult.actionSuggestion,
      isEmergency: ragResult.isEmergency,
      disclaimer: ragResult.disclaimer,
    });

    return res.status(200).json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
      },
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to process message' },
    });
  }
};

/**
 * 7. POST /api/chat/messages/:id/feedback
 * Allows patient to rate assistant responses (Task S11-03)
 */
export const submitFeedback = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { id: messageId } = req.params;
    const { rating, comment } = req.body;

    if (!['helpful', 'unhelpful', 'neutral'].includes(rating)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid rating. Allowed: helpful, unhelpful, neutral' },
      });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: { message: 'Message not found' },
      });
    }

    if (message.patient.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You cannot rate another user message' },
      });
    }

    message.feedback = {
      rating,
      comment: comment ? comment.trim() : '',
      submittedAt: new Date(),
    };
    await message.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully',
      data: message.feedback,
    });
  } catch (error) {
    console.error('submitFeedback error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to submit feedback' },
    });
  }
};

/**
 * 8. GET /api/chat/quick-actions
 * Returns contextual quick prompt chips based on active client page (Task S11-04)
 */
export const getQuickActions = async (req, res) => {
  try {
    const { currentTab = 'default' } = req.query;

    const quickActionMap = {
      'risk-assessment': [
        { label: 'Explain my diabetes risk factors', prompt: 'Why did my diabetes screening show an elevated pattern?' },
        { label: 'Explain my cardiovascular factors', prompt: 'What are the main contributing factors in my heart risk estimate?' },
        { label: 'Normal blood pressure ranges', prompt: 'What are normal blood pressure ranges under ICMR guidelines?' },
      ],
      'appointments': [
        { label: 'How to book a specialist', prompt: 'How do I book an appointment with a cardiology specialist?' },
        { label: 'Rescheduling policy', prompt: 'What is SwasthyaCare’s appointment rescheduling and cancellation policy?' },
        { label: 'Find available doctors', prompt: 'Where can I see available doctor time slots today?' },
      ],
      'opd-queue': [
        { label: 'How does live queue work?', prompt: 'How does the live OPD queue tracker work?' },
        { label: 'Estimated wait time', prompt: 'How is estimated wait time calculated in the queue?' },
        { label: 'Notify my turn', prompt: 'Will I be notified when my token number is called?' },
      ],
      'followup': [
        { label: 'How to request clinical review', prompt: 'How do I message my doctor for a follow-up consultation?' },
        { label: 'Medication questions notice', prompt: 'Can you change or renew my active prescriptions?' },
      ],
      'default': [
        { label: 'Book an appointment', prompt: 'How do I schedule an appointment with a doctor?' },
        { label: 'Explain risk assessments', prompt: 'How does SwasthyaCare calculate risk scores?' },
        { label: 'Check normal BP range', prompt: 'What is normal blood pressure according to ICMR guidelines?' },
        { label: 'Live queue assistance', prompt: 'Where can I track my live OPD queue token?' },
      ],
    };

    const chips = quickActionMap[currentTab] || quickActionMap['default'];

    return res.status(200).json({
      success: true,
      data: {
        tab: currentTab,
        chips,
      },
    });
  } catch (error) {
    console.error('getQuickActions error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch quick actions' },
    });
  }
};
