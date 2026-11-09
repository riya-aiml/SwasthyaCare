import React, { useState } from 'react';
import { aiService } from '../services/aiService';

export default function RiskAssessmentView() {
  const [activeModel, setActiveModel] = useState('heart'); // 'heart' | 'diabetes'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Heart Risk State
  const [age, setAge] = useState(52);
  const [gender, setGender] = useState('male');
  const [systolic, setSystolic] = useState(145);
  const [diastolic, setDiastolic] = useState(90);
  const [cholesterol, setCholesterol] = useState(220);
  const [hdl, setHdl] = useState(42);
  const [smoker, setSmoker] = useState(true);
  const [diabetic, setDiabetic] = useState(false);
  const [onBpMed, setOnBpMed] = useState(true);

  // Diabetes Risk State
  const [diabetesAge, setDiabetesAge] = useState(48);
  const [bmi, setBmi] = useState(28.5);
  const [waist, setWaist] = useState(96);
  const [activity, setActivity] = useState(false);
  const [diet, setDiet] = useState(true);
  const [historyBp, setHistoryBp] = useState(true);
  const [historyGlucose, setHistoryGlucose] = useState(false);
  const [familyDiabetes, setFamilyDiabetes] = useState('second_degree');

  const handleCalculateHeartRisk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.predictHeartRisk({
        age: Number(age),
        gender,
        systolic_bp: Number(systolic),
        diastolic_bp: Number(diastolic),
        total_cholesterol: Number(cholesterol),
        hdl_cholesterol: Number(hdl),
        smoker,
        diabetic,
        on_bp_medication: onBpMed,
      });
      setResult({ type: 'heart', data: res.data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDiabetesRisk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.predictDiabetesRisk({
        age: Number(diabetesAge),
        bmi: Number(bmi),
        waist_circumference_cm: Number(waist),
        daily_physical_activity: activity,
        diet_vegetables_daily: diet,
        history_high_bp: historyBp,
        history_high_glucose: historyGlucose,
        family_history_diabetes: familyDiabetes,
      });
      setResult({ type: 'diabetes', data: res.data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (category) => {
    switch (category) {
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'BORDERLINE':
      case 'SLIGHTLY_ELEVATED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INTERMEDIATE':
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'HIGH':
      case 'VERY_HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">🧠 Clinical Risk Inference Models (Sprint 6 Prototype)</h2>
        <p className="text-xs text-gray-500">
          Validated statistical risk calculators (Framingham ASCVD & FINDRISC Diabetes models)
        </p>
      </div>

      {/* Model Selection Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => {
            setActiveModel('heart');
            setResult(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center space-x-2 ${
            activeModel === 'heart'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>❤️</span>
          <span>Cardiovascular Risk (10-Year ASCVD)</span>
        </button>
        <button
          onClick={() => {
            setActiveModel('diabetes');
            setResult(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center space-x-2 ${
            activeModel === 'diabetes'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>🩸</span>
          <span>Type 2 Diabetes Risk (FINDRISC)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {activeModel === 'heart' ? (
            <form onSubmit={handleCalculateHeartRisk} className="space-y-4">
              <h3 className="font-bold text-gray-900 text-sm border-b pb-2">Patient Cardiovascular Parameters</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Age (years): {age}</label>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full accent-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Biological Sex</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Systolic BP: {systolic} mmHg</label>
                  <input
                    type="range"
                    min="90"
                    max="220"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full accent-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Diastolic BP: {diastolic} mmHg</label>
                  <input
                    type="range"
                    min="60"
                    max="130"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Cholesterol: {cholesterol} mg/dL</label>
                  <input
                    type="range"
                    min="120"
                    max="380"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(e.target.value)}
                    className="w-full accent-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">HDL Cholesterol: {hdl} mg/dL</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={hdl}
                    onChange={(e) => setHdl(e.target.value)}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t text-xs">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={smoker}
                    onChange={(e) => setSmoker(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span>Current Tobacco Smoker</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={diabetic}
                    onChange={(e) => setDiabetic(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span>Diagnosed with Diabetes Mellitus</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={onBpMed}
                    onChange={(e) => setOnBpMed(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span>Currently Taking Anti-Hypertensive Medication</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Evaluating ASCVD Model...' : 'Calculate 10-Year Heart Risk'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCalculateDiabetesRisk} className="space-y-4">
              <h3 className="font-bold text-gray-900 text-sm border-b pb-2">Patient Metabolic Parameters</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Age: {diabetesAge} yrs</label>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={diabetesAge}
                    onChange={(e) => setDiabetesAge(e.target.value)}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">BMI: {bmi} kg/m²</label>
                  <input
                    type="range"
                    min="18"
                    max="50"
                    step="0.5"
                    value={bmi}
                    onChange={(e) => setBmi(e.target.value)}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Waist Circumference: {waist} cm</label>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Family History of Diabetes</label>
                <select
                  value={familyDiabetes}
                  onChange={(e) => setFamilyDiabetes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="none">No known history</option>
                  <option value="second_degree">Grandparent, Aunt, Uncle, Cousin</option>
                  <option value="first_degree">Parent, Sibling, Child</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t text-xs">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activity}
                    onChange={(e) => setActivity(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>At least 30 mins daily physical activity</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={diet}
                    onChange={(e) => setDiet(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Eat vegetables and fruits daily</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={historyBp}
                    onChange={(e) => setHistoryBp(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Treated or monitored for high blood pressure</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={historyGlucose}
                    onChange={(e) => setHistoryGlucose(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Ever diagnosed with high blood glucose / prediabetes</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Evaluating FINDRISC Model...' : 'Calculate 10-Year Diabetes Risk'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Model Output & Clinical Findings */}
        <div className="space-y-4">
          {result ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-xs text-gray-400 block">{result.data.model_id}</span>
                  <span className="text-xs font-mono text-gray-500">{result.data.model_version}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeColor(result.data.risk_category)}`}>
                  {result.data.risk_category} RISK
                </span>
              </div>

              {/* Big Score Tile */}
              <div className="text-center py-4 bg-gray-50 rounded-xl">
                <div className="text-4xl font-extrabold text-gray-900">
                  {result.data.ten_year_risk_percentage}%
                </div>
                <div className="text-xs text-gray-500 mt-1">10-Year Estimated Event Probability</div>
                {result.data.risk_score !== undefined && (
                  <div className="text-xs font-semibold text-teal-800 mt-1">
                    FINDRISC Score: {result.data.risk_score} / 26
                  </div>
                )}
              </div>

              {/* Contributing Drivers */}
              {(result.data.contributing_factors || result.data.key_drivers) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Primary Risk Modifiers
                  </h4>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                    {(result.data.contributing_factors || result.data.key_drivers).map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinical Guidelines */}
              {(result.data.recommendations || result.data.preventive_guidelines) && (
                <div className="bg-teal-50/40 border border-teal-100 rounded-xl p-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">
                    Guideline Recommendations
                  </h4>
                  <ul className="list-disc list-inside text-xs text-teal-800 space-y-1">
                    {(result.data.recommendations || result.data.preventive_guidelines).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regulatory Clinical Disclaimer */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
                <div className="font-bold flex items-center space-x-1 mb-1">
                  <span>ℹ️</span>
                  <span>Clinical Limitation Notice</span>
                </div>
                <p>{result.data.disclaimer}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              <div className="text-5xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-700 mb-1">Model Ready for Inference</h4>
              <p className="text-xs text-gray-500">
                Adjust clinical parameters on the left and click calculate to view the real-time AI risk evaluation and contributing factors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
