import React from 'react';
import { Ticket, Clock, Calendar, CheckCircle, FileText, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { mockPatient, mockLiveQueue } from '../data/mockData';

export default function OPDPortal({ onTabSwitch, onBookClick }) {
  return (
    <div className="grid-12">
      {/* Disclaimer Banner */}
      <div className="col-12 disclaimer-banner">
        <AlertCircle size={20} />
        <div>
          <strong>Clinical Decision Support System:</strong> AI predictions & triage outputs support clinician decisions and prioritize queue access. They do not replace professional medical judgment.
        </div>
      </div>

      {/* Main OPD Token & Live Queue Card */}
      <div className="col-8 card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Outpatient Department (OPD) Status</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NHS-inspired single consolidated home base for your hospital interactions</p>
          </div>
          <button className="btn btn-primary" onClick={() => onTabSwitch('queue')}>
            <Clock size={16} />
            <span>Open Real-Time Tracker</span>
          </button>
        </div>

        <div className="token-box" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>Your Active OPD Token</div>
          <div className="token-number">{mockPatient.currentToken}</div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{mockPatient.opdRoom}</div>
          <div style={{ display: 'inline-flex', gap: '1.5rem', marginTop: '1rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-pill)', fontSize: '0.88rem' }}>
            <span>Position in Line: <strong>{mockPatient.queuePosition} patients ahead</strong></span>
            <span>Est. Wait Time: <strong>~{mockPatient.estimatedWaitMins} mins</strong></span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Active Queue Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {mockLiveQueue.map((item) => (
            <div key={item.token} style={{
              background: item.isUser ? 'var(--primary-50)' : 'var(--bg-primary)',
              border: item.isUser ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: item.isUser ? 'var(--primary-600)' : 'var(--text-main)' }}>
                  {item.token}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.status}</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
                {item.timeRemaining}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Profile & Quick Actions Sidebar */}
      <div className="col-4 card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Patient Summary</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <img src={mockPatient.avatar} alt={mockPatient.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{mockPatient.name}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{mockPatient.age} yrs • {mockPatient.gender} ({mockPatient.bloodGroup})</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary-600)', fontWeight: 600 }}>Primary: {mockPatient.primaryDoctor}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>Chronic History & Allergies</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {mockPatient.medicalHistory.map(h => (
              <span key={h} className="badge badge-standard">{h}</span>
            ))}
            {mockPatient.allergies.map(a => (
              <span key={a} className="badge badge-emergency">Allergy: {a}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onTabSwitch('triage')}>
            <Activity size={16} />
            <span>Start Rule-Based Triage</span>
          </button>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onTabSwitch('ml-risk')}>
            <span>View ML Risk & Fairness</span>
            <ArrowRight size={16} />
          </button>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onTabSwitch('ocr-rag')}>
            <FileText size={16} />
            <span>Upload Records & Query RAG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
