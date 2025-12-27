import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, Users, Calendar, Banknote, Clock } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import PayrollModal from '../../components/PayrollModal';

export default function Payroll() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('payroll');
  const [adminName, setAdminName] = useState('');
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayrollModal, setShowPayrollModal] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    const admin = JSON.parse(adminData);
    setAdminName(admin.name);
    loadPayrollRecords();
  }, []);

  const loadPayrollRecords = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      paid: 'bg-blue-100 text-blue-700'
    };
    return styles[status] || styles.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#0A7EB1] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading payroll records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} adminName={adminName} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage employee compensation and salary records</p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPayrollModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Banknote className="w-5 h-5" />
                <span>Generate Payroll</span>
              </button>
            
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {payrollRecords.length > 0 ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Payroll Records</p>
                      <p className="text-3xl font-bold text-gray-800">{payrollRecords.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-[#0A7EB1]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Hours Paid</p>
                      <p className="text-3xl font-bold text-green-600">
                        {payrollRecords.reduce((sum, record) => sum + parseFloat(record.total_hours), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Amount Paid</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(payrollRecords.reduce((sum, record) => sum + parseFloat(record.gross_salary), 0))}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                      <Banknote className="w-7 h-7 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payroll Records Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Payroll Records</h2>
                  <span className="text-sm text-gray-500">All generated payroll records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Hours</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hourly Rate</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gross Salary</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deductions</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Salary</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payrollRecords.map((record) => (
                        <tr key={record.payroll_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center">
  {record.avatar_url ? (
    <img 
      src={record.avatar_url} 
      alt={`${record.first_name} ${record.last_name}`}
      className="w-10 h-10 rounded-full object-cover mr-3"
    />
  ) : (
    <div className="w-10 h-10 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center mr-3">
      <span className="text-white text-sm font-semibold">
        {record.first_name.charAt(0)}{record.last_name.charAt(0)}
      </span>
    </div>
  )}
  <div>
    <p className="font-semibold text-gray-800">
      {record.first_name} {record.last_name}
    </p>
    <p className="text-sm text-gray-500">{record.email}</p>
  </div>
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
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Banknote className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Payroll Records Yet</h3>
                <p className="text-gray-600 mb-8">
                  Generate your first payroll to calculate employee salaries based on their attendance records.
                </p>
                <button
                  onClick={() => setShowPayrollModal(true)}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  <Banknote className="w-5 h-5" />
                  <span>Generate Your First Payroll</span>
                </button>
                
                <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-left">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How Payroll Generation Works:
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <p className="font-semibold text-gray-800">Select Payroll Period</p>
                        <p className="text-sm text-gray-600">Choose the date range for salary calculation (e.g., December 1-15, 2025)</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <p className="font-semibold text-gray-800">Automatic Calculation</p>
                        <p className="text-sm text-gray-600">System calculates work hours from time-in/time-out attendance records</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <p className="font-semibold text-gray-800">Review & Verify</p>
                        <p className="text-sm text-gray-600">Review total hours and calculated salaries for each employee</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                      <div>
                        <p className="font-semibold text-gray-800">Generate & Save</p>
                        <p className="text-sm text-gray-600">Generate payroll to save records to the database for future reference</p>
                      </div>
                    </div>
                  </div>
                </div>
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
          loadPayrollRecords();
        }} 
      />
    </div>
  );
}