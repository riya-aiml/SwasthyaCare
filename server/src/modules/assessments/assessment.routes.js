import express from 'express';
import {
  createDiabetesAssessment,
  createCardiovascularAssessment,
  getMyAssessments,
  getAssessmentById,
  getPatientAssessmentsForClinician,
  reviewAssessment,
} from './assessment.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Assessment Routes (Sprint 7: ML-S7-04 to ML-S7-07)
 * Base path: /api/assessments
 * All assessment endpoints require JWT authentication
 */

// 1. Submit and Persist Assessments
router.post('/diabetes', authenticate, createDiabetesAssessment);
router.post('/cardiovascular', authenticate, createCardiovascularAssessment);

// 2. Patient Assessment History
router.get('/my-history', authenticate, getMyAssessments);

// 3. Clinician Review Endpoints
router.get(
  '/patient/:patientId',
  authenticate,
  authorize('doctor', 'admin', 'hospital_management'),
  getPatientAssessmentsForClinician
);
router.post('/:id/review', authenticate, authorize('doctor'), reviewAssessment);

// 4. Single Assessment Detail (with access-control check)
router.get('/:id', authenticate, getAssessmentById);

export default router;
