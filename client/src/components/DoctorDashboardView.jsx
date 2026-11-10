import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { appointmentService } from '../services/appointmentService';
import {
  Stethoscope,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Activity,
  FileText,
  Check,
  X,
  ArrowUpRight,
  ShieldAlert,
  User,
  Building2,
  RefreshCw,
  Video,
  MapPin,
  Brain,
} from 'lucide-react';

export default function DoctorDashboardView({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, appointmentId: null });
  const [rejectReason, setRejectReason] = useState('Schedule conflict');

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getDoctorDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Unable to load clinical workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApprove = async (appointmentId) => {
    setActionLoading(true);
    try {
      await appointmentService.approveAppointment(appointmentId);
      await loadDashboard();
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.appointmentId) return;
    setActionLoading(true);
    try {
      await appointmentService.rejectAppointment(rejectModal.appointmentId, rejectReason);
      setRejectModal({ open: false, appointmentId: null });
      await loadDashboard();
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading Clinician Workspace & EHR Queue...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
        <div className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>Clinical Dashboard Notice</span>
        </div>
        <p className="text-xs">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, pendingRequests, todayAppointments, flaggedUpdates } = data || {};

  return (
    <div className="space-y-6">
      {/* 1. Clinician Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-4 h-4" />
              <span>Clinician Command Center & EHR Triage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Physician Workbench
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Review and triage patient consultation queues, approve slot reservations with atomic locking,
              monitor post-discharge warning alerts, and inspect vitals telemetry.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('availability')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Configure Slots</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('followup')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 rounded-xl text-xs font-bold transition"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Post-Discharge Plans</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('risk-assessment')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 rounded-xl text-xs font-bold transition"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>AI Decision Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Clinical Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Requests
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {summary?.pendingRequests || 0}
          </div>
          <div className="text-[11px] font-semibold text-amber-700 mt-1">
            Awaiting Clinical Review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today's Visits
            </span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800 mt-2">
            {summary?.todayAppointments || 0}
          </div>
          <div className="text-[11px] font-semibold text-teal-700 mt-1">
            Confirmed Consultations
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Monitored Patients
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {summary?.activeCarePlans || 0}
          </div>
          <div className="text-[11px] font-semibold text-indigo-700 mt-1">
            Active Care Plans
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Triage Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {summary?.alertsNeedingAttention || 0}
          </div>
          <div className="text-[11px] font-semibold text-rose-700 mt-1">
            Immediate Attention Needed
          </div>
        </div>
      </div>

      {/* 3. Critical Post-Discharge Triage Alerts (If Any) */}
      {flaggedUpdates && flaggedUpdates.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Post-Discharge Triage: Flagged Patient Symptoms ({flaggedUpdates.length})</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('followup')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
            >
              <span>Manage Care Plans</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flaggedUpdates.map((u) => (
              <div key={u._id} className="p-4 bg-white border border-rose-200 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">
                    {u.patient?.firstName} {u.patient?.lastName}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Warning Symptoms
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Diagnosis: <span className="font-semibold text-slate-900">{u.plan?.diagnosis}</span>
                </div>
                {u.notes && (
                  <div className="text-xs text-rose-900 bg-rose-50 p-2.5 rounded-xl border border-rose-100 italic">
                    "{u.notes}"
                  </div>
                )}
                {u.vitalSigns && (
                  <div className="text-[11px] text-slate-500 font-medium">
                    BP: {u.vitalSigns.systolicBp}/{u.vitalSigns.diastolicBp} mmHg • Pulse: {u.vitalSigns.heartRate} bpm
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Incoming Appointment Requests Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Incoming Consultation Requests ({pendingRequests?.length || 0})
            </h3>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('queue')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
          >
            <span>Full Queue Workbench</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingRequests && pendingRequests.length > 0 ? (
          <div className="space-y-3">
            {pendingRequests.map((apt) => (
              <div
                key={apt._id}
                className="p-5 border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                    {apt.patient?.firstName?.[0] || 'P'}{apt.patient?.lastName?.[0] || 'T'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {apt.patient?.firstName} {apt.patient?.lastName}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {apt.consultationType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Scheduled: <span className="font-bold text-slate-800">{apt.appointmentDate} at {apt.appointmentTime}</span>
                    </div>
                    {apt.reason && (
                      <div className="text-xs text-slate-600 mt-1 italic">
                        "{apt.reason}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => handleApprove(apt._id)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setRejectModal({ open: true, appointmentId: apt._id })}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs">
            No pending appointment requests in queue. All consultations have been triaged!
          </div>
        )}
      </div>

      {/* Reject Reason Confirmation Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Decline Consultation Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please state the clinical or scheduling reason. The patient will be notified immediately.
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 mb-4"
            >
              <option value="Schedule conflict">Schedule conflict / Emergency surgery</option>
              <option value="Out of specialty scope">Referral needed (Out of specialty scope)</option>
              <option value="Incomplete medical records">Incomplete medical diagnostic history</option>
              <option value="Patient requested reschedule">Patient requested reschedule</option>
            </select>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRejectModal({ open: false, appointmentId: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
