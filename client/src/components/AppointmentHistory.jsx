import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';

export default function AppointmentHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null });
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filter === 'upcoming' ? { upcoming: 'true' } : {};
      const result = await appointmentService.getMyAppointments(params);
      setAppointments(result.data.appointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    setActionLoading(true);
    try {
      await appointmentService.cancelAppointment(appointmentId, cancellationReason);
      await loadAppointments();
      setCancelModal({ open: false, appointmentId: null });
      setCancellationReason('');
    } catch (err) {
      alert('Failed to cancel: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳', label: 'Pending Review' },
      APPROVED: { bg: 'bg-teal-100', text: 'text-teal-700', icon: '✓', label: 'Confirmed' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: '✕', label: 'Rejected' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⊘', label: 'Cancelled' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '✔', label: 'Completed' },
      NO_SHOW: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⚠', label: 'No Show' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} inline-flex items-center space-x-1`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    const aptDate = new Date(apt.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (filter === 'upcoming') {
      return aptDate >= today && ['PENDING', 'APPROVED'].includes(apt.status);
    }
    if (filter === 'past') {
      return aptDate < today || ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'].includes(apt.status);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">⚠️</span>
          <span className="font-semibold">Error Loading Appointments</span>
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadAppointments}
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
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
            📋
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">My Appointments</h3>
            <p className="text-xs text-gray-500">View your upcoming and past appointments</p>
          </div>
        </div>
        <button
          onClick={loadAppointments}
          className="px-3 py-1.5 text-sm text-teal-700 hover:bg-teal-50 rounded-lg transition flex items-center space-x-1"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({appointments.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'upcoming'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'past'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Past
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-6xl mb-3">📭</div>
          <h4 className="text-lg font-semibold text-gray-700 mb-1">No Appointments</h4>
          <p className="text-sm text-gray-500">
            {filter === 'upcoming' && "You don't have any upcoming appointments."}
            {filter === 'past' && "You don't have any past appointments."}
            {filter === 'all' && "You haven't booked any appointments yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => {
            const isPatientView = user.role === 'patient';
            const displayPerson = isPatientView ? appointment.doctorProfile : appointment.patient;
            const canCancel = ['PENDING', 'APPROVED'].includes(appointment.status);

            return (
              <div
                key={appointment._id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {isPatientView ? '👨‍⚕️' : displayPerson.firstName[0] + displayPerson.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {isPatientView ? displayPerson.fullName : `${displayPerson.firstName} ${displayPerson.lastName}`}
                      </h4>
                      {isPatientView && displayPerson.specialty && (
                        <p className="text-xs text-gray-500">{displayPerson.specialty} • {displayPerson.hospital}</p>
                      )}
                      {!isPatientView && (
                        <p className="text-xs text-gray-500">{displayPerson.email}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
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
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-1">
                      Reason for Visit
                    </div>
                    <p className="text-sm text-gray-800">{appointment.reason}</p>
                  </div>
                )}

                {appointment.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <div className="text-xs uppercase tracking-wider text-red-700 font-semibold mb-1">
                      Rejection Reason
                    </div>
                    <p className="text-sm text-red-800">{appointment.rejectionReason}</p>
                  </div>
                )}

                {appointment.cancellationReason && (
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-3">
                    <div className="text-xs uppercase tracking-wider text-gray-700 font-semibold mb-1">
                      Cancellation Reason
                    </div>
                    <p className="text-sm text-gray-800">{appointment.cancellationReason}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  <span>Booked {new Date(appointment.createdAt).toLocaleDateString()}</span>
                  {canCancel && (
                    <button
                      onClick={() => setCancelModal({ open: true, appointmentId: appointment._id })}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-medium"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⊘ Cancel Appointment</h3>
            <p className="text-sm text-gray-600 mb-3">
              Please provide a reason for cancelling this appointment:
            </p>
            <textarea
              required
              rows="4"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Personal emergency, need to reschedule"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mt-3">
              ℹ️ The doctor will be notified of the cancellation. The slot will be released for other patients.
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setCancelModal({ open: false, appointmentId: null });
                  setCancellationReason('');
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleCancelAppointment(cancelModal.appointmentId)}
                disabled={actionLoading || !cancellationReason.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
