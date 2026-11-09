import React, { useState, useEffect } from 'react';
import { followUpService } from '../services/followUpService';

export default function PatientFollowUpView() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Recovery form state
  const [recoveryRating, setRecoveryRating] = useState(4);
  const [painLevel, setPainLevel] = useState(2);
  const [mobilityScore, setMobilityScore] = useState('Normal');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [medicationAdherence, setMedicationAdherence] = useState('Full');
  const [adherenceNotes, setAdherenceNotes] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [hasWarningSymptoms, setHasWarningSymptoms] = useState(false);
  const [patientNotes, setPatientNotes] = useState('');
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
      setPlans(res.data.plans);
      if (res.data.plans.length > 0) {
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
      setUpdates(res.data.updates);
    } catch (err) {
      console.error('Failed to load plan details:', err);
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setSubmitting(true);
    try {
      const currentSymptoms = symptomsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const vitals = {};
      if (systolic) vitals.bloodPressureSystolic = Number(systolic);
      if (diastolic) vitals.bloodPressureDiastolic = Number(diastolic);
      if (heartRate) vitals.heartRate = Number(heartRate);
      if (temperature) vitals.temperatureCelsius = Number(temperature);

      await followUpService.submitRecoveryUpdate(selectedPlan._id, {
        recoveryRating: Number(recoveryRating),
        painLevel: Number(painLevel),
        mobilityScore,
        vitals,
        medicationAdherence,
        adherenceNotes,
        currentSymptoms,
        hasWarningSymptoms,
        patientNotes,
      });

      setSubmitSuccess(true);
      setShowUpdateModal(false);
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
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading follow-up care plans...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h4 className="font-bold">Error loading care plans</h4>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="text-6xl mb-3">🌿</div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">No Active Follow-Up Plans</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          When your clinician creates a post-discharge care or follow-up plan for you, it will appear here with instructions, medications, and recovery check-ins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🌿 Post-Discharge Care & Recovery</h2>
          <p className="text-xs text-gray-500">Track your healing progress and stay connected with your care team</p>
        </div>
        <button
          onClick={() => setShowUpdateModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center space-x-1.5"
        >
          <span>✍️</span>
          <span>Submit Today's Recovery Update</span>
        </button>
      </div>

      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center space-x-2">
          <span>✅</span>
          <span>Your recovery update has been sent to Dr. {selectedPlan.doctor.lastName}. Your care team will monitor your progress.</span>
        </div>
      )}

      {/* Plan selection tabs if multiple */}
      {plans.length > 1 && (
        <div className="flex space-x-2 border-b border-gray-200 pb-2">
          {plans.map((p) => (
            <button
              key={p._id}
              onClick={() => loadPlanDetails(p._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPlan?._id === p._id
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.diagnosis}
            </button>
          ))}
        </div>
      )}

      {selectedPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Plan Details & Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {selectedPlan.status} CARE PLAN
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">{selectedPlan.diagnosis}</h3>
                  <p className="text-xs text-gray-500">
                    Care Coordinator: Dr. {selectedPlan.doctor.firstName} {selectedPlan.doctor.lastName} • {selectedPlan.doctorProfile?.specialty || 'Physician'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Next Follow-Up Date</span>
                  <span className="text-sm font-bold text-teal-700">
                    {new Date(selectedPlan.followUpDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Discharge & Care Instructions
                </h4>
                <p className="text-sm text-gray-800 leading-relaxed">{selectedPlan.instructions}</p>
              </div>

              {/* Prescribed Medications */}
              {selectedPlan.medications && selectedPlan.medications.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Prescribed Medications ({selectedPlan.medications.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPlan.medications.map((med, idx) => (
                      <div key={idx} className="border border-gray-100 bg-teal-50/30 rounded-xl p-3">
                        <div className="font-semibold text-gray-900 text-sm">{med.name}</div>
                        <div className="text-xs text-teal-800 font-medium">{med.dosage} • {med.frequency}</div>
                        {med.specialInstructions && (
                          <div className="text-xs text-gray-500 mt-1">{med.specialInstructions}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Metrics */}
              {selectedPlan.targetMetrics && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Recovery Targets
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-lg">
                      <span className="text-gray-400 block">Target BP</span>
                      <span className="font-semibold text-gray-800">{selectedPlan.targetMetrics.bloodPressureTarget}</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg">
                      <span className="text-gray-400 block">Target Pulse</span>
                      <span className="font-semibold text-gray-800">{selectedPlan.targetMetrics.pulseRange}</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg">
                      <span className="text-gray-400 block">Target Glucose</span>
                      <span className="font-semibold text-gray-800">{selectedPlan.targetMetrics.bloodGlucoseTarget}</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg">
                      <span className="text-gray-400 block">Daily Activity</span>
                      <span className="font-semibold text-gray-800">{selectedPlan.targetMetrics.activityGoal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Symptoms */}
              {selectedPlan.warningSymptoms && selectedPlan.warningSymptoms.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-xs font-bold text-amber-900 mb-1 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>Warning Symptoms (Seek Immediate Care if Experienced)</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5">
                    {selectedPlan.warningSymptoms.map((ws, idx) => (
                      <li key={idx}>{ws}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Updates History */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Recovery Update Log ({updates.length})
              </h3>

              {updates.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No recovery updates submitted yet. Click "Submit Today's Recovery Update" above to record your first check-in!
                </p>
              ) : (
                <div className="space-y-4">
                  {updates.map((up) => (
                    <div key={up._id} className="border border-gray-200 rounded-xl p-4 hover:border-teal-200 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">
                            {new Date(up.reportedDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(up.reportedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                            Rating: {up.recoveryRating}/5
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
                            Pain: {up.painLevel}/10
                          </span>
                        </div>
                      </div>

                      {/* Vitals summary */}
                      {up.vitals && (up.vitals.bloodPressureSystolic || up.vitals.heartRate) && (
                        <div className="text-xs text-gray-600 mb-2 flex space-x-4 bg-gray-50 p-2 rounded-lg">
                          {up.vitals.bloodPressureSystolic && (
                            <span>BP: {up.vitals.bloodPressureSystolic}/{up.vitals.bloodPressureDiastolic} mmHg</span>
                          )}
                          {up.vitals.heartRate && <span>Pulse: {up.vitals.heartRate} bpm</span>}
                          {up.vitals.temperatureCelsius && <span>Temp: {up.vitals.temperatureCelsius} °C</span>}
                        </div>
                      )}

                      {up.patientNotes && (
                        <p className="text-xs text-gray-700 mb-2">"{up.patientNotes}"</p>
                      )}

                      {/* Clinician Review Banner */}
                      {up.clinicianReview?.isReviewed ? (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                          <div className="font-bold text-emerald-900 flex items-center space-x-1">
                            <span>👨‍⚕️</span>
                            <span>Clinician Feedback (Dr. {up.clinicianReview.reviewedBy?.lastName || 'Physician'}):</span>
                          </div>
                          <p className="text-emerald-800 mt-1">{up.clinicianReview.clinicianFeedback}</p>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-2">⏳ Pending clinician review</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Guidance & Emergency info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 rounded-2xl p-5">
              <div className="text-2xl mb-2">💡</div>
              <h4 className="font-bold text-teal-900 text-sm mb-1">Why Check-ins Matter</h4>
              <p className="text-xs text-teal-800 leading-relaxed">
                Submitting daily updates helps your clinical team catch complications early, calibrate medication doses, and ensure you recover smoothly without hospital readmission.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="text-2xl mb-2">🚨</div>
              <h4 className="font-bold text-red-900 text-sm mb-1">Emergency Protocols</h4>
              <p className="text-xs text-red-800 mb-2">
                If you experience sudden severe pain, difficulty breathing, or loss of consciousness, do not wait for a follow-up review.
              </p>
              <div className="font-bold text-red-700 text-sm">Call 108 / 112 Immediately</div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Daily Recovery Check-in</h3>
            <p className="text-xs text-gray-500 mb-4">Please share how you are feeling today with your care team.</p>

            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Overall Recovery Rating (1 = Poor, 5 = Excellent) *
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setRecoveryRating(val)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${
                        recoveryRating === val
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pain Level (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Medication Taken?</label>
                  <select
                    value={medicationAdherence}
                    onChange={(e) => setMedicationAdherence(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                  >
                    <option value="Full">Full (All doses taken)</option>
                    <option value="Partial">Partial (Missed 1 dose)</option>
                    <option value="None">None (Skipped today)</option>
                  </select>
                </div>
              </div>

              {/* Vitals */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Today's Vitals (Optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="BP Systolic"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="BP Diastolic"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Heart Rate (bpm)"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">How are you feeling? (Notes)</label>
                <textarea
                  rows="2"
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="e.g. Slept well, minimal discomfort, took morning walk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="warningCheck"
                  checked={hasWarningSymptoms}
                  onChange={(e) => setHasWarningSymptoms(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="warningCheck" className="text-xs font-semibold text-red-700">
                  I am experiencing warning symptoms (e.g. fever, breathing difficulty, chest pain)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
