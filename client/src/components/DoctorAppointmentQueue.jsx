import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';

export default function DoctorAppointmentQueue() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: null, appointmentId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingAppointments();
  }, []);

  const loadPendingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await appointmentService.getPendingAppointments();
      setAppointments(result.data.appointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    setActionLoading(true);
    try {
      await appointmentService.approveAppointment(appointmentId);
      await loadPendingAppointments();
      setActionModal({ open: false, type: null, appointmentId: null });
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (appointmentId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
      await appointmentService.rejectAppointment(appointmentId, rejectionReason);
      await loadPendingAppointments();
      setActionModal({ open: false, type: null, appointmentId: null });
      setRejectionReason('');
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (type, appointmentId) => {
    setActionModal({ open: true, type, appointmentId });
    setRejectionReason('');
  };

  const closeActionModal = () => {
    setActionModal({ open: false, type: null, appointmentId: null });
    setRejectionReason('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">⚠️</span>
          <span className="font-semibold">Error Loading Queue</span>
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadPendingAppointments}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-lg">
            📋
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Pending Appointment Requests</h3>
            <p className="text-xs text-gray-500">Review and approve patient appointment requests</p>
          </div>
        </div>
        <button
          onClick={loadPendingAppointments}
          className="px-3 py-1.5 text-sm text-teal-700 hover:bg-teal-50 rounded-lg transition flex items-center space-x-1"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-6xl mb-3">✅</div>
          <h4 className="text-lg font-semibold text-gray-700 mb-1">All Clear!</h4>
          <p className="text-sm text-gray-500">No pending appointment requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </h4>
                      <p className="text-xs text-gray-500">{appointment.patient.email}</p>
                      {appointment.patient.phoneNumber && (
                        <p className="text-xs text-gray-500">📞 {appointment.patient.phoneNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 block mb-0.5">Date</span>
                      <span className="font-medium text-gray-900">{appointment.appointmentDate}</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 block mb-0.5">Time</span>
                      <span className="font-medium text-gray-900">{appointment.appointmentTime}</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 block mb-0.5">Type</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {appointment.consultationType === 'video' ? '📹 Video' : '🏥 In-Person'}
                      </span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-3">
                      <div className="text-xs uppercase tracking-wider text-blue-700 font-semibold mb-1">
                        Chief Complaint
                      </div>
                      <p className="text-sm text-gray-800">{appointment.reason}</p>
                    </div>
                  )}

                  {appointment.symptoms && appointment.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-xs uppercase tracking-wider text-gray-500">Symptoms:</span>
                      {appointment.symptoms.map((symptom, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-2">
                    Requested {new Date(appointment.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => openActionModal('approve', appointment._id)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center space-x-1.5"
                  >
                    <span>✓</span>
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => openActionModal('reject', appointment._id)}
                    className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium transition flex items-center space-x-1.5"
                  >
                    <span>✕</span>
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {actionModal.type === 'approve' ? '✓ Approve Appointment' : '✕ Reject Appointment'}
            </h3>

            {actionModal.type === 'approve' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  By approving this appointment, you confirm that the selected time slot will be reserved for this patient.
                  All other pending requests for this slot will be automatically rejected.
                </p>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800">
                  ℹ️ The patient will be notified of the confirmed appointment via email/SMS.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-3">
                  Please provide a reason for rejecting this appointment request:
                </p>
                <textarea
                  required
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Unable to accommodate at requested time, please reschedule"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeActionModal}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  actionModal.type === 'approve'
                    ? handleApprove(actionModal.appointmentId)
                    : handleReject(actionModal.appointmentId)
                }
                disabled={actionLoading || (actionModal.type === 'reject' && !rejectionReason.trim())}
                className={`px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50 ${
                  actionModal.type === 'approve'
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {actionLoading ? 'Processing...' : actionModal.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
