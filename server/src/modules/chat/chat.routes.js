import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import chatController from './chat.controller.js';

const router = express.Router();

/**
 * All chat assistant routes require authenticated JWT bearer token
 * Enforces patient-data isolation and authorized role context
 */
router.use(authenticate);

// Session endpoints
router.post('/sessions', chatController.createSession);
router.get('/sessions', chatController.getSessions);
router.get('/sessions/:id', chatController.getSession);
router.delete('/sessions/:id', chatController.deleteSession);

// Messaging endpoints
router.post('/sessions/:id/messages', chatController.sendMessage);

// Feedback and two-step action confirmation
router.post('/messages/:id/feedback', chatController.submitFeedback);
router.post('/messages/:id/confirm-action', chatController.confirmAction);

export default router;
