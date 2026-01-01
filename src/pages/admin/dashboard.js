import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, Users, Calendar, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
const [loading, setLoading] = useState(true);
const [dashboardData, setDashboardData] = useState(null);

// Date range filters
const [trendDateFrom, setTrendDateFrom] = useState('');
const [trendDateTo, setTrendDateTo] = useState('');
const [selectedMonth, setSelectedMonth] = useState('');
const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
  const adminData = localStorage.getItem('adminData');
  if (!adminData) {
    router.push('/admin/login');
    return;
  }
  
  const admin = JSON.parse(adminData);
  setAdminName(admin.name);
  
  // Set default date ranges
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const todayStr = formatDate(today);
  const sevenDaysAgoStr = formatDate(sevenDaysAgo);
  
  // Get current month and year
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const currentYear = today.getFullYear();

setTrendDateFrom(sevenDaysAgoStr);
setTrendDateTo(todayStr);
setSelectedMonth(currentMonth);
setSelectedYear(String(currentYear));
  
  loadDashboardData();
  }, []);

  const loadDashboardData = async (dateFrom, dateTo, chartType) => {
  try {
    const finalDateFrom = dateFrom || trendDateFrom;
    const finalDateTo = dateTo || trendDateTo;
    
    console.log('Loading dashboard with dates:', { 
      dateFrom: finalDateFrom, 
      dateTo: finalDateTo, 
      chartType, 
      selectedMonth, 
      selectedYear 
    });
    
    const response = await axios.get('/api/chronyxApi', { 
      headers: { 
        'X-Action': 'get-dashboard-data',
        'date-from': finalDateFrom,
        'date-to': finalDateTo,
        'Selected-Month': selectedMonth,
        'Selected-Year': selectedYear,
        'Chart-Type': chartType || 'all'
      } 
    });

    if (response.data.success) {
      console.log('Dashboard data loaded:', {
        lastSevenDays: response.data.data.lastSevenDays,
        monthlyWeeks: response.data.data.monthlyWeeks
      });
      setDashboardData(response.data.data);
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

  const getTimeAgo = (dateStr, timeStr) => {
    const recordTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diffMs = now - recordTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return formatDate(dateStr);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#0A7EB1] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activeTab="dashboard" adminName={adminName} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, {adminName}</p>
            </div>

            <div className="flex items-center space-x-4">
             
            </div>
          </div>
        </header>

        {/* Content Area - NOW WITH PROPER SCROLLING */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Today's Overview Stats */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Present Today */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Present Today</p>
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.today.present}</p>
                      <p className="text-xs text-gray-500 mt-1">out of {dashboardData?.today.totalEmployees}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Late Today */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Late Today</p>
                      <p className="text-3xl font-bold text-red-600">{dashboardData?.today.late}</p>
                      <p className="text-xs text-gray-500 mt-1">employees</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                      <TrendingDown className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* On-Time Rate */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">On-Time Rate</p>
                      <p className="text-3xl font-bold text-[#0A7EB1]">{dashboardData?.today.onTimeRate}%</p>
                      <p className="text-xs text-gray-500 mt-1">today</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-[#0A7EB1]" />
                    </div>
                  </div>
                </div>

                {/* Total Employees */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Employees</p>
                      <p className="text-3xl font-bold text-purple-600">{dashboardData?.today.totalEmployees}</p>
                      <p className="text-xs text-green-500 mt-1 flex items-center">
                        <span className="mr-1">●</span> Active
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* 7-Day Trend Chart - LINE CHART WITH DATE FILTER */}
<div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
  <div className="mb-4">
    <h3 className="text-lg font-bold text-gray-800 mb-3">Attendance Trend</h3>
    {/* Desktop Layout */}
    <div className="hidden md:flex items-center space-x-2">
      <input
        type="date"
        value={trendDateFrom}
        onChange={(e) => setTrendDateFrom(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent"
      />
      <span className="text-sm text-gray-500">to</span>
      <input
        type="date"
        value={trendDateTo}
        onChange={(e) => setTrendDateTo(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent"
      />
      <button
        onClick={() => loadDashboardData(trendDateFrom, trendDateTo, 'trend')}
        className="px-4 py-1.5 bg-[#0A7EB1] text-white text-sm font-medium rounded-lg hover:bg-[#105891] transition-colors"
      >
        Apply
      </button>
    </div>
    {/* Mobile Layout */}
    <div className="md:hidden space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={trendDateFrom}
          onChange={(e) => setTrendDateFrom(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent"
        />
        <span className="text-sm text-gray-500">to</span>
        <input
          type="date"
          value={trendDateTo}
          onChange={(e) => setTrendDateTo(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent"
        />
      </div>
      <button
        onClick={() => loadDashboardData(trendDateFrom, trendDateTo, 'trend')}
        className="w-full px-4 py-2 bg-[#0A7EB1] text-white text-sm font-medium rounded-lg hover:bg-[#105891] transition-colors"
      >
        Apply Filter
      </button>
    </div>
  </div>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={dashboardData?.lastSevenDays}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis 
        dataKey="day" 
        stroke="#6b7280"
        style={{ fontSize: '12px' }}
      />
      <YAxis 
        stroke="#6b7280"
        style={{ fontSize: '12px' }}
      />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '12px'
        }}
      />
      <Legend 
        wrapperStyle={{ fontSize: '12px' }}
      />
      <Line 
        type="monotone" 
        dataKey="present" 
        stroke="#10b981" 
        strokeWidth={3}
        dot={{ fill: '#10b981', r: 5 }}
        activeDot={{ r: 7 }}
        name="Present"
      />
      <Line 
        type="monotone" 
        dataKey="late" 
        stroke="#ef4444" 
        strokeWidth={3}
        dot={{ fill: '#ef4444', r: 5 }}
        activeDot={{ r: 7 }}
        name="Late"
      />
      <Line 
        type="monotone" 
        dataKey="absent" 
        stroke="#6b7280" 
        strokeWidth={3}
        dot={{ fill: '#6b7280', r: 5 }}
        activeDot={{ r: 7 }}
        name="Absent"
      />
    </LineChart>
  </ResponsiveContainer>
</div>

              {/* Recent Activity Feed */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                  <p className="text-xs text-gray-500 mt-1">Today's attendance records</p>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: '340px' }}>
                  {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {dashboardData.recentActivity.map((record) => (
                        <div key={record.attendance_id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            {record.avatar_url ? (
                              <img 
                                src={record.avatar_url} 
                                alt={`${record.first_name} ${record.last_name}`}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-semibold">
                                  {record.first_name.charAt(0)}{record.last_name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {record.first_name} {record.last_name}
                                </p>
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  record.action_type === 'time-in' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {record.action_type === 'time-in' ? 'In' : 'Out'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{formatTime(record.time)}</span>
                                {record.action_type === 'time-in' && record.status && (
                                  <span className={`text-xs ${
                                    record.status === 'late' ? 'text-red-600 font-semibold' : 'text-green-600'
                                  }`}>
                                    {record.status === 'late' ? '• Late' : '• On-time'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {getTimeAgo(record.date, record.time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No activity yet today</p>
                      <p className="text-sm text-gray-400 mt-1">Records will appear here as employees check in</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          {/* Monthly Summary Chart - BAR CHART WITH MONTH/YEAR PICKER */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
  <div className="mb-4">
    <h3 className="text-lg font-bold text-gray-800 mb-3">Monthly Summary</h3>
    {/* Desktop Layout */}
    <div className="hidden md:flex items-center space-x-2">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent"
      >
        <option value="01">January</option>
        <option value="02">February</option>
        <option value="03">March</option>
        <option value="04">April</option>
        <option value="05">May</option>
        <option value="06">June</option>
        <option value="07">July</option>
        <option value="08">August</option>
        <option value="09">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent"
      >
        <option value="2023">2023</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>
      <button
        onClick={() => loadDashboardData(null, null, 'month')}
        className="px-4 py-1.5 bg-[#0A7EB1] text-white text-sm font-medium rounded-lg hover:bg-[#105891] transition-colors"
      >
        Apply
      </button>
    </div>
    {/* Mobile Layout */}
    <div className="md:hidden space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent"
        >
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>
      <button
        onClick={() => loadDashboardData(null, null, 'month')}
        className="w-full px-4 py-2 bg-[#0A7EB1] text-white text-sm font-medium rounded-lg hover:bg-[#105891] transition-colors"
      >
        Apply Filter
      </button>
    </div>
  </div>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={dashboardData?.monthlyWeeks}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis 
        dataKey="week" 
        stroke="#6b7280"
        style={{ fontSize: '12px' }}
      />
      <YAxis 
        stroke="#6b7280"
        style={{ fontSize: '12px' }}
      />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '12px'
        }}
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            return (
              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-semibold text-gray-800 mb-1">
                  {payload[0].payload.week}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Dates: {payload[0].payload.dateRange}
                </p>
                {payload.map((entry, index) => (
                  <p key={index} style={{ color: entry.color }} className="text-sm">
                    {entry.name}: {entry.value}
                  </p>
                ))}
              </div>
            );
          }
          return null;
        }}
      />
      <Legend 
        wrapperStyle={{ fontSize: '12px' }}
      />
      <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} name="Present" />
      <Bar dataKey="late" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Late" />
      <Bar dataKey="absent" fill="#6b7280" radius={[8, 8, 0, 0]} name="Absent" />
    </BarChart>
  </ResponsiveContainer>
</div>
          </div>
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f1f1;
        }
      `}</style>
    </div>
  );
}