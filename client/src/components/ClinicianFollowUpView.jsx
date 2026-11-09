import React, { useState, useEffect } from 'react';
import { followUpService } from '../services/followUpService';

export default function ClinicianFollowUpView() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review state
  const [reviewModal, setReviewModal] = useState({ open: false, update: null });
  const [reviewStatus, setReviewStatus] = useState('STABLE');
  const [feedback, setFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Create plan modal state
  const [createModal, setCreateModal] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDays, setFollowUpDays] = useState(14);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await followUpService.getClinicianPlans();
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

  const handleReviewUpdate = async (e) => {
    e.preventDefault();
    if (!reviewModal.update) return;

    setReviewing(true);
    try {
      await followUpService.reviewRecoveryUpdate(reviewModal.update._id, {
        status: reviewStatus,
        clinicianFeedback: feedback,
        escalationRequired: reviewStatus === 'CRITICAL_URGENT',
      });
      setReviewModal({ open: false, update: null });
      setFeedback('');
      await loadPlanDetails(selectedPlan._id);
    } catch (err) {
      alert('Review failed: ' + err.message);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading follow-up management...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🌿 Post-Discharge Patient Care & Follow-Ups</h2>
          <p className="text-xs text-gray-500">Monitor recovery updates, triage symptoms, and provide clinician guidance</p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="text-6xl mb-3">🩺</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Active Follow-Up Plans</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            You do not currently have any active post-discharge care plans. When you create follow-up plans for patients, they will be tracked here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Care Plans */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">
              Active Patient Plans ({plans.length})
            </h3>
            {plans.map((p) => {
              const isSelected = selectedPlan?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => loadPlanDetails(p._id)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">
                      {p.patient.firstName} {p.patient.lastName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-teal-800 mb-1">{p.diagnosis}</div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Discharged: {new Date(p.dischargeDate).toLocaleDateString()}</span>
                    <span>Next: {new Date(p.followUpDate).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Plan Details & Recovery Updates */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPlan && (
              <>
                {/* Plan Header Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Patient: {selectedPlan.patient.firstName} {selectedPlan.patient.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedPlan.patient.email} {selectedPlan.patient.phoneNumber && `• 📞 ${selectedPlan.patient.phoneNumber}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Follow-up Date</span>
                      <span className="text-sm font-bold text-teal-700">
                        {new Date(selectedPlan.followUpDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Diagnosis & Care Protocol
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{selectedPlan.diagnosis}</p>
                    <p className="text-xs text-gray-700">{selectedPlan.instructions}</p>
                  </div>
                </div>

                {/* Patient Updates Log & Clinician Triage */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-gray-900">
                      Patient Recovery Updates ({updates.length})
                    </h4>
                    <span className="text-xs text-gray-400">Chronological Check-in Log</span>
                  </div>

                  {updates.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No recovery check-ins submitted by patient yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {updates.map((update) => {
                        const needsAttention = update.clinicianReview?.status === 'NEEDS_ATTENTION' || update.hasWarningSymptoms;
                        return (
                          <div
                            key={update._id}
                            className={`border rounded-xl p-4 transition ${
                              needsAttention
                                ? 'border-amber-300 bg-amber-50/30'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-gray-900">
                                  {new Date(update.reportedDate).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(update.reportedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {needsAttention && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center space-x-1">
                                    <span>⚠️</span>
                                    <span>Needs Review</span>
                                  </span>
                                )}
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                                  Rating: {update.recoveryRating}/5
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
                                  Pain: {update.painLevel}/10
                                </span>
                              </div>
                            </div>

                            {/* Vitals */}
                            {update.vitals && (update.vitals.bloodPressureSystolic || update.vitals.heartRate) && (
                              <div className="text-xs text-gray-700 mb-2 flex space-x-4 bg-gray-50 p-2 rounded-lg">
                                {update.vitals.bloodPressureSystolic && (
                                  <span>BP: {update.vitals.bloodPressureSystolic}/{update.vitals.bloodPressureDiastolic} mmHg</span>
                                )}
                                {update.vitals.heartRate && <span>Pulse: {update.vitals.heartRate} bpm</span>}
                                {update.vitals.temperatureCelsius && <span>Temp: {update.vitals.temperatureCelsius} °C</span>}
                              </div>
                            )}

                            {update.patientNotes && (
                              <p className="text-xs text-gray-800 mb-3 italic">
                                "{update.patientNotes}"
                              </p>
                            )}

                            {/* Review Section */}
                            {update.clinicianReview?.isReviewed ? (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                                <div className="font-bold text-emerald-900 flex items-center justify-between mb-1">
                                  <span>✓ Reviewed Status: {update.clinicianReview.status}</span>
                                  <span className="text-gray-400 font-normal">
                                    {new Date(update.clinicianReview.reviewedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-emerald-800">{update.clinicianReview.clinicianFeedback}</p>
                              </div>
                            ) : (
                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => {
                                    setReviewModal({ open: true, update });
                                    setReviewStatus(update.hasWarningSymptoms ? 'NEEDS_ATTENTION' : 'STABLE');
                                  }}
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                                >
                                  Review & Provide Feedback
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Clinician Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setReviewModal({ open: false, update: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Clinician Review</h3>
            <p className="text-xs text-gray-500 mb-4">Provide assessment and feedback for the patient's recovery update.</p>

            <form onSubmit={handleReviewUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Clinical Status Assessment *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('STABLE')}
                    className={`py-2 rounded-lg text-xs font-bold border transition ${
                      reviewStatus === 'STABLE'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Stable
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('NEEDS_ATTENTION')}
                    className={`py-2 rounded-lg text-xs font-bold border transition ${
                      reviewStatus === 'NEEDS_ATTENTION'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Attention
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('CRITICAL_URGENT')}
                    className={`py-2 rounded-lg text-xs font-bold border transition ${
                      reviewStatus === 'CRITICAL_URGENT'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Critical
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Clinician Feedback / Advice for Patient *
                </label>
                <textarea
                  required
                  rows="3"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Vitals are on track. Continue prescribed dose of Metoprolol. Keep resting."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal({ open: false, update: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing || !feedback.trim()}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {reviewing ? 'Submitting...' : 'Complete Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
