import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export default function AdminDashboardView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getAdminDashboard();
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
        <p className="text-sm text-gray-500 font-medium">Loading platform administration overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-3">
        <div className="font-bold flex items-center space-x-2">
          <span>⚠️</span>
          <span>Failed to load admin dashboard</span>
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

  const { userDistribution, systemWorkload, doctorOnboardingQueue } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white rounded-2xl p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Platform Administration & Operations (Sprint 7: S7-03)
        </span>
        <h1 className="text-2xl font-bold mt-1">Platform Control & Verification Queue</h1>
        <p className="text-xs text-gray-300 mt-1 max-w-xl">
          System user accounts management, doctor credential verification, and live healthcare workload telemetry.
        </p>
      </div>

      {/* User Distribution Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Registered Accounts Breakdown ({userDistribution?.total || 0} Total)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Patients</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{userDistribution?.patients || 0}</div>
            <div className="text-[11px] text-teal-600 font-medium">Primary care users</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Doctors</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{userDistribution?.doctors || 0}</div>
            <div className="text-[11px] text-teal-600 font-medium">Verified clinicians</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Hospital Management</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{userDistribution?.hospital_management || 0}</div>
            <div className="text-[11px] text-indigo-600 font-medium">Aggregate analysts</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Platform Admins</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{userDistribution?.admins || 0}</div>
            <div className="text-[11px] text-gray-400 font-medium">Root operators</div>
          </div>
        </div>
      </div>

      {/* System Workload Telemetry */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Healthcare System Telemetry
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Total Appointments Booked</div>
            <div className="text-2xl font-bold text-teal-700 mt-1">{systemWorkload?.totalAppointments || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Total Care Follow-Up Plans</div>
            <div className="text-2xl font-bold text-teal-700 mt-1">{systemWorkload?.totalPlans || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Scheduled Notification Jobs</div>
            <div className="text-2xl font-bold text-teal-700 mt-1">{systemWorkload?.totalNotifications || 0}</div>
          </div>
        </div>
      </div>

      {/* Doctor Verification Queue */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Doctor Credentialing & Verification</h3>
            <p className="text-xs text-gray-500">Active medical profiles and credentials</p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded font-mono">
            {doctorOnboardingQueue?.length || 0} profiles
          </span>
        </div>

        {doctorOnboardingQueue && doctorOnboardingQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase border-b">
                <tr>
                  <th className="p-3">Doctor Name</th>
                  <th className="p-3">Specialty</th>
                  <th className="p-3">Hospital</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctorOnboardingQueue.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-semibold text-gray-900">{doc.fullName}</td>
                    <td className="p-3 text-gray-600">{doc.specialty}</td>
                    <td className="p-3 text-gray-600">{doc.hospital}</td>
                    <td className="p-3 text-gray-600">{doc.experienceYears} years</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {doc.isApproved ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-xs">
            No doctor profiles in the queue.
          </div>
        )}
      </div>
    </div>
  );
}
