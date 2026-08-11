import React, { useState } from 'react';
import { FileText, Upload, Search, Sparkles, CheckCircle2, FileCheck } from 'lucide-react';
import { mockOCRDocuments, mockRAGIndex } from '../data/mockData';

export default function DocumentIntakeRAG() {
  const [docs, setDocs] = useState(mockOCRDocuments);
  const [query, setQuery] = useState('');
  const [activeResult, setActiveResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      const newDoc = {
        id: `doc-${Date.now()}`,
        title: "Discharge_Summary_Apex_Cardio.pdf",
        uploadDate: "Today, Aug 11, 2026",
        ocrExtracted: {
          diagnosis: "Transient Hypertension & Stress Dyspnea",
          prescriptions: "Ramipril 2.5mg (1-0-0)",
          vitalSummary: "BP 132/84, HR 74, SpO2 99%"
        }
      };
      setDocs([newDoc, ...docs]);
    }, 1200);
  };

  const handleQueryRAG = (e) => {
    e.preventDefault();
    const match = mockRAGIndex.find(r => r.query.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes('pressure') || query.toLowerCase().includes('cholesterol'));
    if (match) {
      setActiveResult(match.answer);
    } else {
      setActiveResult(`RAG Engine Result: Found 2 matching medical records for '${query}'. Patient Priya Malhotra shows stable recovery with prescribed antihypertensives.`);
    }
  };

  return (
    <div className="grid-12">
      {/* OCR Document Intake Card */}
      <div className="col-6 card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Document & Image OCR Intake</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Automatically extracts structured clinical data from scanned prescriptions & lab reports</p>
          </div>
          <button className="btn btn-primary" onClick={handleSimulateUpload} style={{ fontSize: '0.82rem' }}>
            <Upload size={16} />
            <span>{uploading ? 'Processing OCR...' : 'Upload Report'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {docs.map(doc => (
            <div key={doc.id} style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <FileCheck size={20} color="var(--primary-500)" />
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{doc.title}</div>
                <span className="badge badge-standard" style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>OCR Processed</span>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>Parsed OCR Data:</div>
                <pre style={{ fontFamily: 'var(--font-main)', whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>
                  {JSON.stringify(doc.ocrExtracted, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAG Natural Language Query Engine */}
      <div className="col-6 card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Sparkles size={22} color="var(--teal-500)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>RAG History Query Engine</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Query patient's history across documents in natural language</p>
          </div>
        </div>

        <form onSubmit={handleQueryRAG} style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Ask Medical Record Query</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ flex: 1 }}
                placeholder="e.g. Has this patient had high blood pressure before?" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Search size={16} />
                <span>Query RAG</span>
              </button>
            </div>
          </div>
        </form>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>Try Sample Queries:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {mockRAGIndex.map((item, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => {
                  setQuery(item.query);
                  setActiveResult(item.answer);
                }}
              >
                "{item.query}"
              </button>
            ))}
          </div>
        </div>

        {activeResult && (
          <div style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-100)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.35rem' }}>
              🤖 RAG Natural Language Response:
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {activeResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
