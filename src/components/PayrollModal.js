import { useState, useEffect } from 'react';
import { X, Calendar, Banknote, Clock, Users, DollarSign } from 'lucide-react';
import axios from 'axios';
import PayrollAlert from './alerts/PayrollAlert';

export default function PayrollModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalHours: 0,
    totalSalary: 0
  });

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPeriodStart('');
      setPeriodEnd('');
      setPayrollData([]);
    }
  }, [isOpen]);

  const handleQuickSelect = (type) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    if (type === 'first-half') {
      setPeriodStart(`${year}-${String(month + 1).padStart(2, '0')}-01`);
      setPeriodEnd(`${year}-${String(month + 1).padStart(2, '0')}-15`);
    } else if (type === 'second-half') {
      const lastDay = new Date(year, month + 1, 0).getDate();
      setPeriodStart(`${year}-${String(month + 1).padStart(2, '0')}-16`);
      setPeriodEnd(`${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`);
    } else if (type === 'full-month') {
      const lastDay = new Date(year, month + 1, 0).getDate();
      setPeriodStart(`${year}-${String(month + 1).padStart(2, '0')}-01`);
      setPeriodEnd(`${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`);
    }
  };

  const calculatePayroll = async () => {
    if (!periodStart || !periodEnd) {
      setAlertType('error');
      setAlertMessage('Please select both start and end dates');
      setAlertOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/chronyxApi', {
        periodStart,
        periodEnd
      }, {
        headers: { 'X-Action': 'calculate-payroll' }
      });

      if (response.data.success) {
        setPayrollData(response.data.data);
        setSummary(response.data.summary);
        setStep(2);
      }
    } catch (error) {
      console.error('Calculate payroll error:', error);
      setAlertType('error');
      setAlertMessage(error.response?.data?.message || 'Failed to calculate payroll');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/chronyxApi', {
        periodStart,
        periodEnd,
        payrollData
      }, {
        headers: { 'X-Action': 'generate-payroll' }
      });

      if (response.data.success) {
        setAlertType('success');
        setAlertMessage('Payroll generated successfully!');
        setAlertOpen(true);
        
        // Wait for alert to show, then close modal
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Generate payroll error:', error);
      setAlertType('error');
      setAlertMessage(error.response?.data?.message || 'Failed to generate payroll');
      setAlertOpen(true);
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

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Banknote className="w-7 h-7 text-[#0A7EB1]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Payroll Management</h2>
              <p className="text-white/80 text-sm">
                {step === 1 ? 'Select payroll period' : 'Review and generate payroll'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 1 ? 'text-[#0A7EB1]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === 1 ? 'bg-[#0A7EB1] text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium">Select Period</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step === 2 ? 'text-[#0A7EB1]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === 2 ? 'bg-[#0A7EB1] text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium">Review & Generate</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Quick Select */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Quick Select Period
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleQuickSelect('first-half')}
                    className="p-5 border-2 border-gray-200 rounded-2xl hover:border-[#0A7EB1] hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-[#0A7EB1] transition-colors">
                        <Calendar className="w-6 h-6 text-[#0A7EB1] group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">First Half</p>
                        <p className="text-sm text-gray-500">1st - 15th of month</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickSelect('second-half')}
                    className="p-5 border-2 border-gray-200 rounded-2xl hover:border-[#0A7EB1] hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-[#0A7EB1] transition-colors">
                        <Calendar className="w-6 h-6 text-[#0A7EB1] group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Second Half</p>
                        <p className="text-sm text-gray-500">16th - End of month</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickSelect('full-month')}
                    className="p-5 border-2 border-gray-200 rounded-2xl hover:border-[#0A7EB1] hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-[#0A7EB1] transition-colors">
                        <Calendar className="w-6 h-6 text-[#0A7EB1] group-hover:text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Full Month</p>
                        <p className="text-sm text-gray-500">Entire month</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or select custom dates</span>
                </div>
              </div>

              {/* Custom Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Period Start Date
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-500 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Period End Date
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    min={periodStart}
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-500 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Selected Period Display */}
              {periodStart && periodEnd && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Calendar className="w-6 h-6 text-[#0A7EB1]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Selected Period</p>
                      <p className="text-lg font-bold text-[#0A7EB1]">
                        {new Date(periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        {' → '}
                        {new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">Total Employees</p>
                      <p className="text-4xl font-bold text-blue-900">{summary.totalEmployees}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-700 mb-1">Total Hours</p>
                      <p className="text-4xl font-bold text-green-900">{summary.totalHours.toFixed(2)}</p>
                    </div>
                    <Clock className="w-12 h-12 text-green-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-700 mb-1">Total Salary</p>
                      <p className="text-3xl font-bold text-purple-900">{formatCurrency(summary.totalSalary)}</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Payroll Table */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Days</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hours</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rate</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Gross Salary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payrollData.map((employee) => (
                        <tr key={employee.employee_id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                           <div className="flex items-center">
  {employee.avatar_url ? (
    <img 
      src={employee.avatar_url} 
      alt={`${employee.first_name} ${employee.last_name}`}
      className="w-10 h-10 rounded-full object-cover mr-3"
    />
  ) : (
    <div className="w-10 h-10 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center mr-3">
      <span className="text-white text-sm font-semibold">
        {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
      </span>
    </div>
  )}
  <div>
    <p className="font-bold text-gray-800">
      {employee.first_name} {employee.last_name}
    </p>
    <p className="text-sm text-gray-500">{employee.email}</p>
  </div>
</div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-700">
                            {employee.days_worked} days
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-gray-800">
                            {formatTime(employee.total_hours)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {formatCurrency(employee.hourly_rate)}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(employee.gross_salary)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-8 py-5 bg-gray-50">
          <div className="flex items-center justify-between">
            {step === 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={calculatePayroll}
                  disabled={!periodStart || !periodEnd || loading}
                  className="px-8 py-3 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Calculating...' : 'Calculate Payroll'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Back
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generatePayroll}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Payroll'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Payroll Alert */}
      <PayrollAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        type={alertType}
        message={alertMessage}
      />
    </div>
  );
}