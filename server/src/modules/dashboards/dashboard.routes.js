import express from 'express';
import {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
  getManagementDashboard,
} from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Role-Specific Dashboard Routes (Sprint 7)
 * Base path: /api/dashboards
 * All routes require authentication and enforce role verification
 */

router.get('/patient', authenticate, getPatientDashboard);
router.get('/doctor', authenticate, getDoctorDashboard);
router.get('/admin', authenticate, getAdminDashboard);
router.get('/management', authenticate, getManagementDashboard);

export default router;
