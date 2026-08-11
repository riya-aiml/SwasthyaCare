import React from 'react';
import { Ticket, MapPin, Navigation, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { mockPatient, mockLiveQueue, mockHospitalWayfinding } from '../data/mockData';

export default function QueueTracker() {
  return (
    <div className="grid-12">
      {/* Real-Time Live Token & Wait Time Header */}
      <div className="col-8 card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Real-Time OPD Queue Status</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live token updates broadcasted directly to your mobile device</p>
          </div>
          <span className="badge badge-standard" style={{ fontSize: '0.85rem' }}>● WebSocket Live Feed</span>
        </div>

        <div className="token-box" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your OPD Token</div>
          <div className="token-number">{mockPatient.currentToken}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Assigned: Dr. Ananya Sharma (Room 104)</div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>
            Current Status: <strong>3 Patients Ahead</strong> • Est. Wait Time: <strong>~14 Mins</strong>
          </div>
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Hospital Live OPD Queue Stream</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mockLiveQueue.map((item) => (
            <div key={item.token} style={{
              background: item.isUser ? 'var(--primary-50)' : 'var(--bg-primary)',
              border: item.isUser ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: item.isUser ? 'var(--primary-600)' : 'var(--text-main)',
                  width: '90px'
                }}>
                  {item.token}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.status}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Specialist: {item.doctor}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                  {item.timeRemaining}
                </div>
                <span className={`badge ${item.isUser ? 'badge-emergency' : 'badge-standard'}`} style={{ fontSize: '0.72rem' }}>
                  {item.isUser ? 'Your Turn Next' : 'Queued'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital Indoor Way-Finding Map */}
      <div className="col-4 card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Navigation size={22} color="var(--primary-500)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Hospital Way-Finding</h3>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Step-by-step indoor navigation to your assigned consultation desk & lab.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mockHospitalWayfinding.map((way) => (
            <div key={way.step} style={{
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'flex-start',
              position: 'relative'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: way.time === 'Current' ? 'var(--primary-500)' : 'var(--bg-primary)',
                color: way.time === 'Current' ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
                flexShrink: 0
              }}>
                {way.step}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{way.location}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{way.instruction}</div>
              </div>

              <span className={`badge ${way.time === 'Current' ? 'badge-emergency' : 'badge-standard'}`} style={{ fontSize: '0.7rem' }}>
                {way.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
