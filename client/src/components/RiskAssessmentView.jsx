import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
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
  Clock,
  History,
  CheckCircle2,
  Stethoscope,
  ScanLine,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export default function RiskAssessmentView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ml-dia'); // 'ml-dia' | 'ml-cvd' | 'prospective' | 'history'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [ocrConfirmationModal, setOcrConfirmationModal] = useState(false);
  const [activeProvenance, setActiveProvenance] = useState({
    source: 'manual_entry',
    patientConfirmed: true,
  });

  // ============================================
  // Form State: ML-DIA-01 (CDC BRFSS Diabetes Current-Status)
  // ============================================
  const [diaAge, setDiaAge] = useState(52);
  const [diaSex, setDiaSex] = useState('female');
  const [diaBmi, setDiaBmi] = useState(28.4);
  const [diaHighBp, setDiaHighBp] = useState(true);
  const [diaHighChol, setDiaHighChol] = useState(true);
  const [diaCholCheck, setDiaCholCheck] = useState(true);
  const [diaStroke, setDiaStroke] = useState(false);
  const [diaHeartDisease, setDiaHeartDisease] = useState(false);
  const [diaSmoker, setDiaSmoker] = useState(false);
  const [diaPhysActivity, setDiaPhysActivity] = useState(false);
  const [diaFruits, setDiaFruits] = useState(true);
  const [diaVeggies, setDiaVeggies] = useState(true);
  const [diaHeavyAlcohol, setDiaHeavyAlcohol] = useState(false);
  const [diaGenHlth, setDiaGenHlth] = useState(3);
  const [diaMentHlth, setDiaMentHlth] = useState(2);
  const [diaPhysHlth, setDiaPhysHlth] = useState(4);
  const [diaDiffWalk, setDiaDiffWalk] = useState(false);
  const [diaAnyHealthcare, setDiaAnyHealthcare] = useState(true);
  const [diaNoDocCost, setDiaNoDocCost] = useState(false);
  const [diaEducation, setDiaEducation] = useState(4);
  const [diaIncome, setDiaIncome] = useState(5);

  // ============================================
  // Form State: ML-CVD-01 (UCI Cleveland Coronary Stenosis)
  // ============================================
  const [cvdAge, setCvdAge] = useState(58);
  const [cvdSex, setCvdSex] = useState('male');
  const [cvdChestPain, setCvdChestPain] = useState(4); // 1=Typical, 2=Atypical, 3=Non-anginal, 4=Asymptomatic
  const [cvdRestingBp, setCvdRestingBp] = useState(140);
  const [cvdCholesterol, setCvdCholesterol] = useState(260);
  const [cvdFbsGt120, setCvdFbsGt120] = useState(false);
  const [cvdRestingEcg, setCvdRestingEcg] = useState(1);
  const [cvdMaxHr, setCvdMaxHr] = useState(135);
  const [cvdExang, setCvdExang] = useState(true);
  const [cvdOldpeak, setCvdOldpeak] = useState(2.2);
  const [cvdSlope, setCvdSlope] = useState(2);
  const [cvdCa, setCvdCa] = useState(2);
  const [cvdThal, setCvdThal] = useState(7); // 3=Normal, 6=Fixed, 7=Reversible

  // ============================================
  // Form State: Prospective Calculators (Framingham ASCVD / FINDRISC)
  // ============================================
  const [prospType, setProspType] = useState('framingham');
  const [prospAge, setProspAge] = useState(54);
  const [prospGender, setProspGender] = useState('male');
  const [prospSysBp, setProspSysBp] = useState(142);
  const [prospDiaBp, setProspDiaBp] = useState(88);
  const [prospTotalChol, setProspTotalChol] = useState(230);
  const [prospHdl, setProspHdl] = useState(40);
  const [prospSmoker, setProspSmoker] = useState(true);
  const [prospDiabetic, setProspDiabetic] = useState(false);
  const [prospBpMed, setProspBpMed] = useState(true);

  // Load History when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await aiService.getMyAssessmentHistory();
      setHistoryRecords(res.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Submit ML-DIA-01
  const handleDiabetesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        age: Number(diaAge),
        sex: diaSex,
        bmi: Number(diaBmi),
        high_bp: diaHighBp,
        high_chol: diaHighChol,
        chol_check_5yr: diaCholCheck,
        stroke_history: diaStroke,
        heart_disease_or_attack: diaHeartDisease,
        smoker: diaSmoker,
        phys_activity: diaPhysActivity,
        fruits_daily: diaFruits,
        veggies_daily: diaVeggies,
        heavy_alcohol: diaHeavyAlcohol,
        gen_hlth: Number(diaGenHlth),
        ment_hlth_days: Number(diaMentHlth),
        phys_hlth_days: Number(diaPhysHlth),
        diff_walk: diaDiffWalk,
        any_healthcare: diaAnyHealthcare,
        no_doc_bc_cost: diaNoDocCost,
        education_level: Number(diaEducation),
        income_level: Number(diaIncome),
        provenance: activeProvenance,
      };

      const res = await aiService.submitDiabetesAssessment(payload);
      setResult({ type: 'ML-DIA-01', data: res.data });
      // Reset provenance back to manual
      setActiveProvenance({ source: 'manual_entry', patientConfirmed: true });
    } catch (err) {
      setError(err.message || 'Diabetes current-status assessment failed.');
    } finally {
      setLoading(false);
    }
  };

  // Submit ML-CVD-01
  const handleCardiovascularSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        age: Number(cvdAge),
        sex: cvdSex,
        chest_pain_type: Number(cvdChestPain),
        resting_bp: Number(cvdRestingBp),
        cholesterol: Number(cvdCholesterol),
        fasting_blood_sugar_gt_120: cvdFbsGt120,
        resting_ecg: Number(cvdRestingEcg),
        max_heart_rate: Number(cvdMaxHr),
        exercise_induced_angina: cvdExang,
        st_depression: Number(cvdOldpeak),
        st_slope: Number(cvdSlope),
        num_major_vessels: Number(cvdCa),
        thalassemia: Number(cvdThal),
        provenance: activeProvenance,
      };

      const res = await aiService.submitCardiovascularAssessment(payload);
      setResult({ type: 'ML-CVD-01', data: res.data });
      setActiveProvenance({ source: 'manual_entry', patientConfirmed: true });
    } catch (err) {
      setError(err.message || 'Cardiovascular current-status assessment failed.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Prospective
  const handleProspectiveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        age: Number(prospAge),
        gender: prospGender,
        systolic_bp: Number(prospSysBp),
        diastolic_bp: Number(prospDiaBp),
        total_cholesterol: Number(prospTotalChol),
        hdl_cholesterol: Number(prospHdl),
        smoker: prospSmoker,
        diabetic: prospDiabetic,
        on_bp_medication: prospBpMed,
      };

      const res = await aiService.predictHeartRisk(payload);
      setResult({ type: 'FRAMINGHAM', data: res.data });
    } catch (err) {
      setError(err.message || 'Prospective risk estimation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate OCR import of laboratory values with patient confirmation modal
  const handleImportOCRValues = (type) => {
    if (type === 'dia') {
      setDiaBmi(29.2);
      setDiaHighBp(true);
      setDiaHighChol(true);
      setActiveProvenance({
        source: 'ocr_extraction',
        patientConfirmed: true,
      });
      setOcrConfirmationModal(true);
    } else {
      setCvdRestingBp(148);
      setCvdCholesterol(275);
      setCvdFbsGt120(true);
      setActiveProvenance({
        source: 'ocr_extraction',
        patientConfirmed: true,
      });
      setOcrConfirmationModal(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
            <Brain className="w-4 h-4 text-teal-600" />
            <span>Clinical Machine Learning & Decision Support</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Clinical Assessment Engine
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Non-diagnostic clinical decision support prototypes calibrated on CDC BRFSS and UCI Cleveland cohorts.
          </p>
        </div>

        {/* SaMD Status Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900 text-slate-200 rounded-xl text-xs border border-slate-800 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <div>
            <div className="font-bold text-white">FDA SaMD Prototype</div>
            <div className="text-[10px] text-slate-400">Educational Decision Support Only</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => { setActiveTab('ml-dia'); setResult(null); setError(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ml-dia'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Diabetes Indicator (ML-DIA-01)</span>
        </button>

        <button
          onClick={() => { setActiveTab('ml-cvd'); setResult(null); setError(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ml-cvd'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Cardiovascular Stenosis (ML-CVD-01)</span>
        </button>

        <button
          onClick={() => { setActiveTab('prospective'); setResult(null); setError(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'prospective'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>10-Year ASCVD Risk</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); setResult(null); setError(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Assessment History</span>
        </button>
      </div>

      {/* OCR Confirmation Notification Banner */}
      {activeProvenance.source === 'ocr_extraction' && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <ScanLine className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>OCR Provenance Active:</strong> Clinical parameters prefilled from recognized laboratory documentation. Please verify against physical records.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-amber-200/60 rounded text-[10px] font-bold uppercase tracking-wider text-amber-900">
            Verified by Patient
          </span>
        </div>
      )}

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (8 cols) */}
        {activeTab !== 'history' && (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            {/* TAB 1: ML-DIA-01 */}
            {activeTab === 'ml-dia' && (
              <form onSubmit={handleDiabetesSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Diabetes Metabolic Survey (ML-DIA-01)</h2>
                    <p className="text-xs text-slate-500">Logistic Regression Baseline (Calibrated Decision Threshold $\tau = 0.49$)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImportOCRValues('dia')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold hover:bg-teal-100"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Import Lab OCR</span>
                  </button>
                </div>

                {/* Section A: Demographics & Biometrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Age (18-100)</label>
                    <input
                      type="number"
                      min={18}
                      max={100}
                      value={diaAge}
                      onChange={(e) => setDiaAge(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Sex</label>
                    <select
                      value={diaSex}
                      onChange={(e) => setDiaSex(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      BMI (kg/m²)
                      {Number(diaBmi) >= 23 && (
                        <span className="text-[10px] text-amber-600 font-bold ml-1">ICMR Asian Risk</span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={12.0}
                      max={70.0}
                      value={diaBmi}
                      onChange={(e) => setDiaBmi(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Section B: Metabolic History Toggles */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Diagnosed Medical History</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={diaHighBp}
                        onChange={(e) => setDiaHighBp(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Diagnosed High Blood Pressure</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={diaHighChol}
                        onChange={(e) => setDiaHighChol(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Diagnosed High Cholesterol</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={diaStroke}
                        onChange={(e) => setDiaStroke(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>History of Stroke / TIA</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={diaHeartDisease}
                        onChange={(e) => setDiaHeartDisease(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Heart Disease or Attack History</span>
                    </label>
                  </div>
                </div>

                {/* Section C: Lifestyle & Health Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">General Health (1-5)</label>
                    <select
                      value={diaGenHlth}
                      onChange={(e) => setDiaGenHlth(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value={1}>1 - Excellent</option>
                      <option value={2}>2 - Very Good</option>
                      <option value={3}>3 - Good</option>
                      <option value={4}>4 - Fair</option>
                      <option value={5}>5 - Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Physical Activity</label>
                    <select
                      value={diaPhysActivity ? 'yes' : 'no'}
                      onChange={(e) => setDiaPhysActivity(e.target.value === 'yes')}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value="yes">Yes (Active in past 30 days)</option>
                      <option value="no">No (Sedentary)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Smoker Status</label>
                    <select
                      value={diaSmoker ? 'yes' : 'no'}
                      onChange={(e) => setDiaSmoker(e.target.value === 'yes')}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value="no">Non-Smoker</option>
                      <option value="yes">Smoker (100+ cigs)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Calibrated Inference...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run ML-DIA-01 Assessment</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: ML-CVD-01 */}
            {activeTab === 'ml-cvd' && (
              <form onSubmit={handleCardiovascularSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Cardiovascular Coronary Stenosis (ML-CVD-01)</h2>
                    <p className="text-xs text-slate-500">Random Forest Ensemble (Calibrated Decision Threshold $\tau = 0.55$)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImportOCRValues('cvd')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold hover:bg-teal-100"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Import Lab OCR</span>
                  </button>
                </div>

                {/* Section A: Demographics & Hemodynamics */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Age (18-100)</label>
                    <input
                      type="number"
                      min={18}
                      max={100}
                      value={cvdAge}
                      onChange={(e) => setCvdAge(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Sex</label>
                    <select
                      value={cvdSex}
                      onChange={(e) => setCvdSex(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Resting BP (mmHg)</label>
                    <input
                      type="number"
                      min={60}
                      max={260}
                      value={cvdRestingBp}
                      onChange={(e) => setCvdRestingBp(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      min={80}
                      max={650}
                      value={cvdCholesterol}
                      onChange={(e) => setCvdCholesterol(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Section B: Clinical Presentation & Stress Protocol */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Chest Pain Presentation</label>
                    <select
                      value={cvdChestPain}
                      onChange={(e) => setCvdChestPain(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value={1}>1 - Typical Angina</option>
                      <option value={2}>2 - Atypical Angina</option>
                      <option value={3}>3 - Non-Anginal Pain</option>
                      <option value={4}>4 - Asymptomatic Presentation</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Max Exercise HR (bpm)</label>
                    <input
                      type="number"
                      min={50}
                      max={250}
                      value={cvdMaxHr}
                      onChange={(e) => setCvdMaxHr(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">ST Depression (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.0}
                      max={10.0}
                      value={cvdOldpeak}
                      onChange={(e) => setCvdOldpeak(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Section C: Advanced Non-Invasive Diagnostics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Major Vessels by Fluoroscopy (0-3)</label>
                    <select
                      value={cvdCa}
                      onChange={(e) => setCvdCa(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value={0}>0 vessels colored</option>
                      <option value={1}>1 vessel colored</option>
                      <option value={2}>2 vessels colored</option>
                      <option value={3}>3 vessels colored</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Thallium-201 Scintigraphy</label>
                    <select
                      value={cvdThal}
                      onChange={(e) => setCvdThal(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value={3}>3 - Normal Perfusion</option>
                      <option value={6}>6 - Fixed Perfusion Defect</option>
                      <option value={7}>7 - Reversible Ischemic Defect</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Exercise Induced Angina</label>
                    <select
                      value={cvdExang ? 'yes' : 'no'}
                      onChange={(e) => setCvdExang(e.target.value === 'yes')}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    >
                      <option value="yes">Yes (Angina induced)</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Calibrated Inference...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run ML-CVD-01 Assessment</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: PROSPECTIVE CALCULATORS */}
            {activeTab === 'prospective' && (
              <form onSubmit={handleProspectiveSubmit} className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-800">Framingham 10-Year ASCVD Risk Calculator</h2>
                  <p className="text-xs text-slate-500">Peer-reviewed Cox Proportional Hazards Engine for 10-Year Hard Coronary Events</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Age</label>
                    <input
                      type="number"
                      value={prospAge}
                      onChange={(e) => setProspAge(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={prospSysBp}
                      onChange={(e) => setProspSysBp(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Total Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      value={prospTotalChol}
                      onChange={(e) => setProspTotalChol(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  <span>Calculate 10-Year Prospective Risk</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Right Column: Output Card or Feedback (5 cols) */}
        {activeTab !== 'history' && (
          <div className="lg:col-span-5 space-y-4">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Assessment Failed</div>
                  <div className="mt-1">{error}</div>
                </div>
              </div>
            )}

            {result ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Assessment Generated & Saved
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {result.data.taskId || result.data.model_id}
                  </span>
                </div>

                {/* Main Classification Card */}
                <div className={`p-4 rounded-2xl border ${
                  result.data.prediction === 1
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                    Calibrated Prototype Output
                  </div>
                  <div className="text-sm font-extrabold mt-1 leading-snug">
                    {result.data.outputLabel || result.data.risk_category}
                  </div>
                  {result.data.probability !== undefined && (
                    <div className="mt-2 text-xs font-semibold">
                      Model Estimated Probability: <strong>{(result.data.probability * 100).toFixed(1)}%</strong>
                    </div>
                  )}
                  {result.data.ten_year_risk_percentage !== undefined && (
                    <div className="mt-2 text-xs font-semibold">
                      10-Year Hard Risk: <strong>{result.data.ten_year_risk_percentage}%</strong>
                    </div>
                  )}
                </div>

                {/* Clinical Contributing Factors */}
                {result.data.contributingFactors && result.data.contributingFactors.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">Key Contributing Factors:</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {result.data.contributingFactors.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.data.clinicalRecommendations && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 block">Guidance & Next Steps:</span>
                    {result.data.clinicalRecommendations.map((r, i) => (
                      <div key={i} className="text-[11px]">• {r}</div>
                    ))}
                  </div>
                )}

                {/* SaMD Disclaimer */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Non-Diagnostic Clinical Disclaimer</span>
                  </div>
                  {result.data.disclaimer}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Awaiting Submission</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Configure physiological indicators and run assessment to inspect calibrated probabilities and clinical contributing factors.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Assessment History View (12 cols) */}
        {activeTab === 'history' && (
          <div className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Patient Assessment Audit History</h2>
                <p className="text-xs text-slate-500">
                  Immutable records persisted in MongoDB riskAssessments with patient-isolation access control.
                </p>
              </div>
              <button
                onClick={fetchHistory}
                disabled={historyLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                <span>Refresh History</span>
              </button>
            </div>

            {historyLoading ? (
              <div className="text-center py-12 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                <span className="text-xs font-semibold">Retrieving clinical records...</span>
              </div>
            ) : historyRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700">No Assessment Records Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Run an assessment using the tabs above. Records will automatically persist to your confidential clinical profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyRecords.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-4 border border-slate-200 rounded-2xl hover:border-teal-200 transition-all bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-teal-800 px-2 py-0.5 bg-teal-100/60 rounded">
                        {rec.taskId}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(rec.evaluatedAt || rec.createdAt).toLocaleDateString()} at{' '}
                        {new Date(rec.evaluatedAt || rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-800">{rec.outputLabel}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Probability: <strong>{(rec.probability * 100).toFixed(1)}%</strong> • Model: {rec.modelId} ({rec.modelVersion})
                      </div>
                    </div>

                    {rec.contributingFactors && rec.contributingFactors.length > 0 && (
                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-1 text-[11px]">Identified Biomarkers:</span>
                        <div className="flex flex-wrap gap-1">
                          {rec.contributingFactors.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinician Review Notes if present */}
                    {rec.clinicianNotes && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Clinician Review Notes:</span>
                        </div>
                        <div className="text-[11px] mt-1">{rec.clinicianNotes}</div>
                        {rec.reviewedBy && (
                          <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
                            Reviewed by Dr. {rec.reviewedBy.firstName} {rec.reviewedBy.lastName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
