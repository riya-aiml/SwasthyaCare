import React, { useState } from 'react';
import { 
  Stethoscope, 
  Users, 
  Filter, 
  Search, 
  Eye, 
  X, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { mockClinicianPriorityPatients } from '../data/mockData';

export default function ClinicianDashboard() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  // Filter & Sort patients (highest risk score first)
  const filteredPatients = mockClinicianPriorityPatients
    .filter(p => selectedDept === 'All' || p.department === selectedDept)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.diseaseRiskScore - a.diseaseRiskScore);

  const highRiskCount = mockClinicianPriorityPatients.filter(p => p.diseaseRiskLevel === 'High').length;
  const mediumRiskCount = mockClinicianPriorityPatients.filter(p => p.diseaseRiskLevel === 'Medium').length;
  const lowRiskCount = mockClinicianPriorityPatients.filter(p => p.diseaseRiskLevel === 'Low').length;
  const totalCount = mockClinicianPriorityPatients.length;

  return (
    <div className="grid-12 font-clinician-ui" style={{ gap: '1.25rem' }}>
      {/* Clinician Header */}
      <div className="col-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-teal)', letterSpacing: '0.05em' }}>
              Clinician Decision Support Console
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-charcoal)' }}>
              Good morning, Dr. Amanda Vance 🩺
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {todayStr} • Department of Cardiology & Internal Medicine
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid #E2E8E8', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-clinician)' }}>
              <Filter size={15} color="var(--primary-teal)" />
              <select 
                className="form-select" 
                style={{ border: 'none', padding: 0, fontSize: '0.84rem', fontWeight: 700 }}
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="General OPD">General OPD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Summary Metric Tiles Row */}
      <div className="col-3">
        <div className="card" style={{ borderLeft: '4px solid var(--risk-high)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>High Risk Patients</div>
          <div className="font-mono-num" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--risk-high)', margin: '0.1rem 0' }}>{highRiskCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Requires immediate review</div>
        </div>
      </div>

      <div className="col-3">
        <div className="card" style={{ borderLeft: '4px solid var(--risk-medium)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Medium Risk Patients</div>
          <div className="font-mono-num" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--risk-medium)', margin: '0.1rem 0' }}>{mediumRiskCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Priority slot reserved</div>
        </div>
      </div>

      <div className="col-3">
        <div className="card" style={{ borderLeft: '4px solid var(--risk-low)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Low Risk Patients</div>
          <div className="font-mono-num" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--risk-low)', margin: '0.1rem 0' }}>{lowRiskCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Standard OPD queue</div>
        </div>
      </div>

      <div className="col-3">
        <div className="card" style={{ borderLeft: '4px solid var(--primary-teal)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Priority Queue</div>
          <div className="font-mono-num" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-teal)', margin: '0.1rem 0' }}>{totalCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Sorted by ML Rank</div>
        </div>
      </div>

      {/* Today's Priority Patients Dense Table */}
      <div className="col-12 card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Today's Priority Patients</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Automatically prioritized based on Disease Risk + Readmission Risk scoring models.
            </p>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search Name or MRN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.2rem' }}
            />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name & MRN</th>
                <th>Age</th>
                <th>Disease Risk</th>
                <th>30-Day Readmission</th>
                <th>Risk Level</th>
                <th>Department</th>
                <th>Triage Urgency</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.mrn}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--text-charcoal)' }}>{patient.name}</div>
                    <div className="font-mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{patient.mrn}</div>
                  </td>
                  <td className="font-mono-num">{patient.age} yrs</td>
                  <td>
                    <strong className="font-mono-num" style={{ fontSize: '0.95rem', color: patient.diseaseRiskScore > 75 ? 'var(--risk-high)' : patient.diseaseRiskScore > 50 ? 'var(--risk-medium)' : 'var(--risk-low)' }}>
                      {patient.diseaseRiskScore}%
                    </strong>
                  </td>
                  <td>
                    <span className="font-mono-num" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      {patient.readmissionRiskScore}% ({patient.readmissionRiskLevel})
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${patient.diseaseRiskLevel === 'High' ? 'badge-high' : patient.diseaseRiskLevel === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                      {patient.diseaseRiskLevel}
                    </span>
                  </td>
                  <td>{patient.department}</td>
                  <td>
                    <span className={`badge ${patient.triageUrgency === 'Emergency' ? 'badge-high' : patient.triageUrgency === 'Urgent' ? 'badge-medium' : 'badge-standard'}`}>
                      {patient.triageUrgency}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="modal-backdrop" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderRadius: 'var(--radius-clinician)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8E8', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedPatient.name} <span className="font-mono-num" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({selectedPatient.mrn})</span></h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Age: {selectedPatient.age} • Department: {selectedPatient.department}</p>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem', borderRadius: '50%' }}
                onClick={() => setSelectedPatient(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Vitals Summary */}
            <div style={{ background: 'var(--primary-teal-light)', border: '1px solid rgba(46, 111, 114, 0.2)', padding: '0.85rem', borderRadius: 'var(--radius-clinician)', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-teal-dark)', marginBottom: '0.4rem' }}>Recorded Vital Signs:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div>BP: <strong className="font-mono-num">{selectedPatient.vitals.bp}</strong></div>
                <div>Glucose: <strong className="font-mono-num">{selectedPatient.vitals.bloodSugar}</strong></div>
                <div>HR: <strong className="font-mono-num">{selectedPatient.vitals.hr}</strong></div>
                <div>SpO2: <strong className="font-mono-num">{selectedPatient.vitals.spo2}</strong></div>
              </div>
            </div>

            {/* Explainability / Main Reasons */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>Top Model Contributing Factors:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedPatient.mainReasons.map((r, i) => (
                  <div key={i} style={{ background: 'var(--bg-clinician)', border: '1px solid #E2E8E8', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-clinician)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-charcoal)' }}>{r.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8E8', paddingTop: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedPatient(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => setSelectedPatient(null)}>Approve Priority Consultation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
