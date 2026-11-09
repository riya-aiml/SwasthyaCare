import express from 'express';
import {
  createFollowUpPlan,
  getMyFollowUpPlans,
  getClinicianPlans,
  getFollowUpPlanById,
  submitRecoveryUpdate,
  reviewRecoveryUpdate,
  triggerReminderProcessing,
  getScheduledReminders,
} from './followUp.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Follow-up & Post-Discharge Routes (Sprint 5)
 * Base path: /api/follow-ups
 */

// 1. Reminders & Background Worker Triggers (MUST BE BEFORE /:id)
router.post('/reminders/process', authenticate, triggerReminderProcessing);
router.get('/reminders', authenticate, getScheduledReminders);

// 2. Plan Management
router.post('/', authenticate, createFollowUpPlan);
router.get('/my-plans', authenticate, getMyFollowUpPlans);
router.get('/clinician/plans', authenticate, getClinicianPlans);

// 3. Recovery Updates
router.post('/:planId/recovery-updates', authenticate, submitRecoveryUpdate);
router.put('/updates/:updateId/review', authenticate, reviewRecoveryUpdate);

// 4. Parameterized route (MUST BE LAST)
router.get('/:id', authenticate, getFollowUpPlanById);

export default router;
