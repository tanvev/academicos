import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, ShieldCheck, Mail, Lock, User, ArrowRight, UserPlus, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, signup, googleSignIn, users, switchUser } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      const res = signup(email, password, name);
      if (!res.success) {
        setError(res.error || 'Failed to create account');
      }
    } else if (mode === 'signin') {
      const res = login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    } else if (mode === 'forgot') {
      setSuccessMsg(`If an account exists for ${email}, password reset instructions have been sent.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500 text-black font-bold shadow-[0_0_20px_rgba(45,212,191,0.3)] mb-2">
            <Zap className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Academicos</h1>
          <p className="text-xs text-teal-400 font-mono tracking-wider uppercase">Your Academic Operating System</p>
        </div>

        {/* Existing Quick User Selection */}
        {users.length > 0 && mode === 'signin' && (
          <div className="space-y-2 pt-2 border-t border-[#27272A]">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center">
              Quick Switch Local Profiles
            </p>
            <div className="grid grid-cols-1 gap-2">
              {users.map((u) => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => switchUser(u.uid)}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-[#27272A] transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                </button>
              ))}
            </div>
            <div className="relative my-4 text-center">
              <span className="bg-[#18181B] px-3 text-[10px] text-slate-500 font-mono uppercase relative z-10">Or sign in manually</span>
              <div className="absolute inset-0 top-1/2 border-t border-[#27272A]" />
            </div>
          </div>
        )}

        {/* Auth Mode Tabs */}
        <div className="flex bg-[#09090B] p-1 rounded-xl border border-[#27272A]">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center gap-2.5 text-teal-300 text-xs">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-In Option */}
        <button
          type="button"
          onClick={googleSignIn}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700/80 border border-[#27272A] rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative text-center my-2">
          <span className="bg-[#18181B] px-3 text-[10px] text-slate-500 font-mono uppercase relative z-10">
            Or continue with email
          </span>
          <div className="absolute inset-0 top-1/2 border-t border-[#27272A]" />
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Tanvi Sundarkar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] focus:border-teal-400 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-teal-400 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white outline-none"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] focus:border-teal-400 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white outline-none"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {mode === 'signup' && <UserPlus className="w-4 h-4" />}
            {mode === 'signin' && <ShieldCheck className="w-4 h-4" />}
            {mode === 'forgot' && <KeyRound className="w-4 h-4" />}
            <span>
              {mode === 'signup' && 'Create Academicos Account'}
              {mode === 'signin' && 'Sign In to Workspace'}
              {mode === 'forgot' && 'Send Reset Link'}
            </span>
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 border-t border-[#27272A] pt-4">
          Academicos &bull; Isolated Multi-User Academic Workspace
        </div>
      </div>
    </div>
  );
};
