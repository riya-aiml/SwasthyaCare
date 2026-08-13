import React, { useState } from 'react';
import { X, Calendar, Clock, UserCheck, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { mockDoctors } from '../data/mockData';

export default function AppointmentBooking({ onClose, onConfirm }) {
  const [selectedDoctor, setSelectedDoctor] = useState(mockDoctors[0]);
  const [selectedSlot, setSelectedSlot] = useState(mockDoctors[0].availableSlots[0]);
  const [appointmentType, setAppointmentType] = useState('In-Person Priority Visit');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const newApt = {
      id: `apt-${Date.now()}`,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: "Tomorrow, Aug 14",
      time: selectedSlot,
      type: appointmentType,
      status: "Confirmed",
      isPriority: selectedSlot.includes('Priority'),
      avatar: selectedDoctor.avatar
    };

    onConfirm(newApt);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--primary-600)', fontWeight: 800 }}>
              OPD Appointment Reservation
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Book Appointment Slot</h3>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="var(--emerald-500)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-600)', marginBottom: '0.5rem' }}>
              Appointment Confirmed!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Reserved <strong>{selectedSlot}</strong> with <strong>{selectedDoctor.name}</strong>. Confirmation notification sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit}>
            {/* Priority Slot Banner */}
            <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={20} color="var(--primary-600)" />
              <div style={{ fontSize: '0.85rem', color: 'var(--primary-800)' }}>
                <strong>Priority Slots Unlocked:</strong> 15-20% of daily slots are reserved for High/Medium ML risk scores.
              </div>
            </div>

            {/* Select Doctor */}
            <div className="form-group">
              <label className="form-label">Select Specialist Doctor</label>
              <select 
                className="form-select"
                value={selectedDoctor.id}
                onChange={(e) => {
                  const doc = mockDoctors.find(d => d.id === e.target.value);
                  if (doc) {
                    setSelectedDoctor(doc);
                    setSelectedSlot(doc.availableSlots[0]);
                  }
                }}
              >
                {mockDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialty} — {doc.hospital})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Slot */}
            <div className="form-group">
              <label className="form-label">Available Time Slots</label>
              <div className="chip-group">
                {selectedDoctor.availableSlots.map(slot => {
                  const isPriority = slot.includes('Priority');
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      className={`chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                      style={{ border: isPriority ? '1px solid var(--primary-500)' : '1px solid var(--border-color)' }}
                    >
                      {isPriority && "⭐ "}
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Appointment Type */}
            <div className="form-group">
              <label className="form-label">Consultation Mode</label>
              <select 
                className="form-select"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
              >
                <option value="In-Person Priority Visit">In-Person Priority Clinic Visit</option>
                <option value="Tele-Consultation Video Call">Tele-Consultation Video Call</option>
              </select>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Confirm Appointment</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
