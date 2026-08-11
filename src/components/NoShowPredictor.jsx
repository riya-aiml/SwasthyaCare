import React from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { mockNoShowPredictions } from '../data/mockData';

export default function NoShowPredictor() {
  return (
    <div className="grid-12">
      <div className="col-12 card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--primary-50)', color: 'var(--primary-500)', padding: '0.6rem', borderRadius: '12px' }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Appointment Cancellation & No-Show Predictive Model</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Flags appointments at risk of cancellation & auto-reallocates slots to priority high-risk patients</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mockNoShowPredictions.map(item => (
            <div key={item.appointmentId} style={{
              background: 'var(--bg-primary)',
              border: item.noShowProbability.includes('High') ? '1px solid #fecaca' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.patientName}</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>({item.slot})</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: item.noShowProbability.includes('High') ? '#dc2626' : '#16a34a', marginTop: '0.25rem' }}>
                  No-Show Probability: {item.noShowProbability}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Action Suggested: {item.actionSuggested}
                </div>
              </div>

              {item.noShowProbability.includes('High') ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => alert(`Slot ${item.slot} has been reallocated to Priority High-Risk Queue!`)}
                >
                  <span>Reallocate Slot to High-Risk Patient</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <span className="badge badge-routine">Confirmed Attending</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
