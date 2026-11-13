import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { chatRateLimiter } from '../../middleware/rateLimiter.js';
import chatController from './chat.controller.js';

const router = express.Router();

/**
 * All chat assistant routes require authenticated JWT bearer token
 * Enforces patient-data isolation and authorized role context
 */
router.use(authenticate);

// Session endpoints
router.post('/sessions', chatRateLimiter, chatController.createSession);
router.get('/sessions', chatController.getSessions);
router.get('/sessions/:id', chatController.getSession);
router.delete('/sessions/:id', chatController.deleteSession);

// Messaging endpoints (strictly rate-limited against LLM flood)
router.post('/sessions/:id/messages', chatRateLimiter, chatController.sendMessage);

// Feedback and two-step action confirmation
router.post('/messages/:id/feedback', chatController.submitFeedback);
router.post('/messages/:id/confirm-action', chatRateLimiter, chatController.confirmAction);

// ElevenLabs Neural Human Voice Generation
router.post('/tts', chatRateLimiter, chatController.generateElevenLabsTTS);

export default router;
