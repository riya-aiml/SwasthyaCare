import React from 'react';
import { Calendar, Heart, Activity, ShieldCheck, Clock, ArrowRight, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { mockPatient, mockMLRiskResults } from '../data/mockData';

export default function PatientHome({ onTabSwitch, onBookClick }) {
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const nextApt = mockPatient.nextAppointment;

  return (
    <div className="grid-12" style={{ gap: '1.75rem' }}>
      {/* Security Banner */}
      <div className="col-12 disclaimer-banner">
        <ShieldCheck size={20} color="var(--primary-teal)" />
        <div style={{ flex: 1 }}>
          <strong>Your Health Information is Secure & Encrypted:</strong> Data processed under HIPAA/GDPR standards. AI risk predictions support clinician decisions and never replace professional medical diagnosis.
        </div>
      </div>

      {/* Warm Greeting Header */}
      <div className="col-12" style={{ marginBottom: '-0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="font-patient-heading" style={{ fontSize: '1.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              Good day, {mockPatient.name} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {todayStr} • Medical Record Number: <strong className="font-mono-num">{mockPatient.id}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => onTabSwitch('triage')}>
              <Activity size={16} />
              <span>Start Symptom Intake</span>
            </button>
            <button className="btn btn-primary" onClick={onBookClick}>
              <Calendar size={16} />
              <span>+ Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Signature Element: The Care Thread Journey Bar */}
      <div className="col-12 card" style={{ padding: '1rem 1.25rem', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>The Care Thread — Patient Journey Progress</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Step 3 of 4: Outpatient Consultation Pending</span>
        </div>
        <div className="care-thread-container">
          <div className="care-thread-bar" style={{ width: '72%' }} />
        </div>
      </div>

      {/* Three Primary Action Cards */}
      <div className="col-4">
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark))',
          color: 'white',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          border: 'none',
          boxShadow: '0 8px 24px rgba(46, 111, 114, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', width: '48px', height: '48px', borderRadius: 'var(--radius-patient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Calendar size={26} color="white" />
            </div>
            <h3 className="font-patient-heading" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
              Book Appointment
            </h3>
            <p style={{ fontSize: '0.88rem', opacity: 0.9, lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Schedule a visit with your primary doctor or reserve a 15–20% priority slot based on ML risk scoring.
            </p>
          </div>
          <button 
            className="btn btn-coral" 
            onClick={onBookClick}
            style={{ width: '100%' }}
          >
            <span>Book Priority Slot</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="col-4">
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ background: 'var(--primary-teal-light)', width: '48px', height: '48px', borderRadius: 'var(--radius-patient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <UserCheck size={26} color="var(--primary-teal)" />
            </div>
            <h3 className="font-patient-heading" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              My Appointments
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              View upcoming clinic visits, manage video tele-consultations, and track past medical history.
            </p>
            <div style={{ background: 'var(--bg-patient)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-patient)', fontSize: '0.85rem' }}>
              <strong>1 Active Booking:</strong> {nextApt.date} at <span className="font-mono-num">{nextApt.time}</span>
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => onTabSwitch('queue')}
            style={{ width: '100%', marginTop: '1.25rem' }}
          >
            <span>Track OPD & Appointments</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="col-4">
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ background: 'var(--accent-coral-light)', width: '48px', height: '48px', borderRadius: 'var(--radius-patient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Heart size={26} color="#E89274" />
            </div>
            <h3 className="font-patient-heading" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              View My Risk Score
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Check your personalized disease risk (<span className="font-mono-num">78%</span>) & 30-day readmission risk breakdown with plain-language explanations.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge badge-high">Disease: High (<span className="font-mono-num">{mockMLRiskResults.diseaseRisk.score}%</span>)</span>
              <span className="badge badge-medium">Readmission: Medium (<span className="font-mono-num">{mockMLRiskResults.readmissionRisk.score}%</span>)</span>
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => onTabSwitch('ml-risk')}
            style={{ width: '100%', marginTop: '1.25rem' }}
          >
            <span>View Detailed Risk Breakdown</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Next Appointment Summary Card */}
      <div className="col-8 card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-teal)', letterSpacing: '0.05em' }}>
              Upcoming Visit Summary
            </div>
            <h3 className="font-patient-heading" style={{ fontSize: '1.45rem', fontWeight: 700 }}>Next Scheduled Appointment</h3>
          </div>
          <span className="badge badge-low" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
            <CheckCircle2 size={15} /> {nextApt.status}
          </span>
        </div>

        <div style={{ background: 'var(--bg-patient)', padding: '1.25rem', borderRadius: 'var(--radius-patient)', border: '1px solid #E2E8E8', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Date & Time</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-charcoal)', marginTop: '2px' }}>{nextApt.date}</div>
              <div className="font-mono-num" style={{ fontSize: '0.9rem', color: 'var(--primary-teal)', fontWeight: 700 }}>{nextApt.time}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Doctor & Department</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-charcoal)', marginTop: '2px' }}>{nextApt.doctor}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{nextApt.department} Department</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Hospital Facility</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-charcoal)', marginTop: '2px' }}>{nextApt.hospital}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Main Campus • Outpatient Wing</div>
            </div>
          </div>
        </div>

        {/* Prep Instructions */}
        <div style={{ background: 'var(--primary-teal-light)', border: '1px solid rgba(46, 111, 114, 0.2)', borderRadius: 'var(--radius-patient)', padding: '1rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <AlertCircle size={22} color="var(--primary-teal)" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-teal-dark)' }}>Patient Prep Instructions:</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--primary-teal)' }}>{nextApt.prepInstructions}</div>
          </div>
        </div>
      </div>

      {/* Live OPD Token Mini View */}
      <div className="col-4 card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Hospital OPD Queue Status
          </div>
          <div className="token-box" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Active Token</div>
            <div className="token-number" style={{ fontSize: '2.6rem', margin: '0.2rem 0' }}>{mockPatient.currentToken}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{mockPatient.opdDepartment}</div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span>Position in queue:</span>
            <strong className="font-mono-num">{mockPatient.queuePosition} of {mockPatient.totalInQueue}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Est. Wait Time:</span>
            <strong className="font-mono-num" style={{ color: 'var(--primary-teal)' }}>~{mockPatient.estimatedWaitMins} minutes</strong>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => onTabSwitch('queue')}>
          <Clock size={16} />
          <span>Open Live Queue Tracker</span>
        </button>
      </div>
    </div>
  );
}
