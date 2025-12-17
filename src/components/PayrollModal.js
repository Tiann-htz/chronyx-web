import { useState, useEffect } from 'react';
import { X, Calendar, Banknote, Clock, Users } from 'lucide-react';
import axios from 'axios';

export default function PayrollModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Select Period, 2: Review & Generate
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalHours: 0,
    totalSalary: 0
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
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
      alert('Please select both start and end dates');
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
      alert(error.response?.data?.message || 'Failed to calculate payroll');
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
        alert('Payroll generated successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Generate payroll error:', error);
      alert(error.response?.data?.message || 'Failed to generate payroll');
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
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Banknote className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Payroll Management</h2>
              <p className="text-indigo-100 text-sm">
                {step === 1 ? 'Select payroll period' : 'Review and generate payroll'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Quick Select Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Select Period
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleQuickSelect('first-half')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-gray-800">First Half</p>
                        <p className="text-sm text-gray-500">1st - 15th of month</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickSelect('second-half')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-gray-800">Second Half</p>
                        <p className="text-sm text-gray-500">16th - End of month</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickSelect('full-month')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-gray-800">Full Month</p>
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
                  <span className="px-4 bg-white text-gray-500">Or select custom dates</span>
                </div>
              </div>

              {/* Custom Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Period Start Date
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Period End Date
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    min={periodStart}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Selected Period Display */}
              {periodStart && periodEnd && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Selected Period</p>
                      <p className="text-lg font-bold text-indigo-600">
                        {new Date(periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        {' - '}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Total Employees</p>
                      <p className="text-3xl font-bold text-blue-900">{summary.totalEmployees}</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 mb-1">Total Hours</p>
                      <p className="text-3xl font-bold text-green-900">{summary.totalHours.toFixed(2)}</p>
                    </div>
                    <Clock className="w-10 h-10 text-green-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Total Salary</p>
                      <p className="text-3xl font-bold text-purple-900">{formatCurrency(summary.totalSalary)}</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Payroll Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days Worked</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hourly Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gross Salary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payrollData.map((employee) => (
                        <tr key={employee.employee_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {employee.first_name} {employee.last_name}
                              </p>
                              <p className="text-sm text-gray-500">{employee.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {employee.days_worked} days
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            {formatTime(employee.total_hours)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatCurrency(employee.hourly_rate)}
                          </td>
                          <td className="px-4 py-3">
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
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {step === 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={calculatePayroll}
                  disabled={!periodStart || !periodEnd || loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Calculating...' : 'Calculate Payroll'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Back
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generatePayroll}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Payroll'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}