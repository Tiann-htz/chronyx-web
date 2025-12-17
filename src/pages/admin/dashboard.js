import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, Users, LayoutDashboard, Calendar, QrCode, LogOut, Menu, X, Banknote } from 'lucide-react';
import axios from 'axios';
import PayrollModal from '../../components/PayrollModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalQRCodes: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(false);

  useEffect(() => {
    // Get admin info from localStorage
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    const admin = JSON.parse(adminData);
    setAdminName(admin.name);
    
    // Load dashboard data from database
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Load payroll records when payroll tab is active
    if (activeTab === 'payroll') {
      loadPayrollRecords();
    }
  }, [activeTab]);

  const loadPayrollRecords = async () => {
    setPayrollLoading(true);
    try {
      const response = await axios.get('/api/chronyxApi', { 
        headers: { 'X-Action': 'get-payroll-records' } 
      });

      if (response.data.success) {
        setPayrollRecords(response.data.data);
      }
    } catch (error) {
      console.error('Error loading payroll records:', error);
    } finally {
      setPayrollLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data from API
      const [employeesRes, attendanceRes, qrCodesRes] = await Promise.all([
        axios.get('/api/chronyxApi', { headers: { 'X-Action': 'get-employees' } }),
        axios.get('/api/chronyxApi', { headers: { 'X-Action': 'get-recent-attendance' } }),
        axios.get('/api/chronyxApi', { headers: { 'X-Action': 'get-qr-codes' } })
      ]);

      // Set employees data
      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.data);
        setStats(prev => ({ ...prev, totalEmployees: employeesRes.data.data.length }));
      }

      // Set attendance data
      if (attendanceRes.data.success) {
        setRecentAttendance(attendanceRes.data.data);
        
        // Calculate present/absent today
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendanceRes.data.data.filter(a => a.date === today);
        const uniqueUsers = [...new Set(todayAttendance.map(a => a.user_id))];
        setStats(prev => ({ 
          ...prev, 
          presentToday: uniqueUsers.length,
          absentToday: employeesRes.data.data.length - uniqueUsers.length
        }));
      }

      // Set QR codes data
      if (qrCodesRes.data.success) {
        const activeQRs = qrCodesRes.data.data.filter(qr => qr.is_active === 1);
        setStats(prev => ({ ...prev, totalQRCodes: activeQRs.length }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || styles.pending;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminData');
    router.push('/admin/login');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: Banknote },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-indigo-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-indigo-900 font-bold text-xl">S</span>
                </div>
                <span className="font-bold text-xl">Chronyx</span>
              </div>
            )}
            {!sidebarOpen && (
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto">
                <span className="text-indigo-900 font-bold text-xl">S</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${sidebarOpen ? 'px-6' : 'px-4 justify-center'} py-4 transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-700 border-l-4 border-white'
                    : 'hover:bg-indigo-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center ${sidebarOpen ? 'px-6' : 'px-4 justify-center'} py-4 border-t border-indigo-700 hover:bg-red-600 transition-colors`}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center space-x-6">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{adminName.charAt(0)}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{adminName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Employees</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.totalEmployees}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Present Today</p>
                      <p className="text-3xl font-bold text-green-600">{stats.presentToday}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Absent Today</p>
                      <p className="text-3xl font-bold text-red-600">{stats.absentToday}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Active QR Codes</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalQRCodes}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Attendance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800">Recent Attendance</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentAttendance.length > 0 ? (
                        recentAttendance.map((record) => (
                          <tr key={record.attendance_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                              {record.first_name} {record.last_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{record.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                record.action_type === 'time-in' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {record.action_type === 'time-in' ? 'Time In' : 'Time Out'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatTime(record.time)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(record.date)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            No attendance records yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Add Employee
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employees.map((employee) => (
                        <tr key={employee.employee_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">{employee.employee_id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {employee.first_name} {employee.last_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{employee.email}</td>
                         
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(employee.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">Attendance Records</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Full attendance records will be displayed here</p>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Payroll Management</h1>
                <button
                  onClick={() => setShowPayrollModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Banknote className="w-5 h-5" />
                  <span>Generate New Payroll</span>
                </button>
              </div>

              {payrollLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payroll records...</p>
                </div>
              ) : payrollRecords.length > 0 ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Payroll Records</p>
                          <p className="text-3xl font-bold text-gray-800">{payrollRecords.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Hours Paid</p>
                          <p className="text-3xl font-bold text-green-600">
                            {payrollRecords.reduce((sum, record) => sum + parseFloat(record.total_hours), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Amount Paid</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(payrollRecords.reduce((sum, record) => sum + parseFloat(record.gross_salary), 0))}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Banknote className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payroll Records Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-800">Payroll Records</h2>
                      <div className="text-sm text-gray-500">
                        Showing all generated payroll records
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Hours</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hourly Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gross Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deductions</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Net Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {payrollRecords.map((record) => (
                            <tr key={record.payroll_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {record.first_name} {record.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">{record.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <div>
                                  <p className="font-medium">{formatDate(record.period_start)}</p>
                                  <p className="text-xs text-gray-500">to {formatDate(record.period_end)}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                {formatHours(parseFloat(record.total_hours))}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatCurrency(parseFloat(record.hourly_rate))}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                {formatCurrency(parseFloat(record.gross_salary))}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatCurrency(parseFloat(record.deductions))}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-purple-600">
                                {formatCurrency(parseFloat(record.net_salary))}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Banknote className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Payroll Records Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Generate your first payroll to calculate employee salaries based on their attendance records.
                  </p>
                  <button
                    onClick={() => setShowPayrollModal(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Banknote className="w-5 h-5" />
                    <span>Generate Your First Payroll</span>
                  </button>
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      How it works:
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start">
                        <span className="mr-2">1.</span>
                        <span>Select a payroll period (e.g., December 1-15, 2025)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">2.</span>
                        <span>System automatically calculates work hours from time-in/time-out records</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">3.</span>
                        <span>Review total hours and calculated salaries for each employee</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">4.</span>
                        <span>Generate payroll to save records to the database</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'qr-codes' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">QR Code Management</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">QR code management will be displayed here</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Payroll Modal */}
      <PayrollModal 
        isOpen={showPayrollModal} 
        onClose={() => {
          setShowPayrollModal(false);
          // Reload payroll records after closing modal
          if (activeTab === 'payroll') {
            loadPayrollRecords();
          }
        }} 
      />
    </div>
  );
}