import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Filter, Info } from 'lucide-react';

export default function AttendanceFilterModal({ isOpen, onClose, onApplyFilter }) {
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'time-in', 'time-out'

  useEffect(() => {
  if (isOpen) {
    // Set default to today (Philippine time)
    const phNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const phToday = new Date(phNow).toISOString().split('T')[0];
    setFilterDate(phToday);
    setFilterType('all');
  }
}, [isOpen]);

  const handleApply = () => {
    if (!filterDate) {
      alert('Please select a date');
      return;
    }

    const filter = {
      date: filterDate,
      filterType: filterType
    };

    console.log('=== ATTENDANCE FILTER APPLIED ===');
    console.log('Filter data:', filter);

    // Call parent callback
    if (onApplyFilter) {
      onApplyFilter(filter);
    }

    onClose();
  };

  const handleClearFilter = () => {
    if (confirm('Are you sure you want to clear the filter? This will show recent attendance records.')) {
      setFilterDate('');
      setFilterType('all');
      
      if (onApplyFilter) {
        onApplyFilter(null);
      }
      
      onClose();
    }
  };

  const handleQuickDate = (type) => {
  // Get current date in Philippine timezone
  const phNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
  const today = new Date(phNow);
  
  if (type === 'today') {
    setFilterDate(today.toISOString().split('T')[0]);
  } else if (type === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    setFilterDate(yesterday.toISOString().split('T')[0]);
  } else if (type === 'week-start') {
    // Get Monday of current week
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    setFilterDate(monday.toISOString().split('T')[0]);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Filter className="w-7 h-7 text-[#0A7EB1]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Filter Attendance Records</h2>
              <p className="text-white/80 text-sm">View attendance by date and action type</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-[#0A7EB1] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-2">About Filtering:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• This filters existing attendance records only</li>
                  <li>• Select a date to view that day's attendance</li>
                  <li>• Choose to show All records, Time In only, or Time Out only</li>
                  <li>• Stats and table will update based on your filter</li>
                  <li>• Clear filter to return to recent records view</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Date Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Quick Date Select
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickDate('today')}
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-[#0A7EB1] hover:bg-blue-50 transition-all text-sm font-semibold text-gray-700"
              >
                📅 Today
              </button>
              <button
                onClick={() => handleQuickDate('yesterday')}
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-[#0A7EB1] hover:bg-blue-50 transition-all text-sm font-semibold text-gray-700"
              >
                ⏮️ Yesterday
              </button>
              <button
                onClick={() => handleQuickDate('week-start')}
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-[#0A7EB1] hover:bg-blue-50 transition-all text-sm font-semibold text-gray-700"
              >
                📆 This Week
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Or Select Specific Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
            />
          </div>

          {/* Filter Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Action Type Filter
            </label>
            <div className="grid grid-cols-3 gap-4">
              {/* All Records */}
              <button
                onClick={() => setFilterType('all')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  filterType === 'all'
                    ? 'border-[#0A7EB1] bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    filterType === 'all' ? 'bg-[#0A7EB1]' : 'bg-gray-200'
                  }`}>
                    <Calendar className={`w-6 h-6 ${filterType === 'all' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className={`text-sm font-semibold ${
                    filterType === 'all' ? 'text-[#0A7EB1]' : 'text-gray-700'
                  }`}>
                    All Records
                  </span>
                </div>
              </button>

              {/* Time In Only */}
              <button
                onClick={() => setFilterType('time-in')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  filterType === 'time-in'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    filterType === 'time-in' ? 'bg-green-600' : 'bg-gray-200'
                  }`}>
                    <Clock className={`w-6 h-6 ${filterType === 'time-in' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className={`text-sm font-semibold ${
                    filterType === 'time-in' ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    Time In Only
                  </span>
                </div>
              </button>

              {/* Time Out Only */}
              <button
                onClick={() => setFilterType('time-out')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  filterType === 'time-out'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    filterType === 'time-out' ? 'bg-orange-600' : 'bg-gray-200'
                  }`}>
                    <Clock className={`w-6 h-6 ${filterType === 'time-out' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className={`text-sm font-semibold ${
                    filterType === 'time-out' ? 'text-orange-600' : 'text-gray-700'
                  }`}>
                    Time Out Only
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Selected Filter Preview */}
          {filterDate && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Filter className="w-6 h-6 text-[#0A7EB1]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Filter Preview</p>
                  <p className="text-lg font-bold text-[#0A7EB1]">
                    {new Date(filterDate + 'T00:00:00').toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                    {filterType === 'time-in' && ' - Time In Only'}
                    {filterType === 'time-out' && ' - Time Out Only'}
                    {filterType === 'all' && ' - All Records'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-8 py-5 bg-gray-50 flex justify-between">
          <button
            onClick={handleClearFilter}
            className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-colors"
          >
            Clear Filter
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!filterDate}
              className="px-8 py-3 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-5 h-5" />
              <span>Apply Filter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}