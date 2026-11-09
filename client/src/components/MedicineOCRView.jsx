import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import {
  ScanLine,
  Pill,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Building2,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function MedicineOCRView() {
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const samplePackages = [
    {
      label: 'Lipitor (Cardiovascular Statin)',
      text: 'Lipitor Atorvastatin Calcium 20mg Film Coated Tablets Pfizer Rx only Exp 2028-09 Batch 932B',
    },
    {
      label: 'Augmentin (Antibiotic Regimen)',
      text: 'AUGMENTIN Amoxicillin and Clavulanate Potassium Tablets 625 mg oral administration GSK',
    },
    {
      label: 'Glucophage (Metabolic Diabetes)',
      text: 'Glucophage XR Metformin HCl 500mg Extended-Release Tablets Merck Sante batch 4801',
    },
    {
      label: 'Blurred / Unclear Strip (Inconclusive)',
      text: 'blurred text ... illegible scratched packaging 883901 exp ??/??',
    },
  ];

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!ocrText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await aiService.matchMedicineOCR(ocrText.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Formulary matching failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setOcrText(`Extracted from ${file.name}: Lipitor Atorvastatin Calcium 20mg Film Coated Tablets Rx only`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
            <ScanLine className="w-4 h-4 text-teal-600" />
            <span>Formulary Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medicine Packaging OCR & Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Optical packaging tokenization and candidate drug verification against national formulary registries.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Scanner & Input Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          {/* Quick Preset Strip Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Rapid Clinical Demonstration Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePackages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setOcrText(s.text)}
                  className="p-2.5 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-teal-900 text-left transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated File Upload Dropzone */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Packaging Photo / Label Capture
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl p-4 text-center transition-colors bg-slate-50/50">
              <UploadCloud className="w-7 h-7 text-teal-600 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-xs font-bold text-teal-700 hover:underline">Click to upload photo</span>
                <span className="text-xs text-slate-400"> or drag packaging strip image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulatedImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, HEIC up to 10MB</p>
            </div>
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Extracted Packaging Optical Text
              </label>
              <textarea
                rows={4}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Type or paste packaging text from blister pack or prescription label..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !ocrText.trim()}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ScanLine className="w-4 h-4" />
              <span>{loading ? 'Analyzing Packaging Tokens...' : 'Tokenize & Match Against Formulary'}</span>
            </button>
          </form>
        </div>

        {/* Right Col: Matches & Clinical Safety Advisory */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Candidate Formulary Matches
                </span>
                <span className="text-[11px] font-mono bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600 font-bold">
                  {result.extracted_tokens?.length || 0} Tokens Processed
                </span>
              </div>

              {result.is_inconclusive ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Inconclusive Packaging OCR</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    The extracted tokens did not match any verified pharmaceutical compounds with safe statistical confidence.
                  </p>
                  <p className="text-[11px] font-semibold">
                    Recommendation: Please do not self-administer unverified medications. Consult treating clinician or licensed pharmacist.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.candidate_matches?.map((match, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900">
                          {match.brand_name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                          {match.confidence_percentage}% Match
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        Generic Formulation: <span className="font-bold text-slate-800">{match.generic_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Therapeutic Class: {match.therapeutic_class || 'Cardiovascular'}</span>
                        <span className="font-semibold text-slate-700">{match.standard_dosage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Institutional Safety Advisory */}
              <div className="p-3.5 bg-slate-900 text-slate-300 rounded-2xl text-[11px] leading-relaxed space-y-1">
                <div className="font-bold text-teal-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Clinical Formulary Safety Standard</span>
                </div>
                <p className="text-slate-400">
                  {result.safety_advisory ||
                    'Always confirm packaging identity with a licensed healthcare professional prior to medication ingestion.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Pill className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Medication Scanned</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select a sample packaging preset or upload an image on the left to initiate tokenization.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
