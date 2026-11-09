import React, { useState } from 'react';
import { aiService } from '../services/aiService';

export default function MedicineOCRView() {
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const samplePackages = [
    {
      label: 'Lipitor (Cholesterol)',
      text: 'Lipitor Atorvastatin Calcium 20mg Film Coated Tablets Pfizer Rx only Exp 2028-09 Batch 932B',
    },
    {
      label: 'Augmentin (Antibiotic)',
      text: 'AUGMENTIN Amoxicillin and Clavulanate Potassium Tablets 625 mg oral administration GSK',
    },
    {
      label: 'Glucophage (Diabetes)',
      text: 'Glucophage XR Metformin HCl 500mg Extended-Release Tablets Merck Sante batch 4801',
    },
    {
      label: 'Unclear / Scratched Packaging',
      text: 'blurred text ... illegible barcode 883901 exp ??/??',
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate client-side optical character recognition extraction
      setOcrText(`Simulated OCR scan from ${file.name}: Lipitor Atorvastatin Calcium 20mg Film Coated Tablets Rx`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">📷 Medicine Packaging OCR & Formulary Matcher</h2>
        <p className="text-xs text-gray-500">
          Extract text from medication packaging strips or labels and match against synthetic formulary database
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Scanner & Input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Sample Package Text (Quick Demo)
            </label>
            <div className="flex flex-wrap gap-2">
              {samplePackages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setOcrText(s.text)}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 rounded-lg text-xs font-medium transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Upload Packaging Photo / Label
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSimulatedImageUpload}
              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                OCR Extracted Raw Text
              </label>
              <textarea
                rows={5}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Type or paste text read from the medicine strip/box..."
                className="w-full p-3 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !ocrText.trim()}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? '🔍 Analyzing Formulary Candidates...' : '🔎 Run Formulary Matching'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: OCR Candidates & Clinical Safety Advisory */}
        <div className="space-y-4">
          {result ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold text-gray-600">Extracted Tokens:</span>
                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                  {result.extracted_tokens?.length || 0} tokens
                </span>
              </div>

              {result.is_inconclusive ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                  <div className="font-bold flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>Inconclusive OCR Scan</span>
                  </div>
                  <p>
                    The extracted text did not match any verified medications in the formulary database with sufficient confidence.
                  </p>
                  <p className="font-medium">
                    Recommendation: Please manually type the medication name or consult your doctor/pharmacist with the physical packaging.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Candidate Formulary Matches ({result.candidate_matches.length})
                  </h4>

                  {result.candidate_matches.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-teal-100 bg-teal-50/20 rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-sm font-bold text-gray-900">{med.brand_name}</span>
                          <span className="text-xs text-gray-500 block">({med.generic_name})</span>
                        </div>
                        <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
                          {Math.round(med.confidence * 100)}% match
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-teal-100">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Strength / Form</span>
                          <span className="font-semibold text-gray-700">{med.strength} ({med.form})</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Class</span>
                          <span className="font-semibold text-gray-700">{med.therapeutic_class}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 bg-white p-2 rounded border border-teal-100">
                        <span className="font-medium text-teal-900">Indications: </span>
                        {med.indications}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Safety Advisory Banner */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs leading-relaxed">
                <div className="font-bold flex items-center space-x-1 mb-1">
                  <span>🛑</span>
                  <span>Safety Advisory</span>
                </div>
                <p>{result.safety_advisory}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <h4 className="font-semibold text-gray-700 mb-1">OCR Scanner Idle</h4>
              <p className="text-xs text-gray-500">
                Select a sample packaging strip or upload an image on the left to extract text and match against the formulary.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
