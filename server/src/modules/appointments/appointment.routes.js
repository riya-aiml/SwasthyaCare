import express from 'express';
import {
  requestAppointment,
  getMyAppointments,
  getAppointmentById,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  getPendingAppointments,
} from './appointment.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Appointment Routes
 * Base path: /api/appointments
 * All routes require authentication
 */

/**
 * @route   POST /api/appointments/request
 * @desc    Patient requests an appointment
 * @access  Private (Patient)
 */
router.post('/request', authenticate, requestAppointment);

/**
 * @route   GET /api/appointments/my-appointments
 * @desc    Get current user's appointments (patient or doctor)
 * @access  Private
 */
router.get('/my-appointments', authenticate, getMyAppointments);

/**
 * @route   GET /api/appointments/pending
 * @desc    Doctor views pending requests assigned to them
 * @access  Private (Doctor)
 */
router.get('/pending', authenticate, getPendingAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get single appointment details
 * @access  Private (Patient, Doctor, or Admin)
 */
router.get('/:id', authenticate, getAppointmentById);

/**
 * @route   PUT /api/appointments/:id/approve
 * @desc    Doctor approves appointment
 * @access  Private (Doctor - assigned only)
 */
router.put('/:id/approve', authenticate, approveAppointment);

/**
 * @route   PUT /api/appointments/:id/reject
 * @desc    Doctor rejects appointment
 * @access  Private (Doctor - assigned only)
 */
router.put('/:id/reject', authenticate, rejectAppointment);

/**
 * @route   PUT /api/appointments/:id/cancel
 * @desc    Patient or doctor cancels appointment
 * @access  Private (Patient or Doctor)
 */
router.put('/:id/cancel', authenticate, cancelAppointment);

export default router;
