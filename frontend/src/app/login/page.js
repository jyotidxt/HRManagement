"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[128px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[128px]"></div>

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700/80">
        {/* Logo/Brand header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20 mb-3">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Pramyan HR Admin
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to access your HR Management Dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pramyan.com"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-3.5 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-3.5 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3.5 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-850 pt-4">
          Demo Credentials: <span className="font-mono text-slate-400">admin@pramyan.com</span> / <span className="font-mono text-slate-400">admin123</span>
        </div>
      </div>
    </main>
  );
}
