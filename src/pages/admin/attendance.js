import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, Clock, Users, Calendar as CalendarIcon, TrendingUp, CalendarClock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import QRScannerModal from '../../components/QRScannerModal';
import ScheduleModal from '../../components/ScheduleModal';

export default function Attendance() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [actionType, setActionType] = useState('time-in');
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayPresent: 0,
    todayTimeIn: 0,
    todayTimeOut: 0,
    completedToday: 0
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    const admin = JSON.parse(adminData);
    setAdminName(admin.name);
    loadAttendanceData();

    // Check for date change every minute
    const dateCheckInterval = setInterval(() => {
      const newDate = new Date().toISOString().split('T')[0];
      if (newDate !== currentDate) {
        console.log('🔄 Date changed! Resetting to new day:', newDate);
        setCurrentDate(newDate);
        // Clear schedule if it was for a previous date
        if (activeSchedule && activeSchedule.date !== newDate) {
          setActiveSchedule(null);
        }
        // Reload data for the new day
        loadAttendanceData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(dateCheckInterval);
  }, [currentDate, activeSchedule]);

  // Reload data when schedule changes
  useEffect(() => {
    if (activeSchedule !== null) {
      console.log('Schedule changed, reloading data...');
      loadAttendanceData();
    }
  }, [activeSchedule]);

  // Auto-dismiss alert after 6 seconds
  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        setScanResult(null);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      console.log('=== LOADING ATTENDANCE DATA ===');
      console.log('Active Schedule:', activeSchedule);
      
      const response = await axios.get('/api/chronyxApi', { 
        headers: { 'X-Action': 'get-recent-attendance' } 
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        let attendanceData = response.data.data;
        console.log('Total records from API:', attendanceData.length);
        console.log('Sample record:', attendanceData[0]);
        
        // Filter by schedule if active
        if (activeSchedule) {
          console.log('Filtering with schedule:', activeSchedule);
          const filteredData = filterBySchedule(attendanceData, activeSchedule);
          console.log('Records after filtering:', filteredData.length);
          console.log('Filtered records:', filteredData);
          attendanceData = filteredData;
        } else {
          console.log('No active schedule - showing all records');
        }
        
        setRecentAttendance(attendanceData);
        
        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const scheduleDate = activeSchedule ? activeSchedule.date : today;
        console.log('Calculating stats for date:', scheduleDate);
        
        const todayRecords = attendanceData.filter(a => {
          const recordDate = new Date(a.date).toISOString().split('T')[0];
          return recordDate === scheduleDate;
        });
        console.log('Records for today/schedule date:', todayRecords.length);
        
        const uniqueEmployees = [...new Set(todayRecords.map(a => a.employee_id))];
        const timeInCount = todayRecords.filter(a => a.action_type === 'time-in').length;
        const timeOutCount = todayRecords.filter(a => a.action_type === 'time-out').length;
        
        // Calculate completed (both time-in and time-out)
        const employeesWithBoth = uniqueEmployees.filter(empId => {
          const hasTimeIn = todayRecords.some(r => r.employee_id === empId && r.action_type === 'time-in');
          const hasTimeOut = todayRecords.some(r => r.employee_id === empId && r.action_type === 'time-out');
          return hasTimeIn && hasTimeOut;
        });
        
        console.log('Stats:', {
          todayPresent: uniqueEmployees.length,
          todayTimeIn: timeInCount,
          todayTimeOut: timeOutCount,
          completedToday: employeesWithBoth.length
        });
        
        setStats({
          todayPresent: uniqueEmployees.length,
          todayTimeIn: timeInCount,
          todayTimeOut: timeOutCount,
          completedToday: employeesWithBoth.length
        });
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBySchedule = (records, schedule) => {
    console.log('=== FILTERING BY SCHEDULE ===');
    console.log('Total records to filter:', records.length);
    console.log('Schedule config:', schedule);
    
    const filtered = records.filter(record => {
      console.log(`Checking record: ${record.first_name} ${record.last_name} - ${record.date} ${record.time} (${record.action_type})`);
      
      // Convert database date to YYYY-MM-DD format for comparison
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      console.log(`  Converted date: ${recordDate} (original: ${record.date})`);
      
      // Filter by date
      if (recordDate !== schedule.date) {
        console.log(`  ❌ Date mismatch: ${recordDate} !== ${schedule.date}`);
        return false;
      }
      console.log(`  ✓ Date matches: ${recordDate}`);

      // Filter by type if specified
      if (schedule.filterType === 'time-in') {
        const isTimeIn = record.action_type === 'time-in';
        console.log(`  ${isTimeIn ? '✓ TIME-IN record' : '❌ Not TIME-IN'}`);
        return isTimeIn;
      } else if (schedule.filterType === 'time-out') {
        const isTimeOut = record.action_type === 'time-out';
        console.log(`  ${isTimeOut ? '✓ TIME-OUT record' : '❌ Not TIME-OUT'}`);
        return isTimeOut;
      }

      // If filterType is 'all', include all records from that date
      console.log(`  ✓ ALL records - included`);
      return true;
    });
    
    console.log('=== FILTERING COMPLETE ===');
    console.log(`Filtered ${filtered.length} out of ${records.length} records`);
    return filtered;
  };

  const handleScheduleSave = (schedule) => {
    console.log('=== SCHEDULE SAVED ===');
    console.log('New schedule:', schedule);
    setActiveSchedule(schedule);
    // Force reload after state update
    setTimeout(() => {
      loadAttendanceData();
    }, 100);
  };

  const handleOpenScanner = (type) => {
    setActionType(type);
    setShowScanner(true);
    setScanResult(null);
  };

  const handleScanSuccess = async (qrCode) => {
    console.log('🎯 QR Code scanned:', qrCode);

    try {
      const response = await fetch('/api/chronyxApi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Action': 'record-attendance'
        },
        body: JSON.stringify({
          qrCode: qrCode,
          actionType: actionType
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ ATTENDANCE RECORDED IN DATABASE!');
        
        setScanResult({
          success: true,
          message: data.message,
          userName: data.data.userName,
          time: data.data.time,
          actionType: data.data.actionType
        });

        // Reload attendance data
        loadAttendanceData();
      } else {
        console.error('❌ Recording failed:', data.message);
        setScanResult({
          success: false,
          message: data.message
        });
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      setScanResult({
        success: false,
        message: 'Failed to record attendance. Please try again.'
      });
    }

    setShowScanner(false);
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

  const getFilterLabel = () => {
    if (!activeSchedule) return 'Today';
    
    const date = new Date(activeSchedule.date);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (activeSchedule.filterType === 'time-in') {
      return `${formattedDate} (Time In Only)`;
    } else if (activeSchedule.filterType === 'time-out') {
      return `${formattedDate} (Time Out Only)`;
    } else {
      return formattedDate;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activeTab="attendance" adminName={adminName} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
              <p className="text-sm text-gray-500 mt-1">Record employee time in and time out</p>
              {activeSchedule && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center space-x-1">
                    <CalendarClock className="w-3 h-3" />
                    <span>
                      Filtered: {formatDate(activeSchedule.date)} 
                      {activeSchedule.filterType === 'time-in' && ' - Time In Only'}
                      {activeSchedule.filterType === 'time-out' && ' - Time Out Only'}
                      {activeSchedule.filterType === 'all' && ' - All Records'}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <CalendarClock className="w-5 h-5" />
                <span>Schedule</span>
              </button>
              <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Present {getFilterLabel()}</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.todayPresent}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#0A7EB1]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Time In {getFilterLabel()}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.todayTimeIn}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Time Out {getFilterLabel()}</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.todayTimeOut}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Completed {getFilterLabel()}</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.completedToday}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid - Scanner & Records */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Scanner Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-fit">
                <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] px-6 py-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Time Clock</h2>
                      <p className="text-white/90 text-sm">Scan employee QR code</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Time In Button */}
                    <button
                      onClick={() => handleOpenScanner('time-in')}
                      className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-8 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-7 h-7" />
                        </div>
                        <span className="text-xl font-bold">Time In</span>
                        <span className="text-xs opacity-90">Clock In</span>
                      </div>
                    </button>

                    {/* Time Out Button */}
                    <button
                      onClick={() => handleOpenScanner('time-out')}
                      className="group bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold py-8 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Clock className="w-7 h-7" />
                        </div>
                        <span className="text-xl font-bold">Time Out</span>
                        <span className="text-xs opacity-90">Clock Out</span>
                      </div>
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Bell className="w-5 h-5 text-[#0A7EB1] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm mb-2">How to use:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          <li>• Click Time In or Time Out button</li>
                          <li>• Camera will open automatically</li>
                          <li>• Ask employee to show QR code</li>
                          <li>• Align QR code in scanning frame</li>
                          <li>• System auto-records attendance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Recent Attendance Records */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">
                      {activeSchedule ? `Records for ${getFilterLabel()}` : 'Recent Records'}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {activeSchedule ? `Filtered: ${recentAttendance.length}` : `Total: ${recentAttendance.length}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: '500px' }}>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-[#0A7EB1] border-t-transparent rounded-full"></div>
                    </div>
                  ) : recentAttendance.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentAttendance.slice(0, 20).map((record) => (
                          <tr key={record.attendance_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {record.avatar_url ? (
                                  <img 
                                    src={record.avatar_url} 
                                    alt={`${record.first_name} ${record.last_name}`}
                                    className="w-8 h-8 rounded-full object-cover mr-2"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-8 h-8 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center mr-2"
                                  style={{ display: record.avatar_url ? 'none' : 'flex' }}
                                >
                                  <span className="text-white text-xs font-semibold">
                                    {record.first_name.charAt(0)}{record.last_name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {record.first_name} {record.last_name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                record.action_type === 'time-in' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {record.action_type === 'time-in' ? 'In' : 'Out'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                              {formatTime(record.time)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(record.date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CalendarIcon className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        {activeSchedule ? 'No records found for this filter' : 'No attendance records yet'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {activeSchedule ? 'Try adjusting your filter settings' : 'Start scanning to record attendance'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Success/Error Alert - Slides down from top */}
      {scanResult && (
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4 animate-slideDown">
          <div className={`p-6 rounded-2xl shadow-2xl border-2 backdrop-blur-sm ${
            scanResult.success 
              ? 'bg-green-50/95 border-green-300' 
              : 'bg-red-50/95 border-red-300'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${
                scanResult.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {scanResult.success ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <X className="w-8 h-8" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className={`font-bold text-xl mb-2 ${
                  scanResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {scanResult.success ? '✓ Success!' : '✗ Error'}
                </h3>
                <p className={`text-base mb-3 ${
                  scanResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {scanResult.message}
                </p>
                {scanResult.success && (
                  <div className="text-sm text-green-800 space-y-2 bg-green-100/50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span><strong>Employee:</strong> {scanResult.userName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span><strong>Time:</strong> {scanResult.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span><strong>Action:</strong> <span className="uppercase font-semibold">{scanResult.actionType}</span></span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setScanResult(null)}
                className={`ml-4 flex-shrink-0 p-1 rounded-lg transition-colors ${
                  scanResult.success 
                    ? 'text-green-600 hover:bg-green-200' 
                    : 'text-red-600 hover:bg-red-200'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSave={handleScheduleSave}
      />

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-100%);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}