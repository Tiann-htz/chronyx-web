import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, Calendar, FileText, Download, Users, Clock, TrendingUp, TrendingDown, AlertCircle, Filter } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import DetailedReportModal from '../../components/DetailedReportModal';
import { exportToExcel } from '../../utils/exportToExcel';
import { exportToPDF } from '../../utils/exportToPDF';
import ReportsAlert from '../../components/alerts/ReportsAlert';

export default function Reports() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Report filters
  const [reportType, setReportType] = useState('monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [activeQuickSelect, setActiveQuickSelect] = useState('this-month');
  
  // Data
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    const admin = JSON.parse(adminData);
    setAdminName(admin.name);
    
    // Set default date range to current month (Philippine time)
    const phNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const today = new Date(phNow);
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(lastDay.toISOString().split('T')[0]);
    
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await axios.get('/api/chronyxApi', { 
        headers: { 'X-Action': 'get-employees' } 
      });

      if (response.data.success) {
        setEmployees(response.data.data.filter(emp => emp.is_active === 1));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleQuickDateRange = (type) => {
    setActiveQuickSelect(type);
    
    const phNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const today = new Date(phNow);
    let from, to;

    if (type === 'today') {
      from = to = today.toISOString().split('T')[0];
    } else if (type === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      from = to = yesterday.toISOString().split('T')[0];
    } else if (type === 'this-week') {
      const monday = new Date(today);
      const day = monday.getDay();
      const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
      monday.setDate(diff);
      from = monday.toISOString().split('T')[0];
      to = today.toISOString().split('T')[0];
    } else if (type === 'last-week') {
      const lastMonday = new Date(today);
      const day = lastMonday.getDay();
      const diff = lastMonday.getDate() - day - 6;
      lastMonday.setDate(diff);
      from = lastMonday.toISOString().split('T')[0];
      
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastSunday.getDate() + 6);
      to = lastSunday.toISOString().split('T')[0];
    } else if (type === 'this-month') {
      from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      to = today.toISOString().split('T')[0];
    } else if (type === 'last-month') {
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    }

    setDateFrom(from);
    setDateTo(to);
  };

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      setAlertType('error');
      setAlertMessage('Please select date range');
      setAlertOpen(true);
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      setAlertType('error');
      setAlertMessage('Start date cannot be after end date');
      setAlertOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/chronyxApi', {
        dateFrom,
        dateTo,
        employeeId: selectedEmployee === 'all' ? null : selectedEmployee
      }, {
        headers: { 'X-Action': 'generate-report' }
      });

      if (response.data.success) {
        setReportData(response.data.data);
        setSummary(response.data.summary);
      } else {
        setAlertType('error');
        setAlertMessage(response.data.message || 'Failed to generate report');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setAlertType('error');
      setAlertMessage('Error generating report. Please try again.');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (time24) => {
    if (!time24) return '-';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatMinutesToHours = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleExportToExcel = () => {
    if (!reportData || !summary) {
      setAlertType('error');
      setAlertMessage('Please generate a report first');
      setAlertOpen(true);
      return;
    }
    
    try {
      exportToExcel(reportData, summary, dateFrom, dateTo);
      setAlertType('success');
      setAlertMessage('✅ Excel report exported successfully!');
      setAlertOpen(true);
    } catch (error) {
      console.error('Export to Excel error:', error);
      setAlertType('error');
      setAlertMessage('❌ Failed to export Excel. Please try again.');
      setAlertOpen(true);
    }
  };

  const handleExportToPDF = () => {
    if (!reportData || !summary) {
      setAlertType('error');
      setAlertMessage('Please generate a report first');
      setAlertOpen(true);
      return;
    }
    
    try {
      exportToPDF(reportData, summary, dateFrom, dateTo);
      setAlertType('success');
      setAlertMessage('✅ PDF report exported successfully!');
      setAlertOpen(true);
    } catch (error) {
      console.error('Export to PDF error:', error);
      setAlertType('error');
      setAlertMessage('❌ Failed to export PDF. Please try again.');
      setAlertOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="reports" adminName={adminName} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
              <p className="text-sm text-gray-500 mt-1">Generate and analyze attendance reports</p>
            </div>

            <div className="flex items-center space-x-4">
             
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN - Report Generator */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                  <div className="bg-gradient-to-r from-[#0A7EB1] to-[#105891] px-5 py-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-white" />
                      <h2 className="text-lg font-bold text-white">Report Filters</h2>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Quick Date Range Buttons */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Quick Select</label>
                      <div className="grid grid-cols-2 gap-2">
                       <button
  onClick={() => handleQuickDateRange('today')}
  className={`px-3 py-2 text-xs border-2 rounded-lg font-semibold transition-all ${
    activeQuickSelect === 'today'
      ? 'border-[#0A7EB1] bg-[#0A7EB1] text-white shadow-md'
      : 'border-gray-200 text-gray-700 hover:border-[#0A7EB1] hover:bg-blue-50'
  }`}
>
  Today
</button>
<button
  onClick={() => handleQuickDateRange('yesterday')}
  className={`px-3 py-2 text-xs border-2 rounded-lg font-semibold transition-all ${
    activeQuickSelect === 'yesterday'
      ? 'border-[#0A7EB1] bg-[#0A7EB1] text-white shadow-md'
      : 'border-gray-200 text-gray-700 hover:border-[#0A7EB1] hover:bg-blue-50'
  }`}
>
  Yesterday
</button>
<button
  onClick={() => handleQuickDateRange('this-week')}
  className={`px-3 py-2 text-xs border-2 rounded-lg font-semibold transition-all ${
    activeQuickSelect === 'this-week'
      ? 'border-[#0A7EB1] bg-[#0A7EB1] text-white shadow-md'
      : 'border-gray-200 text-gray-700 hover:border-[#0A7EB1] hover:bg-blue-50'
  }`}
>
  This Week
</button>
<button
  onClick={() => handleQuickDateRange('last-week')}
  className={`px-3 py-2 text-xs border-2 rounded-lg font-semibold transition-all ${
    activeQuickSelect === 'last-week'
      ? 'border-[#0A7EB1] bg-[#0A7EB1] text-white shadow-md'
      : 'border-gray-200 text-gray-700 hover:border-[#0A7EB1] hover:bg-blue-50'
  }`}
>
  Last Week
</button>
<button
  onClick={() => handleQuickDateRange('this-month')}
  className={`px-3 py-2 text-xs border-2 rounded-lg font-semibold transition-all ${
    activeQuickSelect === 'this-month'
      ? 'border-[#0A7EB1] bg-[#0A7EB1] text-white shadow-md'
      : 'border-gray-200 text-gray-700 hover:border-[#0A7EB1] hover:bg-blue-50'
  }`}
>
  This Month
</button>
<button
  onClick={() => handleQuickDateRange('last-month')}
  className={`px-3 py-2 text-xs border-2 rounded-lg font-semibold transition-all ${
    activeQuickSelect === 'last-month'
      ? 'border-[#0A7EB1] bg-[#0A7EB1] text-white shadow-md'
      : 'border-gray-200 text-gray-700 hover:border-[#0A7EB1] hover:bg-blue-50'
  }`}
>
  Last Month
</button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-5">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Custom Range</label>
                      
                      {/* Date Range */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Date From</label>
                          <input
  type="date"
  value={dateFrom}
  onChange={(e) => {
    setDateFrom(e.target.value);
    setActiveQuickSelect(null); // Clear active selection when manually changed
  }}
  className="w-full px-3 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
/>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Date To</label>
                          <input
  type="date"
  value={dateTo}
  onChange={(e) => {
    setDateTo(e.target.value);
    setActiveQuickSelect(null); // Clear active selection when manually changed
  }}
  className="w-full px-3 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
/>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Employee</label>
                          <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                          >
                            <option value="all">All Employees</option>
                            {employees.map(emp => (
                              <option key={emp.employee_id} value={emp.employee_id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Selected Range Display */}
                    {dateFrom && dateTo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <Calendar className="w-4 h-4 text-[#0A7EB1] mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-700 mb-0.5">Selected Period</p>
                            <p className="text-sm font-bold text-[#0A7EB1] break-words">
                              {formatDate(dateFrom)} - {formatDate(dateTo)}
                            </p>
                            {selectedEmployee !== 'all' && (
                              <p className="text-xs text-gray-600 mt-1">
                                {employees.find(e => e.employee_id.toString() === selectedEmployee)?.first_name} {employees.find(e => e.employee_id.toString() === selectedEmployee)?.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      onClick={generateReport}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{loading ? 'Generating...' : 'Generate Report'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Results */}
              <div className="xl:col-span-2">
                {loading ? (
                  /* Loading State */
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center h-full flex flex-col items-center justify-center">
                    <div className="relative">
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Report...</h3>
                    <p className="text-gray-500">Please wait while we process your attendance data</p>
                    <div className="mt-6 flex items-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-[#0A7EB1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#0A7EB1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#0A7EB1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : reportData && summary ? (
                  <div className="space-y-5">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#0A7EB1]" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Total Days</p>
                        <p className="text-2xl font-bold text-gray-800">{summary.totalDays}</p>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-1">On-Time</p>
                        <p className="text-2xl font-bold text-green-600">{summary.totalOnTime}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{summary.onTimeRate}%</p>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Late</p>
                        <p className="text-2xl font-bold text-red-600">{summary.totalLate}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{summary.lateRate}%</p>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Absent</p>
                        <p className="text-2xl font-bold text-orange-600">{summary.totalAbsent}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{summary.absentRate}%</p>
                      </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Export Card */}
                      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <Download className="w-5 h-5 text-gray-700" />
                          <h3 className="text-base font-bold text-gray-800">Export Report</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
  onClick={handleExportToExcel}
  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
>
  <Download className="w-4 h-4" />
  <span>Excel</span>
</button>
<button
  onClick={handleExportToPDF}
  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
>
  <Download className="w-4 h-4" />
  <span>PDF</span>
</button>

                        </div>
                      </div>

                      {/* Detailed Report Card */}
                      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <FileText className="w-5 h-5 text-gray-700" />
                          <h3 className="text-base font-bold text-gray-800">Detailed Report</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          View {reportData.length} employee{reportData.length !== 1 ? 's' : ''} records
                        </p>
                        <button
                          onClick={() => setShowDetailedModal(true)}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Report Generated</h3>
                    <p className="text-sm text-gray-500 max-w-sm">Select date range and filters, then click "Generate Report" to view attendance data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detailed Report Modal */}
      <DetailedReportModal
        isOpen={showDetailedModal}
        onClose={() => setShowDetailedModal(false)}
        reportData={reportData}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {/* Reports Alert */}
      <ReportsAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        type={alertType}
        message={alertMessage}
      />
    </div>
  );
}