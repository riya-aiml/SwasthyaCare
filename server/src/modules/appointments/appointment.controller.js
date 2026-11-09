import Appointment from './appointment.model.js';
import AvailabilitySlot from '../doctors/availabilitySlot.model.js';
import DoctorProfile from '../doctors/doctorProfile.model.js';
import mongoose from 'mongoose';

/**
 * Appointment Controller
 * Handles appointment booking, approval/rejection, and history
 */

/**
 * 1. POST /api/appointments/request
 * Patient requests an appointment for an available slot
 * Note: Using optimistic locking instead of transactions for development compatibility
 */
export const requestAppointment = async (req, res) => {
  try {
    const { slotId, reason, symptoms, consultationType = 'in-person' } = req.body;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Slot ID is required' },
      });
    }

    // 1. Find the slot
    const slot = await AvailabilitySlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        error: { message: 'Availability slot not found' },
      });
    }

    // 2. Check if slot is still available
    if (slot.isBooked || slot.status !== 'available') {
      return res.status(409).json({
        success: false,
        error: { message: 'This slot is no longer available' },
      });
    }

    // 3. Check if there's already a pending/approved appointment for this slot
    const existingAppointment = await Appointment.findOne({
      availabilitySlot: slotId,
      status: { $in: ['PENDING', 'APPROVED'] },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        error: { message: 'This slot already has a pending or approved appointment' },
      });
    }

    // 4. Create appointment
    const appointment = new Appointment({
      patient: req.user._id,
      doctor: slot.doctorUser,
      doctorProfile: slot.doctor,
      availabilitySlot: slotId,
      appointmentDate: slot.date,
      appointmentTime: slot.startTime,
      status: 'PENDING',
      consultationType: consultationType || slot.consultationType,
      reason,
      symptoms,
    });

    await appointment.save();

    // 5. Mark slot as reserved (not fully booked until approved)
    slot.status = 'reserved';
    await slot.save();

    // Populate for response
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phoneNumber' },
      { path: 'doctor', select: 'firstName lastName email' },
      { path: 'doctorProfile', select: 'fullName specialty hospital consultationFee' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('requestAppointment error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to request appointment' },
    });
  }
};

/**
 * 2. GET /api/appointments/my-appointments
 * Get current user's appointments (patient or doctor view)
 */
export const getMyAppointments = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else {
      return res.status(403).json({
        success: false,
        error: { message: 'Only patients and doctors can view appointments' },
      });
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Upcoming filter (future dates only)
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query.appointmentDate = { $gte: today };
      query.status = { $in: ['PENDING', 'APPROVED'] };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('doctor', 'firstName lastName email')
      .populate('doctorProfile', 'fullName specialty hospital consultationFee avatar')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.status(200).json({
      success: true,
      data: { appointments },
    });
  } catch (error) {
    console.error('getMyAppointments error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve appointments' },
    });
  }
};

/**
 * 3. GET /api/appointments/:id
 * Get single appointment details
 */
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('doctor', 'firstName lastName email')
      .populate('doctorProfile', 'fullName specialty hospital consultationFee avatar');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' },
      });
    }

    // Authorization: Only patient, doctor, or admin can view
    const isAuthorized =
      appointment.patient._id.toString() === req.user._id.toString() ||
      appointment.doctor._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view this appointment' },
      });
    }

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    console.error('getAppointmentById error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve appointment' },
    });
  }
};

/**
 * 4. PUT /api/appointments/:id/approve
 * Doctor approves a pending appointment request
 * Note: Using optimistic locking instead of transactions for development compatibility
 */
export const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the appointment
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' },
      });
    }

    // 2. Authorization: Only the assigned doctor can approve
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the assigned doctor can approve this appointment' },
      });
    }

    // 3. Check state transition is valid
    if (!appointment.canTransitionTo('APPROVED')) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot approve appointment with status ${appointment.status}` },
      });
    }

    // 4. Double-booking protection: Check no other APPROVED appointment exists for this slot
    const conflictingAppointment = await Appointment.findOne({
      availabilitySlot: appointment.availabilitySlot,
      status: 'APPROVED',
      _id: { $ne: appointment._id },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        error: { message: 'This slot has already been approved for another patient' },
      });
    }

    // 5. Update appointment status
    appointment.status = 'APPROVED';
    appointment.reviewedBy = req.user._id;
    appointment.reviewedAt = new Date();
    await appointment.save();

    // 6. Mark slot as fully booked
    const slot = await AvailabilitySlot.findById(appointment.availabilitySlot);
    if (slot) {
      slot.status = 'booked';
      slot.isBooked = true;
      slot.bookedByPatient = appointment.patient;
      await slot.save();
    }

    // 7. Reject all other PENDING appointments for this slot
    await Appointment.updateMany(
      {
        availabilitySlot: appointment.availabilitySlot,
        status: 'PENDING',
        _id: { $ne: appointment._id },
      },
      {
        $set: {
          status: 'REJECTED',
          rejectionReason: 'Slot was approved for another patient',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
      }
    );

    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phoneNumber' },
      { path: 'doctor', select: 'firstName lastName email' },
      { path: 'doctorProfile', select: 'fullName specialty hospital' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Appointment approved successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('approveAppointment error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to approve appointment' },
    });
  }
};

/**
 * 5. PUT /api/appointments/:id/reject
 * Doctor rejects a pending appointment request
 */
export const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' },
      });
    }

    // Authorization: Only the assigned doctor can reject
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the assigned doctor can reject this appointment' },
      });
    }

    // Check state transition is valid
    if (!appointment.canTransitionTo('REJECTED')) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot reject appointment with status ${appointment.status}` },
      });
    }

    // Update appointment
    appointment.status = 'REJECTED';
    appointment.rejectionReason = reason || 'No reason provided';
    appointment.reviewedBy = req.user._id;
    appointment.reviewedAt = new Date();
    await appointment.save();

    // Release the slot back to available
    const slot = await AvailabilitySlot.findById(appointment.availabilitySlot);
    if (slot && slot.status === 'reserved') {
      slot.status = 'available';
      await slot.save();
    }

    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phoneNumber' },
      { path: 'doctor', select: 'firstName lastName email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Appointment rejected',
      data: { appointment },
    });
  } catch (error) {
    console.error('rejectAppointment error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to reject appointment' },
    });
  }
};

/**
 * 6. PUT /api/appointments/:id/cancel
 * Patient or doctor cancels an appointment
 */
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' },
      });
    }

    // Authorization: Only patient or doctor can cancel
    const isAuthorized =
      appointment.patient.toString() === req.user._id.toString() ||
      appointment.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the patient or doctor can cancel this appointment' },
      });
    }

    // Check state transition is valid
    if (!appointment.canTransitionTo('CANCELLED')) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot cancel appointment with status ${appointment.status}` },
      });
    }

    // Update appointment
    appointment.status = 'CANCELLED';
    appointment.cancellationReason = reason || 'No reason provided';
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Release the slot back to available
    const slot = await AvailabilitySlot.findById(appointment.availabilitySlot);
    if (slot) {
      slot.status = 'available';
      slot.isBooked = false;
      slot.bookedByPatient = null;
      await slot.save();
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('cancelAppointment error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to cancel appointment' },
    });
  }
};

/**
 * 7. GET /api/appointments/pending
 * Doctor views pending appointment requests assigned to them
 */
export const getPendingAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only doctors can view pending appointment requests' },
      });
    }

    const appointments = await Appointment.find({
      doctor: req.user._id,
      status: 'PENDING',
    })
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('doctorProfile', 'fullName specialty hospital')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      data: { appointments },
    });
  } catch (error) {
    console.error('getPendingAppointments error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve pending appointments' },
    });
  }
};
