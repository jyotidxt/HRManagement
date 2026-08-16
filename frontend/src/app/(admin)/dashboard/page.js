"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, UserCheck, UserMinus, Calendar, Loader2, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { authenticatedFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authenticatedFetch('/dashboard/stats');
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-red-400 gap-2">
        <AlertCircle className="h-6 w-6" />
        <span>{error}</span>
      </div>
    );
  }

  const { totalEmployees, activeEmployees, inactiveEmployees, departmentStats, attendanceStats } = stats || {};

  // Calculate percentages
  const presentPct = activeEmployees > 0 ? Math.round((attendanceStats?.present / activeEmployees) * 100) : 0;
  const absentPct = activeEmployees > 0 ? Math.round((attendanceStats?.absent / activeEmployees) * 100) : 0;
  const leavePct = activeEmployees > 0 ? Math.round((attendanceStats?.onLeave / activeEmployees) * 100) : 0;
  const unmarkedPct = activeEmployees > 0 ? Math.round((attendanceStats?.unmarked / activeEmployees) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Workforce Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time overview of employees and today's attendance stats.</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</p>
              <h3 className="text-4xl font-bold mt-2 text-white">{totalEmployees}</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 ring-1 ring-blue-500/20">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-slate-450">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> {activeEmployees} Active</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-650"></span> {inactiveEmployees} Inactive</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Today</p>
              <h3 className="text-4xl font-bold mt-2 text-emerald-450">{attendanceStats?.present}</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-500 ring-1 ring-emerald-500/20">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-450">
            <span>{presentPct}% of active workforce is logged in today.</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Absent / Leave</p>
              <h3 className="text-4xl font-bold mt-2 text-red-400">{attendanceStats?.absent + attendanceStats?.onLeave}</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-650/10 flex items-center justify-center text-red-500 ring-1 ring-red-500/20">
              <UserMinus className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-slate-455">
            <span className="text-red-405">{attendanceStats?.absent} Absent</span>
            <span className="text-amber-505">{attendanceStats?.onLeave} On Leave</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Statistics Details */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Today's Attendance Status
            </h3>
            
            <div className="space-y-5">
              {/* Progress Bars */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300">Present ({attendanceStats?.present})</span>
                  <span className="text-emerald-450 font-semibold">{presentPct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${presentPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300">Absent ({attendanceStats?.absent})</span>
                  <span className="text-red-450 font-semibold">{absentPct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${absentPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300">On Leave ({attendanceStats?.onLeave})</span>
                  <span className="text-amber-450 font-semibold">{leavePct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${leavePct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300">Unmarked ({attendanceStats?.unmarked})</span>
                  <span className="text-slate-500 font-semibold">{unmarkedPct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${unmarkedPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department-wise headcounts (Chart) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-6">Department Distribution</h3>
          {departmentStats?.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8 font-medium">No employee records in database.</p>
          ) : (
            <div className="space-y-4">
              {departmentStats?.map((dept, index) => {
                const maxCount = Math.max(...departmentStats.map(d => d.count), 1);
                const percentWidth = Math.round((dept.count / maxCount) * 100);
                
                // Color variations
                const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-teal-500'];
                const color = colors[index % colors.length];

                return (
                  <div key={dept.department} className="flex items-center gap-4 animate-scale-up">
                    <div className="w-24 text-sm text-slate-300 truncate">{dept.department}</div>
                    <div className="flex-1 h-7 bg-slate-800/80 rounded-md overflow-hidden flex items-center pr-3 relative border border-slate-850">
                      <div className={`h-full ${color} rounded-r-md transition-all duration-500`} style={{ width: `${percentWidth}%` }}></div>
                      <span className="absolute right-3 text-xs font-extrabold text-slate-200">{dept.count} {dept.count === 1 ? 'employee' : 'employees'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
