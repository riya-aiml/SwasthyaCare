import Appointment from '../appointments/appointment.model.js';
import FollowUpPlan from '../followups/followUpPlan.model.js';
import RecoveryUpdate from '../followups/recoveryUpdate.model.js';
import NotificationJob from '../followups/notificationJob.model.js';
import User from '../users/user.model.js';
import DoctorProfile from '../doctors/doctorProfile.model.js';

/**
 * Dashboard & Integration Controller (Sprint 7: S7-01, S7-02, S7-03, S7-04)
 * Provides role-specific views and aggregates with privacy safeguards.
 */

/**
 * 1. GET /api/dashboards/patient (S7-01)
 * Returns the authenticated patient's personalized health command center
 */
export const getPatientDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only patients can access the patient dashboard' },
      });
    }

    const patientId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // Find next upcoming appointment
    const nextAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $in: ['PENDING', 'APPROVED'] },
      appointmentDate: { $gte: today },
    })
      .populate('doctor', 'firstName lastName email')
      .populate('doctorProfile', 'fullName specialty hospital')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    // Counts
    const [upcomingApptsCount, totalApptsCount, activePlansCount, recentUpdates] = await Promise.all([
      Appointment.countDocuments({
        patient: patientId,
        status: { $in: ['PENDING', 'APPROVED'] },
        appointmentDate: { $gte: today },
      }),
      Appointment.countDocuments({ patient: patientId }),
      FollowUpPlan.countDocuments({ patient: patientId, status: 'ACTIVE' }),
      RecoveryUpdate.find({ patient: patientId })
        .populate({ path: 'plan', select: 'diagnosis doctor' })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Active care plans with medications
    const activeCarePlans = await FollowUpPlan.find({
      patient: patientId,
      status: 'ACTIVE',
    })
      .populate('doctor', 'firstName lastName email')
      .populate('doctorProfile', 'fullName specialty hospital')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          upcomingAppointments: upcomingApptsCount,
          totalAppointments: totalApptsCount,
          activeCarePlans: activePlansCount,
          recentUpdatesSubmitted: recentUpdates.length,
        },
        nextAppointment,
        activeCarePlans,
        recentUpdates,
      },
    });
  } catch (error) {
    console.error('getPatientDashboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve patient dashboard data' },
    });
  }
};

/**
 * 2. GET /api/dashboards/doctor (S7-02)
 * Returns the clinician's operational queue, triage alerts, and active plans
 */
export const getDoctorDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only doctors can access the doctor dashboard' },
      });
    }

    const doctorId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const [
      pendingCount,
      todayApptsCount,
      activePlansCount,
      pendingRequests,
      todayAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorId, status: 'PENDING' }),
      Appointment.countDocuments({ doctor: doctorId, status: 'APPROVED', appointmentDate: today }),
      FollowUpPlan.countDocuments({ doctor: doctorId, status: 'ACTIVE' }),
      Appointment.find({ doctor: doctorId, status: 'PENDING' })
        .populate('patient', 'firstName lastName email phoneNumber')
        .sort({ createdAt: -1 })
        .limit(5),
      Appointment.find({ doctor: doctorId, status: 'APPROVED', appointmentDate: today })
        .populate('patient', 'firstName lastName email phoneNumber')
        .sort({ appointmentTime: 1 }),
    ]);

    // Get doctor's plans to find recovery updates needing clinical attention
    const doctorPlans = await FollowUpPlan.find({ doctor: doctorId }).select('_id');
    const planIds = doctorPlans.map(p => p._id);

    const flaggedUpdates = await RecoveryUpdate.find({
      plan: { $in: planIds },
      $or: [
        { hasWarningSymptoms: true },
        { 'clinicianReview.isReviewed': false },
      ],
    })
      .populate('patient', 'firstName lastName email')
      .populate('plan', 'diagnosis')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          pendingRequests: pendingCount,
          todayAppointments: todayApptsCount,
          activeCarePlans: activePlansCount,
          alertsNeedingAttention: flaggedUpdates.length,
        },
        pendingRequests,
        todayAppointments,
        flaggedUpdates,
      },
    });
  } catch (error) {
    console.error('getDoctorDashboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve doctor dashboard data' },
    });
  }
};

/**
 * 3. GET /api/dashboards/admin (S7-03)
 * Returns system-wide operational metrics, user distributions, and onboarding queues
 */
export const getAdminDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only administrators can access the admin dashboard' },
      });
    }

    const [
      totalUsers,
      patientCount,
      doctorCount,
      adminCount,
      managementCount,
      totalAppointments,
      totalPlans,
      totalNotifications,
      doctorProfiles,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'hospital_management' }),
      Appointment.countDocuments(),
      FollowUpPlan.countDocuments(),
      NotificationJob.countDocuments(),
      DoctorProfile.find()
        .populate('user', 'firstName lastName email isApproved createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      data: {
        userDistribution: {
          total: totalUsers,
          patients: patientCount,
          doctors: doctorCount,
          admins: adminCount,
          hospital_management: managementCount,
        },
        systemWorkload: {
          totalAppointments,
          totalPlans,
          totalNotifications,
        },
        doctorOnboardingQueue: doctorProfiles,
      },
    });
  } catch (error) {
    console.error('getAdminDashboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve admin dashboard data' },
    });
  }
};

/**
 * 4. GET /api/dashboards/management (S7-04)
 * Returns purely aggregate healthcare utilization metrics
 * PRIVACY SAFEGUARD: NO individual patient records, personal identities, or PII exposed!
 */
export const getManagementDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'hospital_management' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only hospital management and admins can access aggregate reporting' },
      });
    }

    // Appointment lifecycle aggregations
    const [totalAppts, approvedAppts, rejectedAppts, cancelledAppts, pendingAppts] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'APPROVED' }),
      Appointment.countDocuments({ status: 'REJECTED' }),
      Appointment.countDocuments({ status: 'CANCELLED' }),
      Appointment.countDocuments({ status: 'PENDING' }),
    ]);

    const approvalRate = totalAppts > 0 ? Number(((approvedAppts / totalAppts) * 100).toFixed(1)) : 0;
    const cancellationRate = totalAppts > 0 ? Number(((cancelledAppts / totalAppts) * 100).toFixed(1)) : 0;

    // Follow-up & Recovery adherence metrics
    const [totalUpdates, fullAdherence, partialAdherence, missedAdherence, ratingAgg] = await Promise.all([
      RecoveryUpdate.countDocuments(),
      RecoveryUpdate.countDocuments({ medicationAdherence: 'Full' }),
      RecoveryUpdate.countDocuments({ medicationAdherence: 'Partial' }),
      RecoveryUpdate.countDocuments({ medicationAdherence: { $in: ['Missed', 'None'] } }),
      RecoveryUpdate.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$recoveryRating' } } },
      ]),
    ]);

    const avgRecoveryRating = ratingAgg.length > 0 ? Number(ratingAgg[0].avgRating.toFixed(2)) : 5.0;

    // Specialty distribution (Aggregate only)
    const specialtyAgg = await DoctorProfile.aggregate([
      { $group: { _id: '$specialty', doctorCount: { $sum: 1 } } },
      { $project: { _id: 0, specialty: '$_id', count: '$doctorCount' } },
      { $sort: { count: -1 } },
    ]);

    // Notification delivery efficiency metrics
    const [totalJobs, sentJobs, failedJobs, pendingJobs] = await Promise.all([
      NotificationJob.countDocuments(),
      NotificationJob.countDocuments({ status: 'SENT' }),
      NotificationJob.countDocuments({ status: 'FAILED' }),
      NotificationJob.countDocuments({ status: 'PENDING' }),
    ]);

    const deliverySuccessRate =
      sentJobs + failedJobs > 0
        ? Number(((sentJobs / (sentJobs + failedJobs)) * 100).toFixed(1))
        : 100.0;

    res.status(200).json({
      success: true,
      data: {
        appointmentMetrics: {
          total: totalAppts,
          approved: approvedAppts,
          rejected: rejectedAppts,
          cancelled: cancelledAppts,
          pending: pendingAppts,
          approvalRatePercentage: approvalRate,
          cancellationRatePercentage: cancellationRate,
        },
        careFollowUpMetrics: {
          totalUpdatesLogged: totalUpdates,
          averageRecoveryRating: avgRecoveryRating,
          medicationAdherenceDistribution: {
            full: fullAdherence,
            partial: partialAdherence,
            missedOrNone: missedAdherence,
          },
        },
        clinicalSpecialties: specialtyAgg,
        notificationReliability: {
          totalQueued: totalJobs,
          delivered: sentJobs,
          failed: failedJobs,
          pending: pendingJobs,
          deliverySuccessRatePercentage: deliverySuccessRate,
        },
      },
    });
  } catch (error) {
    console.error('getManagementDashboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve management aggregate data' },
    });
  }
};
