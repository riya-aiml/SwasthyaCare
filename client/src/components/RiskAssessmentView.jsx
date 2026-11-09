import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import {
  HeartPulse,
  Activity,
  Brain,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  Scale,
  FileText,
  ChevronRight,
  TrendingUp,
  Info,
} from 'lucide-react';

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
      setError(err.message || 'Heart risk calculation failed.');
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
      setError(err.message || 'Diabetes risk calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (category) => {
    switch (category) {
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'BORDERLINE':
      case 'SLIGHTLY_ELEVATED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'INTERMEDIATE':
      case 'MODERATE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'HIGH':
      case 'VERY_HIGH':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
            <Brain className="w-4 h-4 text-teal-600" />
            <span>Clinical Intelligence Engines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Predictive Clinical Risk Calculators
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Statistical decision support based on Framingham 10-Year ASCVD and FINDRISC Diabetes epidemiology frameworks.
          </p>
        </div>

        {/* Model Switcher Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner self-start md:self-auto">
          <button
            onClick={() => {
              setActiveModel('heart');
              setResult(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeModel === 'heart'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <span>Cardiovascular ASCVD (10-Yr)</span>
          </button>
          <button
            onClick={() => {
              setActiveModel('diabetes');
              setResult(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeModel === 'diabetes'
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Type 2 Diabetes (FINDRISC)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form Inputs (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Model Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {activeModel === 'heart' ? (
            /* HEART ASCVD FORM */
            <form onSubmit={handleCalculateHeartRisk} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Patient Hemodynamic Parameters
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Framingham Epidemiological Equation
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="20"
                    max="79"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Biological Sex</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Systolic Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    min="90"
                    max="200"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Diastolic Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="130"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Total Serum Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    min="130"
                    max="320"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    HDL "Good" Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="100"
                    value={hdl}
                    onChange={(e) => setHdl(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Lifestyle & Clinical Flags */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">Comorbidities & Risk Drivers</span>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smoker}
                      onChange={(e) => setSmoker(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Active Smoker</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={diabetic}
                      onChange={(e) => setDiabetic(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Diabetic</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onBpMed}
                      onChange={(e) => setOnBpMed(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>On BP Meds</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <HeartPulse className="w-4 h-4" />
                <span>{loading ? 'Evaluating ASCVD Risk...' : 'Calculate 10-Year Cardiovascular Risk'}</span>
              </button>
            </form>
          ) : (
            /* FINDRISC DIABETES FORM */
            <form onSubmit={handleCalculateDiabetesRisk} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Metabolic & Lifestyle Biomarkers
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  FINDRISC Scoring Rubric (0 - 26 Pts)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={diabetesAge}
                    onChange={(e) => setDiabetesAge(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">BMI (kg/m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bmi}
                    onChange={(e) => setBmi(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Family History of Diabetes</label>
                <select
                  value={familyDiabetes}
                  onChange={(e) => setFamilyDiabetes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="none">No known family history (0 pts)</option>
                  <option value="second_degree">Grandparent, Aunt, Uncle, First Cousin (3 pts)</option>
                  <option value="first_degree">Parent, Sibling, Child (5 pts)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">Lifestyle & Metabolic History</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activity}
                      onChange={(e) => setActivity(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span>Daily 30+ Mins Physical Activity</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={diet}
                      onChange={(e) => setDiet(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span>Daily Vegetables / Fruit Diet</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={historyBp}
                      onChange={(e) => setHistoryBp(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span>History of High BP Meds</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={historyGlucose}
                      onChange={(e) => setHistoryGlucose(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span>Past Elevated Blood Glucose</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Activity className="w-4 h-4" />
                <span>{loading ? 'Evaluating FINDRISC...' : 'Calculate 10-Year Diabetes Risk'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Statistical Risk Output Card */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Inference Output
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${getRiskBadgeColor(result.data.risk_category)}`}>
                  {result.data.risk_category} RISK
                </span>
              </div>

              {/* Heart Specific Display */}
              {result.type === 'heart' && (
                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-4xl font-black text-rose-700 tracking-tight">
                    {result.data.ten_year_risk_percentage}%
                  </div>
                  <div className="text-xs font-bold text-slate-600 mt-1">
                    10-Year Estimated ASCVD Event Probability
                  </div>
                </div>
              )}

              {/* Diabetes Specific Display */}
              {result.type === 'diabetes' && (
                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-4xl font-black text-teal-800 tracking-tight">
                    {result.data.risk_score} <span className="text-lg text-slate-400 font-semibold">/ 26 Pts</span>
                  </div>
                  <div className="text-xs font-bold text-slate-600 mt-1">
                    Estimated 10-Yr Diabetes Conversion: {result.data.ten_year_probability_percentage || 'Elevated'}
                  </div>
                </div>
              )}

              {/* Contributing Drivers */}
              {result.data.contributing_factors && result.data.contributing_factors.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Key Clinical Drivers:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.data.contributing_factors.map((f, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SaMD Disclaimer */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Clinical Software Limitation Advisory</span>
                </div>
                {result.data.disclaimer}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Assessment Computed Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Fill out the physiological parameters on the left and submit to generate statistical predictions.
              </p>
            </div>
          )}

          {/* Model Specification Card */}
          <div className="p-5 bg-slate-900 text-slate-300 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Microservice Architecture Note</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculations are proxied through an Express timeout barrier (8,000ms AbortController) to
              the Python 3.11 FastAPI microservice (`ai-service/app/models`), returning strictly typed Pydantic v2 schemas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
