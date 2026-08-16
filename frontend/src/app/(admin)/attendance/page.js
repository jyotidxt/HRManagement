"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Calendar, UserCheck, UserX, Loader2, AlertCircle, Clock, Eye, X } from 'lucide-react';

export default function AttendancePage() {
  const { authenticatedFetch } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date state (defaults to today in local YYYY-MM-DD format)
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getTodayString());
  const [markingIds, setMarkingIds] = useState({}); // Tracking loading states for buttons
  
  // History Modal state
  const [historyEmployee, setHistoryEmployee] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch active employees
      const empRes = await authenticatedFetch('/employees?status=Active');
      if (!empRes.ok) throw new Error('Failed to load active employee list');
      const empData = await empRes.json();
      setEmployees(empData);

      // 2. Fetch attendance logs for selected date
      const attRes = await authenticatedFetch(`/attendance/date?date=${date}`);
      if (!attRes.ok) throw new Error('Failed to load attendance records');
      const attData = await attRes.json();
      
      // Convert array to simple lookup object: { employeeId: status }
      const attLookup = {};
      attData.forEach(record => {
        if (record.employee) {
          attLookup[record.employee._id] = record.status;
        }
      });
      setAttendance(attLookup);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const handleMarkStatus = async (employeeId, status) => {
    setMarkingIds(prev => ({ ...prev, [employeeId]: status }));
    try {
      const res = await authenticatedFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          date,
          status
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update attendance status');
      }

      // Update local state lookup
      setAttendance(prev => ({ ...prev, [employeeId]: status }));
    } catch (err) {
      alert(err.message);
    } finally {
      setMarkingIds(prev => {
        const updated = { ...prev };
        delete updated[employeeId];
        return updated;
      });
    }
  };

  const openHistoryModal = async (employee) => {
    setHistoryEmployee(employee);
    setHistoryLoading(true);
    try {
      const res = await authenticatedFetch(`/attendance/employee/${employee._id}`);
      if (!res.ok) throw new Error('Failed to load attendance history');
      const data = await res.json();
      setHistoryLogs(data);
    } catch (err) {
      alert(err.message);
      setHistoryEmployee(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Calculate day summary metrics
  const totalActive = employees.length;
  const presentCount = Object.values(attendance).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'Absent').length;
  const leaveCount = Object.values(attendance).filter(s => s === 'On Leave').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Attendance Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Review, mark, and track workforce attendance history.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 shadow-md">
          <Calendar className="h-4.5 w-4.5 text-blue-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer focus:text-white"
          />
        </div>
      </div>

      {/* Selected Date Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/10 p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="text-center p-3 border-r border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase">Active Staff</p>
          <p className="text-2xl font-bold mt-1 text-white">{totalActive}</p>
        </div>
        <div className="text-center p-3 border-r border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase">Present</p>
          <p className="text-2xl font-bold mt-1 text-emerald-450">{presentCount}</p>
        </div>
        <div className="text-center p-3 border-r border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase">Absent</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{absentCount}</p>
        </div>
        <div className="text-center p-3">
          <p className="text-xs font-semibold text-slate-400 uppercase">On Leave</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">{leaveCount}</p>
        </div>
      </div>

      {/* Attendance Table */}
      {loading && employees.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="flex h-[40vh] items-center justify-center text-red-400 gap-2">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
          <p className="text-sm font-semibold mb-1">No active employees found</p>
          <p className="text-xs">Add active employees in the directory page first.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/25 shadow-md">
          <table className="w-full border-collapse text-left text-sm text-slate-350">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 font-semibold text-slate-400">
                <th className="py-4 px-6">Name / ID</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Current Status</th>
                <th className="py-4 px-6 text-center">Mark Attendance</th>
                <th className="py-4 px-6 text-right">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {employees.map((emp) => {
                const currentStatus = attendance[emp._id];
                const activeMarking = markingIds[emp._id];

                return (
                  <tr key={emp._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{emp.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{emp.employeeId}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">{emp.department}</td>
                    <td className="py-4 px-6">
                      {currentStatus ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          currentStatus === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : currentStatus === 'Absent'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {currentStatus}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2 py-0.5 text-xs font-medium text-slate-500">
                          Unmarked
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleMarkStatus(emp._id, 'Present')}
                          disabled={activeMarking}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-555 text-emerald-950 font-extrabold shadow-sm shadow-emerald-500/10'
                              : 'bg-slate-800 hover:bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {activeMarking === 'Present' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                          Present
                        </button>
                        <button
                          onClick={() => handleMarkStatus(emp._id, 'Absent')}
                          disabled={activeMarking}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            currentStatus === 'Absent'
                              ? 'bg-red-600 text-white shadow-sm shadow-red-600/10'
                              : 'bg-slate-800 hover:bg-red-500/10 text-red-400'
                          }`}
                        >
                          {activeMarking === 'Absent' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserX className="h-3.5 w-3.5" />
                          )}
                          Absent
                        </button>
                        <button
                          onClick={() => handleMarkStatus(emp._id, 'On Leave')}
                          disabled={activeMarking}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            currentStatus === 'On Leave'
                              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/10'
                              : 'bg-slate-800 hover:bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {activeMarking === 'On Leave' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                          Leave
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openHistoryModal(emp)}
                        className="text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                        title="View Attendance Logs"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendance History Modal */}
      {historyEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scale-up">
            <button
              onClick={() => { setHistoryEmployee(null); setHistoryLogs([]); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white">Attendance Logs</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{historyEmployee.name} ({historyEmployee.employeeId})</p>

            <div className="mt-6 border-t border-slate-800 pt-4 max-h-[50vh] overflow-y-auto">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : historyLogs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No logs on record for this employee.</p>
              ) : (
                <div className="space-y-3 pr-2">
                  {historyLogs.map(log => (
                    <div key={log._id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/20">
                      <span className="text-sm text-slate-350 font-medium">
                        {new Date(log.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        log.status === 'Present'
                          ? 'bg-emerald-500/10 text-emerald-450'
                          : log.status === 'Absent'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
