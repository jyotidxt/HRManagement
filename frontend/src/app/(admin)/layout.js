"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-sm text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pl-64">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Panel */}
      <div className="min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-850 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">HR Admin Panel</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
