import express from 'express';
import {
  getDoctorsDirectory,
  getDoctorById,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  getDoctorSlots,
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getMyDoctorSchedule,
  seedSampleDoctors,
} from './doctor.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Doctor Module Routes
 * Base path: /api/doctors
 */

// 1. Directory & Public Doctor Endpoints
router.get('/', getDoctorsDirectory);
router.get('/seed', seedSampleDoctors);

// 2. Doctor Self-Management (Protected: Doctor role verified in controller)
router.get('/profile/me', authenticate, getMyDoctorProfile);
router.put('/profile/me', authenticate, updateMyDoctorProfile);

// 3. Availability Management (Protected)
router.get('/availability/my-schedule', authenticate, getMyDoctorSchedule);
router.post('/availability', authenticate, createAvailabilitySlot);
router.delete('/availability/:slotId', authenticate, deleteAvailabilitySlot);

// 4. Specific Doctor Profile & Slots (Public/Patient accessible)
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);

export default router;
