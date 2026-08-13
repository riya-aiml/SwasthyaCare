import React from 'react';
import { Calendar, Heart, Activity, ShieldCheck, Clock, ArrowRight, UserCheck, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { mockPatient, mockMLRiskResults } from '../data/mockData';

export default function PatientHome({ onTabSwitch, onBookClick }) {
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const nextApt = mockPatient.nextAppointment;

  return (
    <div className="grid-12" style={{ gap: '1.75rem' }}>
      {/* Privacy & Security Reassurance Banner */}
      <div className="col-12 disclaimer-banner">
        <ShieldCheck size={20} color="var(--primary-600)" />
        <div style={{ flex: 1 }}>
          <strong>Your Health Information is Secure & Encrypted:</strong> Data processed under HIPAA/GDPR standards. AI risk predictions support clinician decisions and never replace professional medical diagnosis.
        </div>
      </div>

      {/* Warm Greeting Header */}
      <div className="col-12" style={{ marginBottom: '-0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              Good day, {mockPatient.name} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {todayStr} • Medical Record Number: <strong>{mockPatient.id}</strong>
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

      {/* Three Primary Action Cards */}
      <div className="col-4">
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
          color: 'white',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Calendar size={26} color="white" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
              Book Appointment
            </h3>
            <p style={{ fontSize: '0.88rem', opacity: 0.9, lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Schedule a visit with your primary doctor or reserve a 15–20% priority slot based on ML risk scoring.
            </p>
          </div>
          <button 
            className="btn" 
            onClick={onBookClick}
            style={{ background: 'white', color: 'var(--primary-700)', fontWeight: 700, width: '100%' }}
          >
            <span>Book Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="col-4">
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ background: 'var(--primary-50)', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid var(--primary-100)' }}>
              <UserCheck size={26} color="var(--primary-600)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              My Appointments
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              View upcoming clinic visits, manage video tele-consultations, and track past medical history.
            </p>
            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <strong>1 Active Booking:</strong> {nextApt.date} at {nextApt.time}
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
            <div style={{ background: 'var(--teal-50)', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid var(--teal-100)' }}>
              <Heart size={26} color="var(--teal-600)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              View My Risk Score
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Check your personalized disease risk (78%) & 30-day readmission risk breakdown with plain-language explanations.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge badge-emergency">Disease: High Risk ({mockMLRiskResults.diseaseRisk.score}%)</span>
              <span className="badge badge-urgent">Readmission: Medium ({mockMLRiskResults.readmissionRisk.score}%)</span>
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
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.05em' }}>
              Upcoming Visit Summary
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Next Scheduled Appointment</h3>
          </div>
          <span className="badge badge-routine" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
            <CheckCircle2 size={15} /> {nextApt.status}
          </span>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Date & Time</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{nextApt.date}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--primary-600)', fontWeight: 700 }}>{nextApt.time}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Doctor & Department</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{nextApt.doctor}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{nextApt.department} Department</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Hospital Facility</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{nextApt.hospital}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Main Campus • Outpatient Wing</div>
            </div>
          </div>
        </div>

        {/* Prep Instructions */}
        <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <AlertCircle size={22} color="var(--primary-600)" />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-800)' }}>Patient Prep Instructions:</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--primary-700)' }}>{nextApt.prepInstructions}</div>
          </div>
        </div>
      </div>

      {/* Live OPD Token Mini View */}
      <div className="col-4 card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Hospital OPD Queue Status
          </div>
          <div className="token-box" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Active Token</div>
            <div className="token-number" style={{ fontSize: '2.5rem', margin: '0.2rem 0' }}>{mockPatient.currentToken}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{mockPatient.opdDepartment}</div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span>Position in queue:</span>
            <strong>{mockPatient.queuePosition} of {mockPatient.totalInQueue}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Est. Wait Time:</span>
            <strong style={{ color: 'var(--primary-600)' }}>~{mockPatient.estimatedWaitMins} minutes</strong>
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
