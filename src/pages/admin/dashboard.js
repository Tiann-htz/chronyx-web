import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, Users, Calendar, QrCode, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminName, setAdminName] = useState('');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalQRCodes: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    const admin = JSON.parse(adminData);
    setAdminName(admin.name);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [employeesRes, attendanceRes, qrCodesRes] = await Promise.all([
        axios.get('/api/chronyxApi', { headers: { 'X-Action': 'get-employees' } }),
        axios.get('/api/chronyxApi', { headers: { 'X-Action': 'get-recent-attendance' } }),
        axios.get('/api/chronyxApi', { headers: { 'X-Action': 'get-qr-codes' } })
      ]);

      if (employeesRes.data.success) {
        setStats(prev => ({ ...prev, totalEmployees: employeesRes.data.data.length }));
      }

      if (attendanceRes.data.success) {
        setRecentAttendance(attendanceRes.data.data);
        
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendanceRes.data.data.filter(a => a.date === today);
        const uniqueUsers = [...new Set(todayAttendance.map(a => a.user_id))];
        setStats(prev => ({ 
          ...prev, 
          presentToday: uniqueUsers.length,
          absentToday: employeesRes.data.data.length - uniqueUsers.length
        }));
      }

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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} adminName={adminName} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, {adminName}</p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalEmployees}</p>
                    <div className="flex items-center mt-2 text-xs">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">Active</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#0A7EB1]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Present Today</p>
                    <p className="text-3xl font-bold text-green-600">{stats.presentToday}</p>
                    <div className="flex items-center mt-2 text-xs">
                      <span className="text-gray-500">Out of {stats.totalEmployees}</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Absent Today</p>
                    <p className="text-3xl font-bold text-red-600">{stats.absentToday}</p>
                    <div className="flex items-center mt-2 text-xs">
                      <span className="text-gray-500">Needs attention</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Active QR Codes</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalQRCodes}</p>
                    <div className="flex items-center mt-2 text-xs">
                      <span className="text-gray-500">Available</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Attendance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Recent Attendance</h2>
                  <span className="text-sm text-gray-500">Last 50 records</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentAttendance.length > 0 ? (
                      recentAttendance.map((record) => (
                        <tr key={record.attendance_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
  {record.avatar_url ? (
    <img 
      src={record.avatar_url} 
      alt={`${record.first_name} ${record.last_name}`}
      className="w-8 h-8 rounded-full object-cover mr-3"
    />
  ) : (
    <div className="w-8 h-8 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center mr-3">
      <span className="text-white text-xs font-semibold">
        {record.first_name.charAt(0)}{record.last_name.charAt(0)}
      </span>
    </div>
  )}
  <span className="text-sm font-medium text-gray-800">
    {record.first_name} {record.last_name}
  </span>
</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              record.action_type === 'time-in' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {record.action_type === 'time-in' ? 'Time In' : 'Time Out'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">{formatTime(record.time)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(record.date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No attendance records yet</p>
                          <p className="text-sm text-gray-400 mt-1">Records will appear here once employees start checking in</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}