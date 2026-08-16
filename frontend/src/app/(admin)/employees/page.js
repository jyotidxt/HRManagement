"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, Edit2, Trash2, X, Loader2, AlertCircle } from 'lucide-react';

export default function EmployeesPage() {
  const { authenticatedFetch } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    department: 'Engineering',
    designation: '',
    email: '',
    phone: '',
    dateOfJoining: '',
    status: 'Active'
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Design', 'Operations'];

  const fetchEmployees = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (departmentFilter !== 'All') query.append('department', departmentFilter);
      if (statusFilter !== 'All') query.append('status', statusFilter);

      const res = await authenticatedFetch(`/employees?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch employee list');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, departmentFilter, statusFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      employeeId: '',
      department: 'Engineering',
      designation: '',
      email: '',
      phone: '',
      dateOfJoining: '',
      status: 'Active'
    });
    setFormError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await authenticatedFetch('/employees', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to create employee');
      
      setIsAddModalOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await authenticatedFetch(`/employees/${currentEmployee._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to update employee');

      setIsEditModalOpen(false);
      resetForm();
      setCurrentEmployee(null);
      fetchEmployees();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    // Format date string from DB to YYYY-MM-DD
    const dateFormatted = employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : '';
    
    setFormData({
      name: employee.name,
      employeeId: employee.employeeId,
      department: employee.department,
      designation: employee.designation,
      email: employee.email,
      phone: employee.phone,
      dateOfJoining: dateFormatted,
      status: employee.status
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee record? This will permanently delete their records.')) return;
    
    try {
      const res = await authenticatedFetch(`/employees/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete employee');
      }
      fetchEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Employee Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Manage employee personal records, roles, and status.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 px-4 text-sm font-semibold text-white transition-all duration-200 cursor-pointer w-fit shadow-md shadow-blue-600/10"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or employee ID..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
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
          <p className="text-sm font-semibold mb-1">No employees found</p>
          <p className="text-xs">Try refining your search or add a new employee record.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/25 shadow-md">
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 font-semibold text-slate-400">
                <th className="py-4 px-6">Name / ID</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Designation</th>
                <th className="py-4 px-6">Email / Phone</th>
                <th className="py-4 px-6">Joining Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{emp.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{emp.employeeId}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-medium">{emp.department}</td>
                  <td className="py-4 px-6 text-slate-300">{emp.designation}</td>
                  <td className="py-4 px-6">
                    <div className="text-slate-300">{emp.email}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{emp.phone}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {new Date(emp.dateOfJoining).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                      emp.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-750/10 text-slate-455 border border-slate-700/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-450' : 'bg-slate-455'}`}></span>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3.5">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scale-up">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Add New Employee</h2>
            
            {formError && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="PRM-001"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-300 outline-none focus:border-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Software Engineer"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="johndoe@pramyan.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-350 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-300 outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-2 mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-800 hover:bg-slate-850 px-4 py-2 text-sm font-semibold text-slate-400 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm font-semibold text-white cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scale-up">
            <button
              onClick={() => { setIsEditModalOpen(false); setCurrentEmployee(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Edit Employee Record</h2>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-850 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-300 outline-none focus:border-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-350 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-300 outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-2 mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-800 hover:bg-slate-850 px-4 py-2 text-sm font-semibold text-slate-400 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm font-semibold text-white cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
