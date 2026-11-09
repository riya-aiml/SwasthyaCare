import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Stethoscope,
  ShieldCheck,
  Activity,
  Building2,
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HeartPulse,
  Brain,
  FileCheck,
} from 'lucide-react';

export default function Login({ onSwitchToRegister, onLoginSuccess }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    {
      role: 'patient',
      title: 'Patient Portal',
      name: 'Aarav Sharma',
      email: 'patient@swasthya.com',
      badge: 'Self-Booking & Triage',
      icon: User,
      color: 'teal',
    },
    {
      role: 'doctor',
      title: 'Clinician EHR',
      name: 'Dr. Rohan Verma, MD',
      email: 'doctor@swasthya.com',
      badge: 'Cardiology Specialist',
      icon: Stethoscope,
      color: 'blue',
    },
    {
      role: 'hospital_management',
      title: 'Management C-Suite',
      name: 'Pooja Nair',
      email: 'management@swasthya.com',
      badge: 'HIPAA Population Data',
      icon: Building2,
      color: 'emerald',
    },
    {
      role: 'admin',
      title: 'Platform Operations',
      name: 'Rajesh Gupta',
      email: 'admin@swasthya.com',
      badge: 'System Governance',
      icon: ShieldCheck,
      color: 'indigo',
    },
  ];

  const handleQuickLogin = async (email) => {
    setError('');
    setLoading(true);
    try {
      await login(email, 'Password123');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Quick login failed. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Col: Brand Presentation & Clinical Architecture */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-inner">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                SwasthyaCare
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-widest">
                  v1.0 Release
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Enterprise Clinical Healthcare & AI Decision Platform
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Engineered for high-reliability medical operations: atomic appointment concurrency,
            post-discharge follow-up recovery tracking, and statistical clinical risk intelligence.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Atomic CAS slot reservation eliminating double-booking races</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span>Framingham ASCVD 10-Yr Heart & FINDRISC Diabetes Risk Models</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <FileCheck className="w-3.5 h-3.5" />
              </div>
              <span>HIPAA de-identified aggregate reporting for executive leadership</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-teal-400 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Gateway Online (Port 3001)
            </div>
            Node.js Express + MongoDB 7.0 + Python FastAPI AI Microservice (Port 8000)
          </div>
        </div>

        {/* Right Col: Sign-in Card with Instant Persona Switching */}
        <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sign In to SwasthyaCare
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a pre-seeded institutional demo role or enter your credentials.
            </p>
          </div>

          {/* Quick Demo Role Picker Grid */}
          <div className="mt-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Instant 1-Click Institutional Access
              </span>
              <span className="text-[11px] text-teal-600 font-semibold">
                Password: Password123
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((acc) => {
                const IconComponent = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email)}
                    disabled={loading}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-left transition-all group shadow-sm disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-teal-100 group-hover:text-teal-800 text-slate-600">
                        {acc.badge}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {acc.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or sign in manually
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@swasthya.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Need an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2"
            >
              Register New Patient Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
