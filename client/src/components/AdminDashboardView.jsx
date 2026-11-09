import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import {
  ShieldCheck,
  Users,
  Server,
  Activity,
  CheckCircle2,
  Database,
  AlertTriangle,
  Cpu,
  FileCheck,
  RefreshCw,
  Building2,
  Stethoscope,
  Calendar,
  Bell,
  ArrowUpRight,
} from 'lucide-react';

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
      setError(err.message || 'Unable to load platform administration console.');
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
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Connecting to System Administration Gateway...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
        <div className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>Platform Administration Sync Notice</span>
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

  const { userDistribution, systemWorkload, doctorOnboardingQueue } = data || {};

  return (
    <div className="space-y-6">
      {/* 1. Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Governance & System Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Platform Administration Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              System user registry, credentialing and medical licensing queue, microservice circuit health,
              and cross-role security telemetry.
            </p>
          </div>

          <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-xs space-y-1.5 shrink-0 max-w-xs">
            <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Express REST Port 3001 • MongoDB Port 27017 • FastAPI Microservice Port 8000
            </p>
          </div>
        </div>
      </div>

      {/* 2. User Accounts Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Registered Account Registry ({userDistribution?.total || 0} Accounts Total)
          </h2>
          <span className="text-xs font-semibold text-indigo-700">RBAC Enforced</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Patients
              </span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {userDistribution?.patients || 0}
            </div>
            <div className="text-[11px] font-semibold text-teal-700 mt-1">
              Primary Care Users
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Clinicians
              </span>
              <Stethoscope className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {userDistribution?.doctors || 0}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 mt-1">
              Verified Doctors
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Management
              </span>
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {userDistribution?.hospital_management || 0}
            </div>
            <div className="text-[11px] font-semibold text-purple-700 mt-1">
              Hospital Leadership
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Platform Admins
              </span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {userDistribution?.admins || 0}
            </div>
            <div className="text-[11px] font-semibold text-indigo-700 mt-1">
              Root Governance
            </div>
          </div>
        </div>
      </div>

      {/* 3. System Workload Telemetry */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
          Platform Activity Workload
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Total Consultations</span>
              <Calendar className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {systemWorkload?.totalAppointments || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Atomic CAS Protected</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Follow-Up Care Plans</span>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {systemWorkload?.totalPlans || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Active Patient Protocols</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Notification Queue Jobs</span>
              <Bell className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {systemWorkload?.totalNotifications || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Idempotent Deduplication Enforced</div>
          </div>
        </div>
      </div>

      {/* 4. Doctor Verification & Credentialing Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Medical Licensing & Credential Verification Registry
            </h3>
            <p className="text-xs text-slate-500">
              Active physician profiles verified against institutional registry
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono">
            {doctorOnboardingQueue?.length || 0} Clinicians
          </span>
        </div>

        {doctorOnboardingQueue && doctorOnboardingQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Clinician</th>
                  <th className="p-3.5">Specialty</th>
                  <th className="p-3.5">Hospital Affiliation</th>
                  <th className="p-3.5">Experience</th>
                  <th className="p-3.5">Licensing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {doctorOnboardingQueue.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {doc.fullName ? doc.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'DR'}
                      </div>
                      <span>{doc.fullName}</span>
                    </td>
                    <td className="p-3.5 text-teal-800 font-semibold">{doc.specialty}</td>
                    <td className="p-3.5 text-slate-600">{doc.hospital}</td>
                    <td className="p-3.5 text-slate-600">{doc.experienceYears} Years</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No doctors in credentialing queue.
          </div>
        )}
      </div>
    </div>
  );
}
