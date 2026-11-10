import express from 'express';
import {
  predictHeartRisk,
  predictDiabetesRisk,
  processMedicineOCR,
  getAIServiceHealth,
  assessDiabetesCurrentStatus,
  assessCardiovascularCurrentStatus,
  getInternalMLHealth,
} from './ai.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

/**
 * AI & Clinical Decision Support Routes (Sprint 6)
 * Base path: /api/ai
 * All clinical prediction endpoints require authentication (S6 criteria)
 */

router.get('/health', getAIServiceHealth);
router.post('/predict/heart-risk', authenticate, predictHeartRisk);
router.post('/predict/diabetes-risk', authenticate, predictDiabetesRisk);
router.post('/ocr/medicine', authenticate, processMedicineOCR);

// Sprint 6 ML Internal RPC Routes (Current-Status Prototypes)
router.get('/assessments/health', authenticate, getInternalMLHealth);
router.post('/assessments/diabetes/current-status', authenticate, assessDiabetesCurrentStatus);
router.post('/assessments/cardiovascular/current-status', authenticate, assessCardiovascularCurrentStatus);

export default router;
