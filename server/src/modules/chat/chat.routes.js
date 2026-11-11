import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import {
  createSession,
  listSessions,
  getSession,
  deleteSession,
  getSessionMessages,
  sendMessage,
  submitFeedback,
  getQuickActions,
} from './chat.controller.js';

const router = express.Router();

// All chat routes require JWT authentication
router.use(authenticate);

// Session endpoints
router.post('/sessions', createSession);
router.get('/sessions', listSessions);
router.get('/sessions/:id', getSession);
router.delete('/sessions/:id', deleteSession);

// Message endpoints
router.get('/sessions/:id/messages', getSessionMessages);
router.post('/sessions/:id/messages', sendMessage);

// Feedback endpoint
router.post('/messages/:id/feedback', submitFeedback);

// Contextual Quick Actions endpoint
router.get('/quick-actions', getQuickActions);

export default router;
