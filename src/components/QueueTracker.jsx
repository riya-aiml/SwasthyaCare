import React, { useState, useEffect } from 'react';
import { Clock, Ticket, Users, AlertCircle, Calendar, FileText, User } from 'lucide-react';
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
    }, 7000);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  const progressPercent = Math.round(((32 - queuePosition) / 32) * 100);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Mobile-Inspired Frame Header */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid #E2E8E8', borderRadius: 'var(--radius-patient)', boxShadow: 'var(--shadow-patient)', overflow: 'hidden' }}>
        
        {/* Top Status Bar */}
        <div style={{ background: 'var(--primary-teal-dark)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
              Hospital OPD Live Tracker
            </div>
            <h2 className="font-patient-heading" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>
              {mockLiveQueueData.department}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.78rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--risk-low)', display: 'inline-block' }} />
            <span>LIVE SYNC</span>
          </div>
        </div>

        {/* Inner Content Body */}
        <div style={{ padding: '1.75rem' }}>
          {activeSubTab === 'queue' && (
            <div>
              {/* Unmissable Token Number Box */}
              <div className="token-box" style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>
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
                <div className="col-6" style={{ background: 'var(--primary-teal-light)', border: '1px solid rgba(46, 111, 114, 0.2)', padding: '1.25rem', borderRadius: 'var(--radius-patient)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Wait Time</div>
                  <div className="font-mono-num" style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--primary-teal)', margin: '0.2rem 0' }}>
                    ~{waitMins} mins
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Subject to clinical triage priority</div>
                </div>

                <div className="col-6" style={{ background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)', padding: '1.25rem', borderRadius: 'var(--radius-patient)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Queue Position</div>
                  <div className="font-mono-num" style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--risk-low)', margin: '0.2rem 0' }}>
                    {queuePosition} <span style={{ fontSize: '1rem', fontWeight: 600 }}>of 32</span>
                  </div>
                  <div className="font-mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{peopleAhead} people ahead of you</div>
                </div>
              </div>

              {/* Care Thread Progress Arc/Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--primary-teal)' }}>The Care Thread — OPD Queue Progression</span>
                  <span className="font-mono-num">{progressPercent}% Complete</span>
                </div>
                <div className="care-thread-container">
                  <div className="care-thread-bar" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Gentle Instruction Notice */}
              <div style={{ background: 'var(--risk-medium-bg)', border: '1px solid var(--risk-medium-border)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-patient)', display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <AlertCircle size={22} color="var(--risk-medium)" />
                <div style={{ fontSize: '0.88rem', color: '#8A5E14', fontWeight: 600 }}>
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
                      background: item.isUser ? 'var(--primary-teal-light)' : 'var(--bg-patient)',
                      border: item.isUser ? '2px solid var(--primary-teal)' : '1px solid #E2E8E8',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-patient)',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="font-mono-num" style={{ fontWeight: 800, fontSize: '1rem', color: item.isUser ? 'var(--primary-teal-dark)' : 'var(--text-charcoal)' }}>
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
              <h3 className="font-patient-heading" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>My Scheduled Visits</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Cardiology OPD Appointment with Dr. Amanda Vance — Tomorrow, Aug 14 at 10:30 AM.</p>
            </div>
          )}

          {activeSubTab === 'records' && (
            <div style={{ padding: '1rem 0' }}>
              <h3 className="font-patient-heading" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Attached Records</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Latest OCR Metabolic Panel attached to OPD Token A-047.</p>
            </div>
          )}

          {activeSubTab === 'profile' && (
            <div style={{ padding: '1rem 0' }}>
              <h3 className="font-patient-heading" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Patient Profile</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Sarah Jenkins • MRN-84920 • Age 58</p>
            </div>
          )}
        </div>

        {/* Bottom Sub-Navigation Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #E2E8E8', background: 'var(--bg-patient)' }}>
          <button 
            style={{ padding: '0.85rem', border: 'none', background: activeSubTab === 'queue' ? 'var(--bg-surface)' : 'transparent', color: activeSubTab === 'queue' ? 'var(--primary-teal)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('queue')}
          >
            <Clock size={18} /> Queue
          </button>
          <button 
            style={{ padding: '0.85rem', border: 'none', background: activeSubTab === 'appointments' ? 'var(--bg-surface)' : 'transparent', color: activeSubTab === 'appointments' ? 'var(--primary-teal)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('appointments')}
          >
            <Calendar size={18} /> Appointments
          </button>
          <button 
            style={{ padding: '0.85rem', border: 'none', background: activeSubTab === 'records' ? 'var(--bg-surface)' : 'transparent', color: activeSubTab === 'records' ? 'var(--primary-teal)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('records')}
          >
            <FileText size={18} /> Records
          </button>
          <button 
            style={{ padding: '0.85rem', border: 'none', background: activeSubTab === 'profile' ? 'var(--bg-surface)' : 'transparent', color: activeSubTab === 'profile' ? 'var(--primary-teal)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('profile')}
          >
            <User size={18} /> Profile
          </button>
        </div>
      </div>
    </div>
  );
}
