import React, { useState, useEffect } from 'react';
import { Clock, Ticket, Users, AlertCircle, RefreshCw, CheckCircle2, Navigation, User, FileText, Calendar } from 'lucide-react';
import { mockLiveQueueData, mockPatient } from '../data/mockData';

export default function QueueTracker({ onTabSwitch }) {
  const [activeSubTab, setActiveSubTab] = useState('queue');
  const [waitMins, setWaitMins] = useState(mockLiveQueueData.estimatedWaitMins);
  const [peopleAhead, setPeopleAhead] = useState(mockLiveQueueData.peopleAhead);
  const [queuePosition, setQueuePosition] = useState(mockLiveQueueData.queuePosition);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  // Real-time polling/simulation effect
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setWaitMins((prev) => (prev > 1 ? prev - 1 : 15));
      setPeopleAhead((prev) => {
        if (prev > 1) {
          const next = prev - 1;
          setQueuePosition(next + 1);
          return next;
        }
        return 11;
      });
    }, 8000); // Progresses every 8 seconds for demo

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  const progressPercent = Math.round(((32 - queuePosition) / 32) * 100);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Mobile-Inspired Frame Header */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        
        {/* Top Status Bar */}
        <div style={{ background: 'var(--primary-700)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
              Hospital OPD Live Tracker
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
              {mockLiveQueueData.department}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.78rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>LIVE SYNC</span>
          </div>
        </div>

        {/* Inner Content Body */}
        <div style={{ padding: '1.75rem' }}>
          {activeSubTab === 'queue' && (
            <div>
              {/* Unmissable Token Number Box */}
              <div className="token-box" style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>
                  Your Checked-In OPD Token Number
                </div>
                <div className="token-number">
                  {mockLiveQueueData.token}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Assigned Doctor: {mockLiveQueueData.doctor}
                </div>
              </div>

              {/* Estimated Wait & Position Summary */}
              <div className="grid-12" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="col-6" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Wait Time</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-600)', margin: '0.2rem 0' }}>
                    ~{waitMins} mins
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Subject to clinical urgency</div>
                </div>

                <div className="col-6" style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-100)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Queue Position</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--teal-600)', margin: '0.2rem 0' }}>
                    {queuePosition} <span style={{ fontSize: '1rem', fontWeight: 600 }}>of 32</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{peopleAhead} people ahead of you</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <span>Queue Progression</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div style={{ height: '10px', background: 'var(--border-color)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-500), var(--teal-500))', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {/* Gentle Instruction Notice */}
              <div style={{ background: '#fffbe6', border: '1px solid #fef3c7', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <AlertCircle size={22} color="#d97706" />
                <div style={{ fontSize: '0.88rem', color: '#92400e', fontWeight: 600 }}>
                  Please stay nearby Room 302 (West Wing) and check the screen for audio announcement updates.
                </div>
              </div>

              {/* Timeline Sequence */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem' }}>Live Calling Sequence</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {mockLiveQueueData.recentProgression.map((item) => (
                  <div 
                    key={item.token} 
                    style={{
                      background: item.isUser ? 'var(--primary-50)' : 'var(--bg-primary)',
                      border: item.isUser ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: item.isUser ? 'var(--primary-700)' : 'var(--text-main)' }}>
                        {item.token}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.status}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'appointments' && (
            <div style={{ padding: '1rem 0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>My Scheduled Visits</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Cardiology OPD Appointment with Dr. Amanda Vance — Tomorrow, Aug 14 at 10:30 AM.</p>
            </div>
          )}

          {activeSubTab === 'records' && (
            <div style={{ padding: '1rem 0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Attached Records</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Latest OCR Metabolic Panel attached to OPD Token A-047.</p>
            </div>
          )}

          {activeSubTab === 'profile' && (
            <div style={{ padding: '1rem 0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Patient Profile</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Sarah Jenkins • MRN-84920 • Age 58</p>
            </div>
          )}
        </div>

        {/* Bottom Sub-Navigation Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
          <button 
            style={{ padding: '0.85rem', border: 'none', background: activeSubTab === 'queue' ? 'var(--bg-surface)' : 'transparent', color: activeSubTab === 'queue' ? 'var(--primary-600)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('queue')}
          >
            <Clock size={18} /> Queue
          </button>
          <button 
            style={{ padding: '0.85rem', border: 'none', background: activeSubTab === 'appointments' ? 'var(--bg-surface)' : 'transparent', color: activeSubTab === 'appointments' ? 'var(--primary-600)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('appointments')}
          >
            <Calendar size={18} /> Appointments
          </button>
          <button 
            style={{ padding: '0.85rem', border: 'none', background: activeSubTab === 'records' ? 'var(--bg-surface)' : 'transparent', color: activeSubTab === 'records' ? 'var(--primary-600)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('records')}
          >
            <FileText size={18} /> Records
          </button>
          <button 
            style={{ padding: '0.85rem', border: 'none', background: activeSubTab === 'profile' ? 'var(--bg-surface)' : 'transparent', color: activeSubTab === 'profile' ? 'var(--primary-600)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('profile')}
          >
            <User size={18} /> Profile
          </button>
        </div>
      </div>
    </div>
  );
}
