import { X, FileText } from 'lucide-react';

export default function DetailedReportModal({ isOpen, onClose, reportData, dateFrom, dateTo }) {
  if (!isOpen || !reportData) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      ></div>

      {/* Modal - Landscape Optimized */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[95vw] max-h-[90vh] flex flex-col transform transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-[#0A7EB1]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Detailed Attendance Report</h2>
              <p className="text-white/80 text-sm">
                {formatDate(dateFrom)} - {formatDate(dateTo)} • {reportData.length} employee{reportData.length !== 1 ? 's' : ''}
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

        {/* Table Container - Scrollable */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Horizontal Scroll Wrapper */}
            <div className="overflow-x-auto custom-scrollbar">
              <div className="min-w-[900px]">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-20">
                        Employee
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Days<br/>Worked
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        On-Time
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Late
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Absent
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Late<br/>Time
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        OT<br/>Time
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Attendance<br/>Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {reportData.map((employee) => (
                      <tr key={employee.employee_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 sticky left-0 bg-white hover:bg-gray-50 z-10">
                          <div className="flex items-center min-w-[180px]">
                            {employee.avatar_url ? (
                              <img 
                                src={employee.avatar_url} 
                                alt={`${employee.first_name} ${employee.last_name}`}
                                className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <span className="text-white text-xs font-semibold">
                                  {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-800 truncate">
                                {employee.first_name} {employee.last_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-sm font-bold text-gray-800">{employee.days_worked}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                            {employee.on_time_count}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
                            {employee.late_count}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700">
                            {employee.absent_count}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-sm font-medium text-gray-700">
                          {formatMinutesToHours(employee.total_late_minutes)}
                        </td>
                        <td className="px-3 py-3 text-center text-sm font-medium text-gray-700">
                          {formatMinutesToHours(employee.total_overtime_minutes)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center space-y-1 min-w-[100px]">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  employee.attendance_rate >= 90 ? 'bg-green-500' :
                                  employee.attendance_rate >= 75 ? 'bg-yellow-500' :
                                  employee.attendance_rate >= 50 ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${employee.attendance_rate}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold ${
                              employee.attendance_rate >= 90 ? 'text-green-600' :
                              employee.attendance_rate >= 75 ? 'text-yellow-600' :
                              employee.attendance_rate >= 50 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {employee.attendance_rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scroll Hint - Only show on desktop */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center hidden md:block">
              
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{reportData.length}</span> employee{reportData.length !== 1 ? 's' : ''} in this report
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
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

        /* Mobile optimization */
        @media (max-width: 768px) {
          .custom-scrollbar {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
}