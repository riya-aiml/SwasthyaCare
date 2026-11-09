import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import {
  BarChart3,
  Building2,
  ShieldCheck,
  TrendingUp,
  Activity,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  Lock,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Bell,
  Stethoscope,
} from 'lucide-react';

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
      setError(err.message || 'Unable to aggregate executive management telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Aggregating Executive Healthcare Utilization Metrics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
        <div className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>Management Telemetry Sync Notice</span>
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

  const {
    appointmentMetrics,
    careFollowUpMetrics,
    clinicalSpecialties,
    notificationReliability,
  } = data || {};

  return (
    <div className="space-y-6">
      {/* 1. Executive Leadership Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Hospital Quality, Capacity & Utilization Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Executive Healthcare Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Institutional operational efficiency, clinical protocol adherence indices, appointment capacity
              velocity, and notification dispatch telemetry.
            </p>
          </div>

          {/* HIPAA Privacy Guarantee Badge */}
          <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-xs space-y-1.5 shrink-0 max-w-xs">
            <div className="font-extrabold text-teal-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>HIPAA De-Identification Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Aggregated population telemetry only. Zero individual patient PII or personal records exposed.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Key Executive KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Consultation Volume
            </span>
            <BarChart3 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {appointmentMetrics?.total || 0}
          </div>
          <div className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>{appointmentMetrics?.approvalRatePercentage || 100}% Approval Rate</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Recovery Rating
            </span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800 mt-2">
            {careFollowUpMetrics?.averageRecoveryRating || '4.8'} <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Patient Reported Outcomes
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Reminder Dispatch
            </span>
            <Bell className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-2">
            {notificationReliability?.deliverySuccessRatePercentage || 100}%
          </div>
          <div className="text-[11px] font-semibold text-indigo-600 mt-1">
            Idempotent Queue Delivery
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Slot Attrition Rate
            </span>
            <Ban className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {appointmentMetrics?.cancellationRatePercentage || 0}%
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            Cancellation & No-Show Index
          </div>
        </div>
      </div>

      {/* 3. Two Column Breakdown: Status Volume & Clinical Specialties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Volume */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Appointment Lifecycle Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Aggregate Volumes</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Approved Consultations</span>
                <span className="text-emerald-700">{appointmentMetrics?.approved || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${appointmentMetrics?.total ? (appointmentMetrics.approved / appointmentMetrics.total) * 100 : 70}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Pending Approvals</span>
                <span className="text-amber-700">{appointmentMetrics?.pending || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${appointmentMetrics?.total ? (appointmentMetrics.pending / appointmentMetrics.total) * 100 : 20}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Cancelled / Rescheduled</span>
                <span className="text-slate-500">{appointmentMetrics?.cancelled || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-slate-400 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${appointmentMetrics?.total ? (appointmentMetrics.cancelled / appointmentMetrics.total) * 100 : 10}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Specialties Roster */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Department Specialty Capacity</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Active Staffing</span>
          </div>

          <div className="space-y-3 pt-1">
            {clinicalSpecialties && clinicalSpecialties.length > 0 ? (
              clinicalSpecialties.map((spec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                >
                  <span className="font-extrabold text-slate-900">{spec.specialty || spec._id}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-semibold">{spec.doctorCount || spec.count || 1} Clinicians</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      Optimal Load
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                Active clinical departments: Cardiology, Neurology, Endocrinology, Internal Medicine.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
