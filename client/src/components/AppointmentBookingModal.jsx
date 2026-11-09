import React, { useState } from 'react';
import { appointmentService } from '../services/appointmentService';

export default function AppointmentBookingModal({ slot, doctor, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [consultationType, setConsultationType] = useState('in-person');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const symptoms = symptomsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await appointmentService.requestAppointment({
        slotId: slot._id,
        reason,
        symptoms,
        consultationType,
      });

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit appointment request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          &times;
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xl">
            📅
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-sm text-gray-500">Dr. {doctor.name || doctor.fullName} • {doctor.specialty}</p>
          </div>
        </div>

        {/* Slot details card */}
        <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-4 mb-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-700 font-semibold block">Date</span>
              <span className="font-medium text-gray-900">{slot.date}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-700 font-semibold block">Time</span>
              <span className="font-medium text-gray-900">{slot.startTime} - {slot.endTime}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-700 font-semibold block">Consultation Fee</span>
              <span className="font-semibold text-teal-700">₹{doctor.consultationFee || 500}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-700 font-semibold block">Type</span>
              <span className="font-medium text-gray-900 capitalize">{slot.consultationType || 'In-person / Video'}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Consultation Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConsultationType('in-person')}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                  consultationType === 'in-person'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🏥 In-Person Visit
              </button>
              <button
                type="button"
                onClick={() => setConsultationType('video')}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                  consultationType === 'video'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                📹 Video Call
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Primary Concern / Reason for Visit *
            </label>
            <textarea
              required
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Persistent cough for 4 days, mild fever, chest congestion"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Symptoms (comma separated)
            </label>
            <input
              type="text"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g., Headache, Fever, Fatigue"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            ℹ️ Your appointment request will be sent to Dr. {doctor.name || doctor.fullName} for review. Once approved, you will receive confirmation.
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Confirm & Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
