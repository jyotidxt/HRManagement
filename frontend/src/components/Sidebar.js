"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Users, CalendarDays, LogOut, Briefcase } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: CalendarDays },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen border-r border-slate-850 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between">
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-850">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-white tracking-wider">PRAMYAN</span>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Details & Log out */}
      <div className="p-4 border-t border-slate-850 bg-slate-950/40">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed In As</p>
          <p className="text-sm font-medium text-slate-350 truncate" title={user?.email}>
            {user?.email || 'admin@pramyan.com'}
          </p>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
