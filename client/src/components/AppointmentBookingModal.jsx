import React, { useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import {
  Calendar,
  Clock,
  Building2,
  Video,
  MapPin,
  AlertCircle,
  X,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

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
      setError(err.message || 'Failed to submit appointment request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Request Clinical Consultation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {doctor.fullName || doctor.name} • {doctor.specialty}
            </p>
          </div>
        </div>

        {/* Slot details card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Appointment Date
              </span>
              <span className="font-extrabold text-slate-900">{slot.date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Time Window
              </span>
              <span className="font-extrabold text-teal-800">
                {slot.startTime} - {slot.endTime}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Consultation Fee
              </span>
              <span className="font-extrabold text-slate-900">
                ₹{doctor.consultationFee || 1000}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Concurrency Protection
              </span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Atomic Lock (CAS)
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Consultation Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConsultationType('in-person')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  consultationType === 'in-person'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>In-Person Hospital Visit</span>
              </button>
              <button
                type="button"
                onClick={() => setConsultationType('video')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  consultationType === 'video'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Telehealth Video Call</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Clinical Reason / Symptoms Summary *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Follow-up for post-PCI medication titration and exertion dizziness assessment..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Specific Symptoms (comma separated)
            </label>
            <input
              type="text"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g., Shortness of breath, Palpitations, Fatigue"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{loading ? 'Reserving Slot...' : 'Confirm Appointment Request'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
