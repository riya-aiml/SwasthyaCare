import React, { useState } from 'react';
import { X, Calendar, Clock, Video, User, CheckCircle2 } from 'lucide-react';
import { mockDoctors } from '../data/mockData';

export default function AppointmentBooking({ onClose, onConfirm }) {
  const [selectedDoctor, setSelectedDoctor] = useState(mockDoctors[0]);
  const [date, setDate] = useState('2026-08-13');
  const [selectedSlot, setSelectedSlot] = useState(mockDoctors[0].availableSlots[0]);
  const [type, setType] = useState('Tele-Consultation');
  const [reason, setReason] = useState('Routine Heart Health Checkup & Prescription Renewal');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onConfirm({
        id: `apt-${Date.now()}`,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: 'Thursday, Aug 13',
        time: selectedSlot,
        type,
        status: 'Confirmed',
        avatar: selectedDoctor.avatar
      });
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Book Doctor Appointment</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Select doctor, time slot & consultation type</p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#34d399' }}>Appointment Confirmed!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Your consultation with <strong>{selectedDoctor.name}</strong> is scheduled for <strong>{date} at {selectedSlot}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Specialist</label>
              <select 
                className="form-select"
                value={selectedDoctor.id}
                onChange={(e) => {
                  const doc = mockDoctors.find(d => d.id === e.target.value);
                  setSelectedDoctor(doc);
                  setSelectedSlot(doc.availableSlots[0]);
                }}
              >
                {mockDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty} ({doc.fee})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Consultation Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Mode</label>
                <select 
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Tele-Consultation">📹 Video Tele-Consultation</option>
                  <option value="In-Person Clinic Visit">🏥 In-Person Hospital Visit</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Available Time Slots</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedDoctor.availableSlots.map(slot => (
                  <button
                    type="button"
                    key={slot}
                    className={`btn ${selectedSlot === slot ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <Clock size={14} />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Visit / Symptoms</label>
              <textarea 
                className="form-textarea" 
                rows="2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms..."
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm & Pay ({selectedDoctor.fee})
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
