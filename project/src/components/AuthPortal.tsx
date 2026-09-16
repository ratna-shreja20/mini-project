import { useState } from 'react';
import {
  ShieldCheck,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ScanLine,
  FileSearch,
  CheckCircle2,
} from 'lucide-react';
import type { LoginPayload, SignupPayload, User } from '@/types';
import { login, signup } from '@/lib/api';

interface Props {
  onAuth: (user: User) => void;
}

type Tab = 'login' | 'signup';

export default function AuthPortal({ onAuth }: Props) {
  const [tab, setTab] = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        const payload: LoginPayload = { username, password };
        const res = await login(payload);
        onAuth({ user_id: res.user_id, username: res.username, role: res.role });
      } else {
        const payload: SignupPayload = { username, password, role };
        const res = await signup(payload);
        onAuth({ user_id: res.user_id, username: res.username, role: res.role });
      }
    } catch {
      setError('Authentication failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left: branding / feature highlights */}
          <div className="hidden flex-col gap-8 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CertGuard AI</h1>
                <p className="text-sm text-slate-500">
                  Academic Certificate Forgery Detection
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold leading-tight text-slate-900">
              Detect forged certificates with
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}AI-powered precision
              </span>
            </h2>
            <p className="text-slate-600">
              Upload academic documents and let our multi-layer analysis engine
              verify authenticity through Error Level Analysis, OCR text
              extraction, and font alignment checks.
            </p>

            <div className="space-y-4">
              {[
                { icon: ScanLine, title: 'Error Level Analysis', desc: 'Detects pixel-level tampering artifacts' },
                { icon: FileSearch, title: 'OCR Text Extraction', desc: 'Extracts and validates document text' },
                { icon: CheckCircle2, title: 'Confidence Scoring', desc: 'Detailed verdict with anomaly metrics' },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                      <Icon className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{f.title}</p>
                      <p className="text-sm text-slate-500">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: auth form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
              {/* Mobile logo */}
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">CertGuard AI</h1>
                  <p className="text-xs text-slate-500">Forgery Detection System</p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => { setTab('login'); setError(null); }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    tab === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setTab('signup'); setError(null); }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    tab === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <h2 className="mb-1 text-xl font-bold text-slate-900">
                {tab === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {tab === 'login'
                  ? 'Sign in to access the verification dashboard.'
                  : 'Register to start detecting forged certificates.'}
              </p>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {tab === 'signup' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-sky-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    tab === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-slate-400">
                Connects to FastAPI backend at 127.0.0.1:8000.
                <br />
                Runs in standalone demo mode if backend is offline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
