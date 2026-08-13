import React, { useState } from 'react';
import { 
  Stethoscope, 
  Users, 
  AlertTriangle, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  X, 
  CheckCircle2, 
  ArrowUpRight, 
  Heart, 
  FileText 
} from 'lucide-react';
import { mockClinicianPriorityPatients } from '../data/mockData';

export default function ClinicianDashboard() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

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
    <div className="grid-12" style={{ gap: '1.75rem' }}>
      {/* Clinician Greeting Header */}
      <div className="col-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.05em' }}>
              Clinician Decision Support Console
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Good morning, Dr. Amanda Vance 🩺
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {todayStr} • Department of Cardiology & Internal Medicine
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <Filter size={16} color="var(--primary-500)" />
              <select 
                className="form-select" 
                style={{ border: 'none', padding: 0, fontSize: '0.88rem', fontWeight: 700 }}
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

      {/* Summary Tiles Row */}
      <div className="col-3">
        <div className="card" style={{ borderLeft: '4px solid var(--urgency-emergency)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>High Risk Patients</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626', margin: '0.2rem 0' }}>{highRiskCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Requires immediate clinical review</div>
        </div>
      </div>

      <div className="col-3">
        <div className="card" style={{ borderLeft: '4px solid var(--urgency-urgent)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Medium Risk Patients</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', margin: '0.2rem 0' }}>{mediumRiskCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Priority slot allocation active</div>
        </div>
      </div>

      <div className="col-3">
        <div className="card" style={{ borderLeft: '4px solid var(--urgency-routine)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Low Risk Patients</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', margin: '0.2rem 0' }}>{lowRiskCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Standard OPD queue routine</div>
        </div>
      </div>

      <div className="col-3">
        <div className="card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Priority Queue</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)', margin: '0.2rem 0' }}>{totalCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Sorted by ML Risk Rank</div>
        </div>
      </div>

      {/* Today's Priority Patients Table */}
      <div className="col-12 card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Today's Priority Patients</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Automatically prioritized based on combined Disease Risk + Readmission Risk scoring models.
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Patient Name or MRN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name & MRN</th>
                <th>Age</th>
                <th>Disease Risk Score</th>
                <th>Readmission Risk</th>
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
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{patient.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{patient.mrn}</div>
                  </td>
                  <td>{patient.age} yrs</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1rem', color: patient.diseaseRiskScore > 75 ? '#dc2626' : patient.diseaseRiskScore > 50 ? '#d97706' : '#16a34a' }}>
                        {patient.diseaseRiskScore}%
                      </strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {patient.readmissionRiskScore}% ({patient.readmissionRiskLevel})
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${patient.diseaseRiskLevel === 'High' ? 'badge-emergency' : patient.diseaseRiskLevel === 'Medium' ? 'badge-urgent' : 'badge-routine'}`}>
                      {patient.diseaseRiskLevel}
                    </span>
                  </td>
                  <td>{patient.department}</td>
                  <td>
                    <span className={`badge ${patient.triageUrgency === 'Emergency' ? 'badge-emergency' : patient.triageUrgency === 'Urgent' ? 'badge-urgent' : 'badge-standard'}`}>
                      {patient.triageUrgency}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <Eye size={14} />
                      <span>View Details</span>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{selectedPatient.name} ({selectedPatient.mrn})</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Age: {selectedPatient.age} • Department: {selectedPatient.department}</p>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem', borderRadius: '50%' }}
                onClick={() => setSelectedPatient(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Vitals Summary */}
            <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '0.5rem' }}>Recorded Vital Signs:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>BP: <strong>{selectedPatient.vitals.bp}</strong></div>
                <div>Blood Sugar: <strong>{selectedPatient.vitals.bloodSugar}</strong></div>
                <div>Heart Rate: <strong>{selectedPatient.vitals.hr}</strong></div>
                <div>SpO2: <strong>{selectedPatient.vitals.spo2}</strong></div>
              </div>
            </div>

            {/* Explainability / Main Reasons */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem' }}>Top Model Contributing Factors:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedPatient.mainReasons.map((r, i) => (
                  <div key={i} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{r.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedPatient(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => setSelectedPatient(null)}>Approve Priority Consultation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
