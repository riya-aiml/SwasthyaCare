import React, { useState } from 'react';
import { Pill, CheckCircle2, Clock, Bell } from 'lucide-react';
import { mockMedications } from '../data/mockData';

export default function MedicationReminder() {
  const [meds, setMeds] = useState(mockMedications);

  const toggleMed = (id) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="card" style={{ gridColumn: 'span 4' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Pill size={20} color="#34d399" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today's Dosage Schedule</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 600 }}>2 Items</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {meds.map((med) => (
          <div key={med.id} style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${med.taken ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}>
            <div>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: 700, 
                textDecoration: med.taken ? 'line-through' : 'none',
                color: med.taken ? 'var(--text-subtle)' : 'var(--text-main)'
              }}>
                {med.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {med.dosage}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-500)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={12} />
                <span>Scheduled: {med.time}</span>
              </div>
            </div>

            <button 
              className={`btn ${med.taken ? 'btn-secondary' : 'btn-primary'}`}
              style={{ 
                padding: '0.4rem 0.65rem', 
                fontSize: '0.75rem',
                background: med.taken ? 'rgba(16, 185, 129, 0.15)' : undefined,
                color: med.taken ? '#34d399' : undefined
              }}
              onClick={() => toggleMed(med.id)}
            >
              <CheckCircle2 size={14} />
              <span>{med.taken ? 'Taken' : 'Mark Taken'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
