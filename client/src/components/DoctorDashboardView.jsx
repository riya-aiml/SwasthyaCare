import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { appointmentService } from '../services/appointmentService';

export default function DoctorDashboardView({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getDoctorDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message);
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

  const handleReject = async (appointmentId) => {
    const reason = prompt('Please enter reason for rejection:') || 'Schedule conflict';
    setActionLoading(true);
    try {
      await appointmentService.rejectAppointment(appointmentId, reason);
      await loadDashboard();
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
        <p className="text-sm text-gray-500 font-medium">Loading clinical command center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-3">
        <div className="font-bold flex items-center space-x-2">
          <span>⚠️</span>
          <span>Failed to load doctor dashboard</span>
        </div>
        <p className="text-xs">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, pendingRequests, todayAppointments, flaggedUpdates } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Clinician Workspace & Triage
            </span>
            <h1 className="text-2xl font-bold mt-1">Doctor Command Center</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Monitor patient queue, incoming appointment requests, triage post-discharge warning alerts, and review recovery vitals.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate && onNavigate('availability')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              📅 Set Schedule
            </button>
            <button
              onClick={() => onNavigate && onNavigate('followup')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              🌿 Care Plans
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Pending Requests</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{summary?.pendingRequests || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Awaiting approval</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Today's Visits</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">{summary?.todayAppointments || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Confirmed consultations</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Active Care Plans</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.activeCarePlans || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Patients monitored</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Triage Alerts</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{summary?.alertsNeedingAttention || 0}</div>
          <div className="text-[11px] text-rose-600 mt-1 font-semibold">Immediate attention</div>
        </div>
      </div>

      {/* Critical Triage Escalation Section */}
      {flaggedUpdates && flaggedUpdates.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-rose-200 pb-2">
            <h3 className="font-bold text-rose-900 text-sm flex items-center space-x-2">
              <span>🚨</span>
              <span>Post-Discharge Triage: Patients Needing Attention ({flaggedUpdates.length})</span>
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('followup')}
              className="text-xs text-rose-700 hover:text-rose-800 font-bold"
            >
              Review All in Care Plans →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flaggedUpdates.map((u) => (
              <div key={u._id} className="p-3 bg-white border border-rose-200 rounded-xl space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">
                    {u.patient?.firstName} {u.patient?.lastName}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    Warning Symptoms Reported
                  </span>
                </div>
                <div className="text-[11px] text-gray-600">
                  Diagnosis: <span className="font-medium text-gray-900">{u.plan?.diagnosis}</span>
                </div>
                {u.symptomsNotes && (
                  <div className="text-xs text-rose-900 bg-rose-50/70 p-2 rounded border border-rose-100 font-medium">
                    "{u.symptomsNotes}"
                  </div>
                )}
                {u.vitals && (
                  <div className="text-[11px] text-gray-500">
                    BP: {u.vitals.bloodPressureSystolic || '--'}/{u.vitals.bloodPressureDiastolic || '--'} mmHg • Pulse: {u.vitals.heartRate || '--'} bpm
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Today's Schedule & Pending Request Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <span>📋</span>
              <span>Today's Consultation Schedule</span>
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('appointments')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
            >
              All Appts →
            </button>
          </div>

          {todayAppointments && todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <div key={appt._id} className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900">
                      {appt.patient?.firstName} {appt.patient?.lastName}
                    </div>
                    <div className="text-xs text-teal-700 font-semibold mt-0.5">
                      🕒 {appt.appointmentTime} ({appt.consultationType})
                    </div>
                    {appt.reason && (
                      <div className="text-[11px] text-gray-500 italic mt-0.5">
                        "{appt.reason}"
                      </div>
                    )}
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    CONFIRMED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              No appointments scheduled for today.
            </div>
          )}
        </div>

        {/* Pending Requests Queue */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <span>⏳</span>
              <span>Pending Requests Queue ({pendingRequests?.length || 0})</span>
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('queue')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
            >
              Full Queue →
            </button>
          </div>

          {pendingRequests && pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req._id} className="p-3.5 border border-amber-200 bg-amber-50/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">
                      {req.patient?.firstName} {req.patient?.lastName}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600">
                      {req.appointmentDate} at {req.appointmentTime}
                    </span>
                  </div>
                  {req.reason && (
                    <div className="text-xs text-gray-600">
                      Reason: <span className="italic">{req.reason}</span>
                    </div>
                  )}
                  <div className="flex space-x-2 pt-2 border-t border-amber-100">
                    <button
                      onClick={() => handleApprove(req._id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-semibold transition disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              No pending appointment requests in your queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
