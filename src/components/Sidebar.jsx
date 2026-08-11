import React from 'react';
import { 
  Home, 
  Activity, 
  BrainCircuit, 
  Clock, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  Search,
  Users,
  CalendarCheck,
  HeartHandshake
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, role }) {
  const patientMenu = [
    { id: 'opd-portal', label: 'OPD Patient Portal', icon: Home },
    { id: 'triage', label: 'Rule-Based Triage', icon: Activity },
    { id: 'ml-risk', label: 'ML Risk & Priority Slots', icon: BrainCircuit },
    { id: 'queue', label: 'Live Queue & Navigation', icon: Clock },
    { id: 'discharge', label: 'Discharge & Follow-Up', icon: HeartHandshake },
    { id: 'ocr-rag', label: 'Medical Documents & RAG', icon: FileText },
  ];

  const clinicianMenu = [
    { id: 'opd-portal', label: 'Clinician OPD Overview', icon: Home },
    { id: 'triage', label: 'Patient Triage Queue', icon: Activity },
    { id: 'ml-risk', label: 'ML Risk & Fairness Audit', icon: BrainCircuit },
    { id: 'no-show', label: 'No-Show Slot Allocation', icon: CalendarCheck },
    { id: 'ocr-rag', label: 'RAG History Query Engine', icon: Search },
  ];

  const menu = role === 'patient' ? patientMenu : clinicianMenu;

  return (
    <aside className="sidebar">
      <div className="brand-logo">
        <div className="brand-icon">
          <Activity size={24} />
        </div>
        <div>
          <div className="brand-title">Swasthya Care</div>
          <div className="brand-subtitle">Medical Diagnosis Assistant</div>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.5rem 0.25rem 0.5rem' }}>
        {role === 'patient' ? 'Patient Interactions' : 'Clinical Decision Support'}
      </div>

      <ul className="nav-menu">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
        <div style={{
          background: 'var(--teal-50)',
          border: '1px solid var(--teal-100)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          fontSize: '0.78rem',
          color: 'var(--teal-600)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ShieldCheck size={18} />
          <div>
            <div style={{ fontWeight: 700 }}>Demographic Bias Guard</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Equalized Odds Audited</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
