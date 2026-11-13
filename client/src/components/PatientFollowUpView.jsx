import React, { useState, useEffect } from 'react';
import { followUpService } from '../services/followUpService';
import {
  HeartPulse,
  Activity,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pill,
  FileText,
  PhoneCall,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  Send,
  X,
  AlertCircle
} from 'lucide-react';

export default function PatientFollowUpView() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('checkins'); // 'checkins' | 'medicines' | 'emergency'

  // Recovery form state
  const [recoveryRating, setRecoveryRating] = useState(4);
  const [painLevel, setPainLevel] = useState(2);
  const [mobilityScore, setMobilityScore] = useState('Normal');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [medicationAdherence, setMedicationAdherence] = useState('Full');
  const [patientNotes, setPatientNotes] = useState('');
  const [hasWarningSymptoms, setHasWarningSymptoms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await followUpService.getMyPlans();
      setPlans(res.data.plans || []);
      if (res.data.plans?.length > 0) {
        loadPlanDetails(res.data.plans[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanDetails = async (planId) => {
    try {
      const res = await followUpService.getPlanById(planId);
      setSelectedPlan(res.data.plan);
      setUpdates(res.data.updates || []);
    } catch (err) {
      console.error('Failed to load plan details:', err);
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setSubmitting(true);
    try {
      const vitals = {};
      if (systolic) vitals.bloodPressureSystolic = Number(systolic);
      if (diastolic) vitals.bloodPressureDiastolic = Number(diastolic);
      if (heartRate) vitals.heartRate = Number(heartRate);
      if (temperature) vitals.temperatureCelsius = Number(temperature);
      if (oxygenSaturation) vitals.oxygenSaturation = Number(oxygenSaturation);

      await followUpService.submitRecoveryUpdate(selectedPlan._id, {
        recoveryRating: Number(recoveryRating),
        painLevel: Number(painLevel),
        mobilityScore,
        vitals,
        medicationAdherence,
        patientNotes,
        hasWarningSymptoms,
      });

      setSubmitSuccess(true);
      setShowUpdateModal(false);
      // Reset form
      setPatientNotes('');
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setTemperature('');
      setOxygenSaturation('');
      await loadPlanDetails(selectedPlan._id);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      alert('Error submitting update: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold">Loading your recovery care plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200">
        <h4 className="font-bold">Error loading recovery plan</h4>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-2xl mx-auto p-8">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
          🌱
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Active Recovery Plans</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          When your doctor discharges you or prescribes a home recovery protocol, your personalized daily schedule, medications, and health check-ins will appear here.
        </p>
      </div>
    );
  }

  const latestUpdate = updates[0];
  const healthIndex = latestUpdate?.aiRiskAssessment?.healthIndex ?? selectedPlan?.latestHealthIndex ?? 92;
  const isCritical = latestUpdate?.aiRiskAssessment?.riskTier === 'CRITICAL_ATTENTION';
  const isModerate = latestUpdate?.aiRiskAssessment?.riskTier === 'MODERATE_RISK';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. TOP HERO CARD: Friendly, Simple Recovery Status */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xs transition-all ${
        isCritical
          ? 'bg-gradient-to-r from-rose-50 via-white to-rose-50/50 border-rose-200'
          : isModerate
          ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-amber-200'
          : 'bg-gradient-to-r from-teal-50 via-white to-emerald-50/40 border-teal-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCritical
                  ? 'bg-rose-100 text-rose-800'
                  : isModerate
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isCritical ? '⚠️ Clinician Review Flagged' : isModerate ? '🟡 Moderate Attention' : '🟢 Recovery On Track'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Dr. {selectedPlan?.doctor?.firstName} {selectedPlan?.doctor?.lastName} ({selectedPlan?.diagnosis})
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isCritical ? 'Attention Needed on Your Recovery' : isModerate ? 'Healing Well, Take Regular Rest' : 'You are Healing Well!'}
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              {latestUpdate?.aiRiskAssessment?.patientGuidance ||
                'Your care team is monitoring your progress. Record your check-in each day to keep your doctor updated.'}
            </p>
          </div>

          <div className="flex flex-col sm:items-end w-full sm:w-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Health Score</span>
                <span className={`text-3xl font-black ${
                  isCritical ? 'text-rose-600' : isModerate ? 'text-amber-600' : 'text-teal-700'
                }`}>
                  {healthIndex}<span className="text-sm font-semibold text-slate-400">/100</span>
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
                isCritical ? 'bg-rose-100 text-rose-700' : isModerate ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
              }`}>
                {isCritical ? '⚠️' : isModerate ? '🙂' : '🌟'}
              </div>
            </div>

            <button
              onClick={() => setShowUpdateModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-extrabold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Submit Today's Check-in</span>
            </button>
          </div>
        </div>

        {submitSuccess && (
          <div className="mt-4 p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Check-in saved! Your doctor has received your update and the AI health engine has analyzed your metrics.</span>
          </div>
        )}
      </div>

      {/* 2. SIMPLE THREE-TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('checkins')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'checkins'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Daily Check-in History ({updates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'medicines'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>My Medicines & Care Instructions</span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'emergency'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Clinic & Emergency Help</span>
        </button>
      </div>

      {/* 3. TAB 1: DAILY CHECK-INS TIMELINE */}
      {activeTab === 'checkins' && (
        <div className="space-y-4">
          {updates.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center">
              <p className="text-slate-500 text-sm">No check-ins recorded yet.</p>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="mt-3 px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-bold transition"
              >
                + Record Your First Check-in Today
              </button>
            </div>
          ) : (
            updates.map((up) => {
              const upScore = up.aiRiskAssessment?.healthIndex ?? 90;
              const upTier = up.aiRiskAssessment?.riskTier ?? 'STABLE';
              const isUpCrit = upTier === 'CRITICAL_ATTENTION';
              return (
                <div
                  key={up._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-200 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {new Date(up.reportedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(up.reportedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isUpCrit
                          ? 'bg-rose-100 text-rose-800'
                          : upTier === 'MODERATE_RISK'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Score: {upScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">How you felt</span>
                      <span className="font-bold text-slate-800">Rating: {up.recoveryRating}/5</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">Pain Level</span>
                      <span className="font-bold text-slate-800">{up.painLevel}/10</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">Medicines</span>
                      <span className="font-bold text-slate-800">{up.medicationAdherence} Taken</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">Mobility</span>
                      <span className="font-bold text-slate-800">{up.mobilityScore}</span>
                    </div>
                  </div>

                  {/* Vitals row if present */}
                  {up.vitals && (up.vitals.bloodPressureSystolic || up.vitals.heartRate || up.vitals.oxygenSaturation) && (
                    <div className="flex items-center gap-3 text-xs text-slate-600 bg-teal-50/40 p-2.5 rounded-xl border border-teal-100/60">
                      <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                      {up.vitals.bloodPressureSystolic && (
                        <span>BP: <b>{up.vitals.bloodPressureSystolic}/{up.vitals.bloodPressureDiastolic || 80}</b> mmHg</span>
                      )}
                      {up.vitals.heartRate && <span>Pulse: <b>{up.vitals.heartRate}</b> bpm</span>}
                      {up.vitals.temperatureCelsius && <span>Temp: <b>{up.vitals.temperatureCelsius}</b> °C</span>}
                      {up.vitals.oxygenSaturation && <span>SpO2: <b>{up.vitals.oxygenSaturation}%</b></span>}
                    </div>
                  )}

                  {/* Notes */}
                  {up.patientNotes && (
                    <p className="text-xs text-slate-700 italic bg-slate-50/60 p-2.5 rounded-xl">
                      "{up.patientNotes}"
                    </p>
                  )}

                  {/* Doctor Feedback */}
                  {up.clinicianReview?.isReviewed ? (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Doctor's Feedback:</span>
                      </div>
                      <p className="text-emerald-800">{up.clinicianReview.clinicianFeedback}</p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Pending doctor review</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. TAB 2: MEDICINES & INSTRUCTIONS */}
      {activeTab === 'medicines' && selectedPlan && (
        <div className="space-y-6">
          {/* Instructions card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Doctor's Care Instructions</span>
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {selectedPlan.instructions}
            </p>
            <div className="text-xs text-slate-500 flex items-center justify-between pt-2">
              <span>Discharge Date: <b>{new Date(selectedPlan.dischargeDate).toLocaleDateString()}</b></span>
              <span>Next Clinic Visit: <b className="text-teal-700">{new Date(selectedPlan.followUpDate).toLocaleDateString()}</b></span>
            </div>
          </div>

          {/* Medicines card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Prescribed Medicines ({selectedPlan.medications?.length || 0})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedPlan.medications?.map((med, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="font-extrabold text-sm text-slate-900">{med.name}</div>
                  <div className="text-xs font-semibold text-teal-700">{med.dosage} • {med.frequency}</div>
                  {med.specialInstructions && (
                    <div className="text-[11px] text-slate-500 pt-1">{med.specialInstructions}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: CLINIC & EMERGENCY */}
      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center text-xl font-bold">
              🚨
            </div>
            <h3 className="text-lg font-black text-rose-950">Immediate Medical Emergency</h3>
            <p className="text-xs text-rose-800 leading-relaxed">
              If you experience sudden severe chest pain, extreme breathlessness, heavy bleeding, or loss of consciousness, do not wait for a digital reply. Call national emergency services immediately:
            </p>
            <div className="flex gap-2 pt-2">
              <a
                href="tel:108"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 108 (Ambulance)</span>
              </a>
              <a
                href="tel:112"
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Call 112</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center text-xl font-bold">
              🏥
            </div>
            <h3 className="text-lg font-black text-slate-900">Hospital Contact & Helpdesk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For general questions regarding your care plan or upcoming appointment date:
            </p>
            <div className="text-xs space-y-1 text-slate-700 bg-slate-50 p-3 rounded-xl">
              <div>Care Coordinator: <b>Dr. {selectedPlan?.doctor?.firstName} {selectedPlan?.doctor?.lastName}</b></div>
              <div>Hospital OPD Desk: <b>+91 (011) 2658-8500</b></div>
              <div>Consultation Date: <b>{new Date(selectedPlan?.followUpDate).toLocaleDateString()}</b></div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SIMPLE, FRIENDLY CHECK-IN MODAL */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in fade-in duration-200">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Daily Health Check-in</span>
              <h3 className="text-xl font-black text-slate-900">How are you feeling today?</h3>
              <p className="text-xs text-slate-500">Takes less than 1 minute. Keeps your doctor informed.</p>
            </div>

            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              {/* Step 1: Overall feeling with Emoji */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  1. Overall feeling today
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, label: 'Poor', emoji: '😞' },
                    { val: 2, label: 'Fair', emoji: '😐' },
                    { val: 3, label: 'Okay', emoji: '🙂' },
                    { val: 4, label: 'Good', emoji: '😃' },
                    { val: 5, label: 'Great', emoji: '🌟' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => setRecoveryRating(item.val)}
                      className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                        recoveryRating === item.val
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[11px] font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Pain Level chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
                  <span>2. Pain level (0 to 10)</span>
                  <span className="text-teal-700 font-extrabold">Current: {painLevel}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                  <span>0 (No Pain)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>

              {/* Step 3: Medication taken */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. Did you take your medicines today?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'Full', label: '✅ All taken' },
                    { val: 'Partial', label: '⚠️ Missed 1' },
                    { val: 'None', label: '❌ Did not take' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.val}
                      onClick={() => setMedicationAdherence(m.val)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                        medicationAdherence === m.val
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Simple Vitals (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  4. Quick Vitals <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder="BP Sys (120)"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600 text-center"
                  />
                  <input
                    type="number"
                    placeholder="BP Dia (80)"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600 text-center"
                  />
                  <input
                    type="number"
                    placeholder="Pulse (72)"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600 text-center"
                  />
                  <input
                    type="number"
                    placeholder="SpO2 % (98)"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600 text-center"
                  />
                </div>
              </div>

              {/* Step 5: Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. Anything else you'd like to share?
                </label>
                <textarea
                  rows="2"
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="e.g., Feeling much better today, went for a short stroll."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600"
                />
              </div>

              {/* Warning symptoms check */}
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center gap-2">
                <input
                  type="checkbox"
                  id="warningCheck"
                  checked={hasWarningSymptoms}
                  onChange={(e) => setHasWarningSymptoms(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="warningCheck" className="text-xs font-semibold text-rose-900 cursor-pointer">
                  I have urgent warning signs (e.g. high fever, severe wound pain, breathing issues)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending to Doctor...' : 'Submit Check-in'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
