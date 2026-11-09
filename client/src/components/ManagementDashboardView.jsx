import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export default function ManagementDashboardView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getManagementDashboard();
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
        <p className="text-sm text-gray-500 font-medium">Aggregating hospital analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-3">
        <div className="font-bold flex items-center space-x-2">
          <span>⚠️</span>
          <span>Failed to load management analytics</span>
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

  const {
    appointmentMetrics,
    careFollowUpMetrics,
    clinicalSpecialties,
    notificationReliability,
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Executive Healthcare Analytics (Sprint 7: S7-04)
            </span>
            <h1 className="text-2xl font-bold mt-1">Hospital Quality & Utilization Dashboard</h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              High-level operational performance, clinical adherence rates, and service efficiency.
            </p>
          </div>
          {/* Privacy Badge */}
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs space-y-1 self-start md:self-auto">
            <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
              <span>🔒</span>
              <span>HIPAA Privacy Guard Active</span>
            </div>
            <div className="text-[11px] text-emerald-200">
              Aggregated population telemetry only. Zero individual patient PII exposed.
            </div>
          </div>
        </div>
      </div>

      {/* KPI Highlight Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Total Appointments</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{appointmentMetrics?.total || 0}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {appointmentMetrics?.approvalRatePercentage}% approval rate
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Avg Recovery Rating</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">
            {careFollowUpMetrics?.averageRecoveryRating || 0} / 5.0
          </div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Patient reported outcome</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Reminder Delivery Rate</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {notificationReliability?.deliverySuccessRatePercentage}%
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {notificationReliability?.delivered || 0} delivered
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Cancellation Rate</div>
          <div className="text-2xl font-bold text-gray-700 mt-1">
            {appointmentMetrics?.cancellationRatePercentage}%
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Slot attrition rate</div>
        </div>
      </div>

      {/* Two Column Layout: Appointment Status Breakdown & Medication Adherence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b pb-3 flex items-center space-x-2">
            <span>📊</span>
            <span>Appointment Utilization Volume</span>
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700">Approved Appointments</span>
                <span className="font-bold text-emerald-700">{appointmentMetrics?.approved || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full"
                  style={{
                    width: `${appointmentMetrics?.total ? (appointmentMetrics.approved / appointmentMetrics.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700">Pending Requests</span>
                <span className="font-bold text-amber-600">{appointmentMetrics?.pending || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{
                    width: `${appointmentMetrics?.total ? (appointmentMetrics.pending / appointmentMetrics.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700">Cancelled / Declined</span>
                <span className="font-bold text-rose-600">
                  {(appointmentMetrics?.rejected || 0) + (appointmentMetrics?.cancelled || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-rose-500 h-2.5 rounded-full"
                  style={{
                    width: `${appointmentMetrics?.total ? (((appointmentMetrics.rejected || 0) + (appointmentMetrics.cancelled || 0)) / appointmentMetrics.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Medication Adherence Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b pb-3 flex items-center space-x-2">
            <span>💊</span>
            <span>Follow-Up Medication Adherence</span>
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-xl font-bold text-emerald-800">
                {careFollowUpMetrics?.medicationAdherenceDistribution?.full || 0}
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">Full Adherence</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-xl font-bold text-amber-800">
                {careFollowUpMetrics?.medicationAdherenceDistribution?.partial || 0}
              </div>
              <div className="text-xs text-amber-700 font-semibold mt-1">Partial Adherence</div>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="text-xl font-bold text-rose-800">
                {careFollowUpMetrics?.medicationAdherenceDistribution?.missedOrNone || 0}
              </div>
              <div className="text-xs text-rose-700 font-semibold mt-1">Missed / None</div>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2">
            Total recovery updates logged: <span className="font-bold text-gray-800">{careFollowUpMetrics?.totalUpdatesLogged || 0}</span> check-ins
          </div>
        </div>
      </div>

      {/* Clinical Specialties Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-sm border-b pb-3 flex items-center space-x-2">
          <span>🩺</span>
          <span>Departmental Specialty Distribution</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {clinicalSpecialties && clinicalSpecialties.length > 0 ? (
            clinicalSpecialties.map((spec, idx) => (
              <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="text-xs font-semibold text-gray-600">{spec.specialty}</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{spec.count} Doctors</div>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400 col-span-4 text-center py-4">
              No specialty distribution data recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
