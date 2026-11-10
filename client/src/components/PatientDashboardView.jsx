import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import {
  Calendar,
  ClipboardList,
  Activity,
  HeartPulse,
  Brain,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Stethoscope,
  Pill,
  ShieldCheck,
  RefreshCw,
  Building2,
  Video,
  MapPin,
} from 'lucide-react';

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
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Aggregating Patient EHR Command Center...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
        <div className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>Patient Dashboard Sync Notice</span>
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

  const { summary, nextAppointment, activeCarePlans, recentUpdates } = data || {};

  return (
    <div className="space-y-6">
      {/* 1. Executive Patient Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <HeartPulse className="w-4 h-4" />
              <span>Personalized Health Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Patient Clinical Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring of scheduled consultations, post-discharge medication adherence,
              daily recovery triage, and institutional statistical risk models.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('directory')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Schedule Visit</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('risk-assessment')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <Brain className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Risk Engines</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Medical Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Upcoming Visits
            </span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {summary?.upcomingAppointments || 0}
          </div>
          <div className="text-[11px] font-semibold text-teal-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            <span>Confirmed & Pending</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Care Protocols
            </span>
            <ClipboardList className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {summary?.activeCarePlans || 0}
          </div>
          <div className="text-[11px] font-semibold text-indigo-700 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span>Active Post-Discharge</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Recovery Check-Ins
            </span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {summary?.recentUpdatesSubmitted || 0}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Logged & Evaluated</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lifetime Consults
            </span>
            <HeartPulse className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {summary?.totalAppointments || 0}
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            Historical Records
          </div>
        </div>
      </div>

      {/* 3. Next Upcoming Appointment Highlight */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h2 className="font-extrabold text-slate-900 text-sm">
              Next Scheduled Consultation
            </h2>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('appointments')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
          >
            <span>Consultation Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {nextAppointment ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gradient-to-r from-teal-50/60 to-slate-50 border border-teal-100 rounded-2xl gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0">
                {nextAppointment.doctorProfile?.fullName
                  ? nextAppointment.doctorProfile.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')
                  : 'DR'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {nextAppointment.doctorProfile?.fullName || 'Specialist Clinician'}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {nextAppointment.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{nextAppointment.doctorProfile?.specialty || 'Cardiology'}</span>
                  <span>•</span>
                  <span>{nextAppointment.doctorProfile?.hospital || 'Apex Hospital'}</span>
                </div>
                <div className="text-xs text-teal-800 font-bold mt-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    {nextAppointment.appointmentDate} at {nextAppointment.appointmentTime}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="capitalize">{nextAppointment.consultationType} visit</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('appointments')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm self-start md:self-auto shrink-0"
            >
              View Consultation Details
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No upcoming appointments scheduled.{' '}
            <button
              onClick={() => onNavigate && onNavigate('directory')}
              className="text-teal-700 font-bold hover:underline"
            >
              Find a specialist and book a consultation now.
            </button>
          </div>
        )}
      </div>

      {/* 4. AI Clinical Risk Assessment Quick Access Banner (Sprint 7: ML-S7-01) */}
      <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-indigo-50 border border-teal-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">AI Clinical Risk Screening & History (ML-DIA-01 & ML-CVD-01)</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Access calibrated non-diagnostic clinical decision support, inspect risk indicators, and review your confidential assessment history.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('risk-assessment')}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0 shadow-sm"
        >
          <span>Open Risk Assessments</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Two Column Layout: Active Care Plans & Recent Recovery Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Care Plans */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-600" />
              <span>Post-Discharge Care Protocols</span>
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('followup')}
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-0.5"
            >
              <span>Care Portal</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {activeCarePlans && activeCarePlans.length > 0 ? (
            <div className="space-y-3">
              {activeCarePlans.map((plan) => (
                <div key={plan._id} className="p-4 border border-slate-200 rounded-xl space-y-2.5 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{plan.diagnosis}</span>
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {plan.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Treating Clinician: Dr. {plan.doctor?.firstName} {plan.doctor?.lastName}
                  </div>
                  {plan.medications && plan.medications.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-teal-600" />
                        Prescribed Medication Regimen:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.medications.map((m, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-[11px] font-medium shadow-xs">
                            {m.name} ({m.dosage} • {m.frequency})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No active post-discharge care protocols on record.
            </div>
          )}
        </div>

        {/* Recent Recovery Updates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Recent Health Check-in Telemetry</span>
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('followup')}
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-0.5"
            >
              <span>Submit Check-in</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {recentUpdates && recentUpdates.length > 0 ? (
            <div className="space-y-3">
              {recentUpdates.map((u) => (
                <div key={u._id} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Recovery Rating: {u.recoveryRating || u.painScore ? `Pain ${u.painScore}/10` : 'Normal'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        u.hasWarningSymptoms
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {u.hasWarningSymptoms ? 'Warning Reported' : 'Within Normal Range'}
                    </span>
                  </div>
                  {u.vitals && (
                    <div className="text-xs text-slate-600">
                      BP: {u.vitals.bloodPressureSystolic || u.vitals.systolicBp || '--'}/
                      {u.vitals.bloodPressureDiastolic || u.vitals.diastolicBp || '--'} mmHg • Pulse:{' '}
                      {u.vitals.heartRate || '--'} bpm
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Recorded {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent recovery check-ins logged.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
