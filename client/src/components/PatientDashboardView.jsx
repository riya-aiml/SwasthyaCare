import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export default function PatientDashboardView({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getPatientDashboard();
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

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
        <p className="text-sm text-gray-500 font-medium">Loading your personalized patient command center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-3">
        <div className="font-bold flex items-center space-x-2">
          <span>⚠️</span>
          <span>Failed to load patient dashboard</span>
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

  const { summary, nextAppointment, activeCarePlans, recentUpdates } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
              Personalized Health Command Center
            </span>
            <h1 className="text-2xl font-bold mt-1">Welcome back to SwasthyaCare</h1>
            <p className="text-xs text-teal-100 mt-1 max-w-xl">
              Track appointments, post-discharge care protocols, daily medication adherence, and evaluate clinical health risk models.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate && onNavigate('directory')}
              className="px-4 py-2 bg-white text-teal-800 rounded-xl text-xs font-bold hover:bg-teal-50 transition shadow-sm"
            >
              🔍 Book Doctor
            </button>
            <button
              onClick={() => onNavigate && onNavigate('risk-assessment')}
              className="px-4 py-2 bg-teal-800 text-white border border-teal-600 rounded-xl text-xs font-bold hover:bg-teal-700 transition"
            >
              🧠 AI Risk Check
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Upcoming Appts</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.upcomingAppointments || 0}</div>
          <div className="text-[11px] text-teal-600 mt-1 font-medium">Confirmed / Pending</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Active Care Plans</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.activeCarePlans || 0}</div>
          <div className="text-[11px] text-teal-600 mt-1 font-medium">Post-discharge care</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Recovery Updates</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.recentUpdatesSubmitted || 0}</div>
          <div className="text-[11px] text-teal-600 mt-1 font-medium">Check-ins submitted</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Total Lifetime Appts</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalAppointments || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium">Past & upcoming</div>
        </div>
      </div>

      {/* Next Upcoming Appointment Highlight */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
            <span>📅</span>
            <span>Next Scheduled Appointment</span>
          </h2>
          <button
            onClick={() => onNavigate && onNavigate('appointments')}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
          >
            View All Appts →
          </button>
        </div>

        {nextAppointment ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-teal-50/40 border border-teal-100 rounded-xl gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 text-sm">
                  {nextAppointment.doctorProfile?.fullName || `Dr. ${nextAppointment.doctor?.firstName} ${nextAppointment.doctor?.lastName}`}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  {nextAppointment.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {nextAppointment.doctorProfile?.specialty || 'General Practice'} • {nextAppointment.doctorProfile?.hospital || 'Hospital OPD'}
              </div>
              <div className="text-xs text-teal-700 font-semibold mt-2">
                🕒 {nextAppointment.appointmentDate} at {nextAppointment.appointmentTime} ({nextAppointment.consultationType})
              </div>
              {nextAppointment.reason && (
                <div className="text-xs text-gray-600 mt-1 italic">
                  Reason: "{nextAppointment.reason}"
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate && onNavigate('appointments')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-sm self-start md:self-auto"
            >
              Manage Appointment
            </button>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-xs">
            No upcoming appointments scheduled.{' '}
            <button
              onClick={() => onNavigate && onNavigate('directory')}
              className="text-teal-600 font-bold hover:underline"
            >
              Find a specialist and book a visit now.
            </button>
          </div>
        )}
      </div>

      {/* Two Column Layout: Active Care Plans & Recent Recovery Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Care Plans */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <span>🌿</span>
              <span>Active Follow-Up Care Plans</span>
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('followup')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
            >
              Open Follow-Ups →
            </button>
          </div>

          {activeCarePlans && activeCarePlans.length > 0 ? (
            <div className="space-y-3">
              {activeCarePlans.map((plan) => (
                <div key={plan._id} className="p-4 border border-gray-200 rounded-xl space-y-2 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{plan.diagnosis}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {plan.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Clinician: Dr. {plan.doctor?.firstName} {plan.doctor?.lastName}
                  </div>
                  {plan.medications && plan.medications.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 text-xs">
                      <span className="font-semibold text-gray-700 block mb-1">Medications:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.medications.map((m, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded text-[11px]">
                            {m.name} ({m.dosage} - {m.frequency})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              No active post-discharge plans found.
            </div>
          )}
        </div>

        {/* Recent Recovery Updates */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <span>📈</span>
              <span>Recent Health Check-ins</span>
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('followup')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
            >
              Submit Check-in →
            </button>
          </div>

          {recentUpdates && recentUpdates.length > 0 ? (
            <div className="space-y-3">
              {recentUpdates.map((u) => (
                <div key={u._id} className="p-3.5 border border-gray-200 rounded-xl space-y-1.5 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800">
                      Recovery Rating: {u.recoveryRating} / 5
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      u.hasWarningSymptoms ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {u.hasWarningSymptoms ? '⚠️ Warning Reported' : 'Normal'}
                    </span>
                  </div>
                  {u.vitals && (
                    <div className="text-[11px] text-gray-500">
                      BP: {u.vitals.bloodPressureSystolic || '--'}/{u.vitals.bloodPressureDiastolic || '--'} mmHg • HR: {u.vitals.heartRate || '--'} bpm
                    </div>
                  )}
                  <div className="text-[11px] text-gray-400">
                    Logged on {new Date(u.createdAt).toLocaleDateString()} • Adherence: {u.medicationAdherence}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              No recent recovery check-ins logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
