import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Video,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Ban,
  RefreshCw,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function AppointmentHistory({ onNavigateToDirectory }) {
  const { user, login } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null });
  const [cancellationReason, setCancellationReason] = useState('Schedule conflict');
  const [customReason, setCustomReason] = useState('');
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
      setAppointments(result.data?.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError(err.message || 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginAsPatient = async () => {
    try {
      setLoading(true);
      await login('patient@swasthya.com', 'Password123');
      await loadAppointments();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    const reasonToSend = cancellationReason === 'Other' ? customReason.trim() : cancellationReason;
    if (!reasonToSend) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    setActionLoading(true);
    try {
      await appointmentService.cancelAppointment(cancelModal.appointmentId, reasonToSend);
      await loadAppointments();
      setCancelModal({ open: false, appointmentId: null });
      setCancellationReason('Schedule conflict');
      setCustomReason('');
    } catch (err) {
      alert('Failed to cancel appointment: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            Completed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            <Ban className="w-3.5 h-3.5 text-slate-400" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(apt.appointmentDate);

    let matchesFilter = true;
    if (filter === 'upcoming') {
      matchesFilter = aptDate >= today && ['PENDING', 'APPROVED'].includes(apt.status);
    } else if (filter === 'past') {
      matchesFilter = aptDate < today || ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'].includes(apt.status);
    }

    if (!matchesFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const doctorName = (apt.doctorProfile?.fullName || '').toLowerCase();
      const specialty = (apt.doctorProfile?.specialty || '').toLowerCase();
      const reason = (apt.reason || '').toLowerCase();
      return doctorName.includes(q) || specialty.includes(q) || reason.includes(q);
    }

    return true;
  });

  const upcomingCount = appointments.filter((a) => {
    const d = new Date(a.appointmentDate);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d >= t && ['PENDING', 'APPROVED'].includes(a.status);
  }).length;

  const pastCount = appointments.filter((a) => {
    const d = new Date(a.appointmentDate);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t || ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'].includes(a.status);
  }).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Clinical Consultations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment Ledger & History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage scheduled consultations, telehealth video visits, and historical EHR records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAppointments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {onNavigateToDirectory && (
            <button
              onClick={onNavigateToDirectory}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Book New Appointment
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
        {/* Segmented Filter Pills */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 shadow-inner">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Consultations ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'upcoming'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'past'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past & Completed ({pastCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor, specialty, note..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Authentication / Access Denied Auto-Recovery State */}
      {error && (error.toLowerCase().includes('token') || error.toLowerCase().includes('access denied')) && (
        <div className="p-6 my-6 bg-gradient-to-r from-teal-50 via-slate-50 to-amber-50 border border-teal-200 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Authentication Token Sync Required
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your session is ready to load live patient records. Click below to securely connect as verified demo patient Aarav Sharma.
                </p>
              </div>
            </div>
            <button
              onClick={handleQuickLoginAsPatient}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Connect as Demo Patient
            </button>
          </div>
        </div>
      )}

      {/* Generic Error Banner */}
      {error && !error.toLowerCase().includes('token') && !error.toLowerCase().includes('access denied') && (
        <div className="p-4 my-6 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadAppointments}
            className="px-3 py-1 bg-white border border-rose-300 rounded-md font-semibold text-rose-700 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl animate-pulse flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
              <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-teal-600 mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Consultations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            {searchQuery
              ? `No appointments match "${searchQuery}". Try a different keyword.`
              : filter === 'upcoming'
              ? 'You have no upcoming consultations scheduled.'
              : 'You have not booked any appointments yet.'}
          </p>
          {onNavigateToDirectory && (
            <button
              onClick={onNavigateToDirectory}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              Explore Verified Specialists
            </button>
          )}
        </div>
      ) : (
        /* Appointment Cards Grid */
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const doc = apt.doctorProfile || {};
            const isVideo = apt.consultationType === 'video';
            const isCanCancel = ['PENDING', 'APPROVED'].includes(apt.status);

            return (
              <div
                key={apt._id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Doctor Info & Schedule */}
                  <div className="flex items-start gap-4">
                    {/* Doctor Avatar / Initials */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0">
                      {doc.fullName ? doc.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'DR'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900">
                          {doc.fullName || 'Specialist Clinician'}
                        </h3>
                        {doc.specialty && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                            {doc.specialty}
                          </span>
                        )}
                        {getStatusBadge(apt.status)}
                      </div>

                      {/* Hospital & Affiliation */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {doc.hospital || 'Apex Multispecialty Hospital'}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                          {isVideo ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-teal-600" />
                              Telehealth Video Call
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              In-Person Hospital Visit
                            </>
                          )}
                        </span>
                      </div>

                      {/* Reason / Symptoms */}
                      {apt.reason && (
                        <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700">
                          <span className="font-semibold text-slate-900">Clinical Focus: </span>
                          {apt.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date, Time, and Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="text-sm font-extrabold text-slate-900 flex items-center lg:justify-end gap-1.5">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        {new Date(apt.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 flex items-center lg:justify-end gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {apt.appointmentTime} (30 mins)
                      </div>
                    </div>

                    {isCanCancel && (
                      <button
                        onClick={() => setCancelModal({ open: true, appointmentId: apt._id })}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      >
                        Cancel Consultation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modern Cancel Confirmation Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Appointment</h3>
                <p className="text-xs text-slate-500">
                  Are you sure? This time slot will be reopened for other patients.
                </p>
              </div>
            </div>

            <div className="space-y-3 my-4">
              <label className="text-xs font-bold text-slate-700 block">Reason for Cancellation</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Symptoms resolved">Symptoms resolved / Feeling better</option>
                <option value="Need different specialist">Need a different specialist</option>
                <option value="Emergency hospitalization">Emergency hospitalization</option>
                <option value="Other">Other reason...</option>
              </select>

              {cancellationReason === 'Other' && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify clinical or personal reason..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setCancelModal({ open: false, appointmentId: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
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
