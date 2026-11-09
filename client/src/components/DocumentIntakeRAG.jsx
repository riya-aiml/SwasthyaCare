import React, { useState } from 'react';
import { FileText, UploadCloud, CheckCircle2, AlertCircle, Eye, RefreshCw, Database, Camera } from 'lucide-react';
import { mockOCRReports } from '../data/mockData';

export default function DocumentIntakeRAG() {
  const [reports, setReports] = useState(mockOCRReports);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [activeReport, setActiveReport] = useState(mockOCRReports[0]);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSimulatedFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    setTimeout(() => {
      const newDoc = {
        id: `ocr-${Date.now()}`,
        fileName: file.name || "Uploaded_Medical_Report.png",
        uploadDate: "Just now",
        docType: "Lab Report / Diagnostic Scan",
        extractedData: {
          patientName: "Sarah Jenkins",
          dateOfTest: "2026-08-12",
          labName: "City Diagnostic Center",
          metrics: [
            { key: "Fasting Blood Sugar", value: "186 mg/dL", range: "70-99 mg/dL", status: "High" },
            { key: "Systolic BP", value: "148 mmHg", range: "< 120 mmHg", status: "Elevated" },
            { key: "Diastolic BP", value: "92 mmHg", range: "< 80 mmHg", status: "Elevated" },
            { key: "HbA1c", value: "7.8 %", range: "4.0-5.6 %", status: "High" }
          ],
          diagnosesExtracted: ["Type 2 Diabetes Mellitus", "Stage 2 Hypertension"]
        }
      };
      setReports([newDoc, ...reports]);
      setActiveReport(newDoc);
      setIsProcessingUpload(false);
      setIsConfirmed(false);
    }, 1800);
  };

  return (
    <div className="grid-12" style={{ gap: '1.75rem' }}>
      {/* Title */}
      <div className="col-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.05em' }}>
              Feature 7 — Automatic Document Extraction
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Medical Report Upload & OCR Pipeline</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Upload photos or scans of lab reports and prescriptions. Vision OCR automatically structures test values and diagnoses into your health record.
            </p>
          </div>
        </div>
      </div>

      {/* Drag and Drop Upload Box */}
      <div className="col-5 card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
          Upload New Medical Report / Prescription
        </h3>

        <div style={{
          border: '2px dashed var(--primary-500)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          background: 'var(--primary-50)',
          cursor: 'pointer',
          position: 'relative',
          marginBottom: '1.25rem'
        }}>
          <input 
            type="file" 
            accept="image/*,.pdf" 
            onChange={handleSimulatedFileUpload}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          />

          {isProcessingUpload ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <RefreshCw size={36} color="var(--primary-600)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-700)' }}>
                Running Vision OCR & Parsing Medical Named Entities...
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                <UploadCloud size={32} color="var(--primary-600)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-800)' }}>
                  Drag & Drop JPG, PNG or PDF
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Or click to snap picture / select file from camera
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing Uploaded Files List */}
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem' }}>Uploaded Documents ({reports.length})</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {reports.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => { setActiveReport(doc); setIsConfirmed(false); }}
              style={{
                background: activeReport.id === doc.id ? 'var(--primary-50)' : 'var(--bg-primary)',
                border: activeReport.id === doc.id ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileText size={18} color="var(--primary-600)" />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{doc.fileName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.docType} • {doc.uploadDate}</div>
                </div>
              </div>
              <Eye size={16} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Structured Data Confirmation Panel */}
      <div className="col-7 card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              OCR Extraction Output Verification
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{activeReport.fileName}</h3>
          </div>

          {isConfirmed ? (
            <span className="badge badge-routine" style={{ fontSize: '0.85rem' }}>
              <CheckCircle2 size={14} /> Saved to Patient Record
            </span>
          ) : (
            <span className="badge badge-urgent" style={{ fontSize: '0.85rem' }}>
              Pending User Confirmation
            </span>
          )}
        </div>

        {/* Extracted Metrics Table */}
        <div className="table-container" style={{ marginBottom: '1.25rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Extracted Test Metric</th>
                <th>Detected Value</th>
                <th>Reference Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeReport.extractedData.metrics.map((m, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{m.key}</td>
                  <td><strong style={{ color: m.status === 'High' ? '#dc2626' : 'var(--text-main)' }}>{m.value}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.range}</td>
                  <td>
                    <span className={`badge ${m.status === 'High' ? 'badge-emergency' : m.status === 'Elevated' ? 'badge-urgent' : 'badge-routine'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Extracted Diagnoses */}
        {activeReport.extractedData.diagnosesExtracted && (
          <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Automatically Identified Diagnoses
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {activeReport.extractedData.diagnosesExtracted.map((d, i) => (
                <span key={i} className="badge badge-standard">{d}</span>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button 
            className="btn btn-success" 
            style={{ width: '100%' }}
            onClick={() => setIsConfirmed(true)}
            disabled={isConfirmed}
          >
            <CheckCircle2 size={16} />
            <span>{isConfirmed ? 'Confirmed & Saved to ML History' : 'Confirm Extracted Values & Feed ML Models'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
