import React from 'react';
import { 
  Home, 
  Activity, 
  Clock, 
  FileText, 
  Calendar, 
  Heart, 
  Users, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Stethoscope,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, role }) {
  const patientNav = [
    { id: 'patient-home', label: 'Home', icon: Home },
    { id: 'triage', label: 'Symptom & Vitals Intake', icon: Activity },
    { id: 'ml-risk', label: 'View Risk Score', icon: Heart },
    { id: 'queue', label: 'Live Queue Status', icon: Clock },
    { id: 'ocr-rag', label: 'Health Records & OCR', icon: FileText },
    { id: 'discharge', label: 'Post-Discharge Follow-up', icon: ClipboardList }
  ];

  const clinicianNav = [
    { id: 'clinician-dashboard', label: 'Priority Patients', icon: Stethoscope },
    { id: 'ml-risk', label: 'Risk Models & Factors', icon: Heart },
    { id: 'triage', label: 'Rule Triage Simulator', icon: Activity },
    { id: 'ocr-rag', label: 'OCR Medical Documents', icon: FileText },
    { id: 'discharge', label: 'Discharge Planning', icon: ClipboardList },
    { id: 'fairness', label: 'Bias & Fairness Audit', icon: ShieldCheck }
  ];

  const adminNav = [
    { id: 'fairness', label: 'Fairness & Bias Governance', icon: ShieldCheck },
    { id: 'clinician-dashboard', label: 'Clinician Priority Queue', icon: Stethoscope },
    { id: 'ml-risk', label: 'ML Model Insights', icon: Heart }
  ];

  const navItems = role === 'clinician' ? clinicianNav : role === 'admin' ? adminNav : patientNav;

  return (
    <aside className="sidebar">
      <div className="brand-logo">
        <div className="brand-icon">
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <div className="brand-title">SwasthyaCare</div>
          <div className="brand-subtitle">Diagnosis & Triage Assistant</div>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '0.5rem 1rem', letterSpacing: '0.05em' }}>
        {role === 'clinician' ? 'Clinician Portal' : role === 'admin' ? 'Compliance Console' : 'Patient Portal'}
      </div>

      <nav className="nav-menu" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Support Widget */}
      <div style={{
        background: 'var(--primary-50)',
        border: '1px solid var(--primary-100)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
          <AlertTriangle size={16} />
          <span>Need Assistance?</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          24/7 Triage Help desk or emergency medical support.
        </p>
        <button style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.4rem' }}>
          Call Emergency Desk →
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
        <button className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
