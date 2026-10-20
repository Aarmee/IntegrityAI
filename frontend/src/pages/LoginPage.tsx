import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/axios';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if session expired or message in query string
  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('session_expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await login(email, password);
      success(`Welcome back, ${data.name || email}!`);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-gradient-to-b from-zinc-50 via-white to-zinc-100">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: Creative Showcase, Visual Proof & Highlights */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 relative p-8 sm:p-12 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col justify-between overflow-hidden">
          
          {/* Subtle Ambient Glowing Background Orbs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Tagline */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Next-Gen Academic Integrity Platform</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                  Integrity<span className="text-red-500">AI</span>
                </h1>
                <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase">
                  Cloud Microservices & Multi-Signal NLP
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 max-w-lg leading-relaxed pt-2 font-normal">
              Autonomous evaluation architecture cross-examining coursework against peer submissions, detecting ChatGPT generative patterns, and rendering in-document Turnitin-grade highlights.
            </p>
          </div>

          {/* Middle: Live Interactive Integrity Preview Card */}
          <div className="relative z-10 my-8 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md shadow-2xl space-y-3 max-w-lg">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <FileText className="w-4 h-4 text-red-400" />
                <span>Real-Time Evaluation Engine</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                Turnitin Canvas Active
              </span>
            </div>

            {/* Document Snippet Demo */}
            <div className="space-y-1.5 text-xs text-zinc-300 font-sans leading-relaxed">
              <p className="text-zinc-400 font-mono text-[11px]">Devops_lifecycle.docx</p>
              <p>
                1. Microservices Architecture enables independent scaling of services.{' '}
                <span className="bg-amber-300 text-black px-1.5 py-0.5 rounded-xs font-semibold border-b-2 border-amber-500">
                  Measure response times, throughput, and resource use under scale.
                </span>{' '}
                Observations recorded live.
              </p>
            </div>

            {/* Micro Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Text Sim</div>
                <div className="text-xs font-extrabold text-emerald-400">0.0% Match</div>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">AI Pattern</div>
                <div className="text-xs font-extrabold text-amber-400">95% High Risk</div>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Highlights</div>
                <div className="text-xs font-extrabold text-white">32 Sentences</div>
              </div>
            </div>
          </div>

          {/* Bottom: Architecture Value Pillars */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Signal Perplexity</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Peer Collusion Check</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Role-Based Access</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Sign-In Form                                */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center bg-white space-y-6">
          
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Enter your institutional email and password to access your account.
            </p>
          </div>

          {sessionExpired && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              Your session has expired. Please sign in again to continue.
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-black placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-300 rounded-xl text-black placeholder-zinc-400 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-zinc-600 pt-2 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-600 hover:underline font-bold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
