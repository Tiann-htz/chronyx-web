import { useState, useEffect } from 'react';
import { X, Clock, Save, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import TimePolicyAlert from './alerts/TimePolicyAlert';

export default function TimePolicyModal({ isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [existingPolicy, setExistingPolicy] = useState(null);
  
  // Form fields
  const [timeInStart, setTimeInStart] = useState('06:00');
  const [timeInEnd, setTimeInEnd] = useState('08:00');
  const [gracePeriod, setGracePeriod] = useState(15);
  const [officialTimeOut, setOfficialTimeOut] = useState('17:00');
  const [requiredHours, setRequiredHours] = useState(9);

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadExistingPolicy();
    }
  }, [isOpen]);

  const loadExistingPolicy = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/chronyxApi', {
        headers: { 'X-Action': 'get-time-policy' }
      });

      if (response.data.success && response.data.data) {
        const policy = response.data.data;
        setExistingPolicy(policy);
        
        // Populate form with existing policy
        setTimeInStart(policy.time_in_start.substring(0, 5));
        setTimeInEnd(policy.time_in_end.substring(0, 5));
        setGracePeriod(policy.grace_period);
        setOfficialTimeOut(policy.official_time_out.substring(0, 5));
        setRequiredHours(parseFloat(policy.required_hours));
      }
    } catch (error) {
      console.error('Error loading time policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!timeInStart || !timeInEnd || !officialTimeOut || !requiredHours) {
      setAlertType('error');
      setAlertMessage('Please fill in all required fields');
      setAlertOpen(true);
      return;
    }

    if (timeInStart >= timeInEnd) {
      setAlertType('error');
      setAlertMessage('Time In Start must be before Time In End');
      setAlertOpen(true);
      return;
    }

    if (gracePeriod < 0 || gracePeriod > 60) {
      setAlertType('error');
      setAlertMessage('Grace period must be between 0 and 60 minutes');
      setAlertOpen(true);
      return;
    }

    if (requiredHours <= 0 || requiredHours > 24) {
      setAlertType('error');
      setAlertMessage('Required hours must be between 1 and 24');
      setAlertOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/chronyxApi', {
        timeInStart,
        timeInEnd,
        gracePeriod: parseInt(gracePeriod),
        officialTimeOut,
        requiredHours: parseFloat(requiredHours)
      }, {
        headers: { 'X-Action': 'save-time-policy' }
      });

      if (response.data.success) {
        setAlertType('success');
        setAlertMessage(existingPolicy ? 'Time policy updated successfully!' : 'Time policy created successfully!');
        setAlertOpen(true);
        
        // Wait for alert to show, then close modal
        setTimeout(() => {
          if (onSave) {
            onSave(response.data.data);
          }
          onClose();
        }, 1500);
      } else {
        setAlertType('error');
        setAlertMessage(response.data.message || 'Failed to save time policy');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('Error saving time policy:', error);
      setAlertType('error');
      setAlertMessage('Error saving time policy. Please try again.');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeWindow = () => {
    if (timeInStart && timeInEnd) {
      const start = new Date(`2000-01-01T${timeInStart}`);
      const end = new Date(`2000-01-01T${timeInEnd}`);
      const diff = (end - start) / (1000 * 60); // minutes
      return `${Math.floor(diff / 60)}h ${diff % 60}m window`;
    }
    return '';
  };

  const formatTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-7 h-7 text-[#0A7EB1]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Time Policy Setup</h2>
              <p className="text-white/80 text-sm">
                {existingPolicy ? 'Update company time policy' : 'Configure company time policy'}
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

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-[#0A7EB1] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-2">About Time Policy:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Sets official working hours for your company</li>
                  <li>• Automatically marks employees as Late, On-time, Undertime, or Overtime</li>
                  <li>• Grace period allows flexibility before marking late</li>
                  <li>• All times are in Philippine timezone (UTC+8)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Time In Policy */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Time In Policy</h3>
                <p className="text-sm text-gray-500">Define acceptable time-in window</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Time In Start (Earliest) <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={timeInStart}
                  onChange={(e) => setTimeInStart(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 6:00 AM - Employees can start timing in</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Time In End (Cutoff) <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={timeInEnd}
                  onChange={(e) => setTimeInEnd(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 8:00 AM - After this = Late</p>
              </div>
            </div>

            {/* Time Window Display */}
{timeInStart && timeInEnd && (
  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
    <div className="flex items-center space-x-3">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <div>
        <p className="text-sm font-semibold text-green-800">
          Time In Window: {calculateTimeWindow()}
        </p>
        <p className="text-xs text-green-700 mt-1">
          Between {formatTo12Hour(timeInStart)} and {formatTo12Hour(timeInEnd)} = On-time | After {formatTo12Hour(timeInEnd)} = Late
        </p>
      </div>
    </div>
  </div>
)}
          </div>

          {/* Grace Period */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Grace Period</h3>
                <p className="text-sm text-gray-500">Extra time before marking as late</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Grace Period (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., 15 minutes - Employee times in at 8:10 AM, still considered on-time (8:00 + 15 min grace)
              </p>
            </div>

            {gracePeriod > 0 && timeInEnd && (
  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mt-3">
    <div className="flex items-center space-x-3">
      <AlertCircle className="w-5 h-5 text-yellow-600" />
      <div>
        <p className="text-sm font-semibold text-yellow-800">
          Effective Late Cutoff: {
            (() => {
              const time = new Date(`2000-01-01T${timeInEnd}`);
              time.setMinutes(time.getMinutes() + parseInt(gracePeriod));
              return formatTo12Hour(time.toTimeString().substring(0, 5));
            })()
          }
        </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      With {gracePeriod} min grace period, employee marked late after this time
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Out & Required Hours */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Time Out & Working Hours</h3>
                <p className="text-sm text-gray-500">Define end of work and required hours</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Official Time Out <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={officialTimeOut}
                  onChange={(e) => setOfficialTimeOut(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 5:00 PM - Official end of work</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Required Working Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  value={requiredHours}
                  onChange={(e) => setRequiredHours(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 9 hours per day</p>
              </div>
            </div>

            {/* Working Hours Summary */}
            {timeInEnd && officialTimeOut && requiredHours && (
  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
    <div className="flex items-center space-x-3">
      <CheckCircle className="w-5 h-5 text-orange-600" />
      <div>
        <p className="text-sm font-semibold text-orange-800">
          Expected Schedule: {formatTo12Hour(timeInEnd)} to {formatTo12Hour(officialTimeOut)} ({requiredHours} hours)
        </p>
        <p className="text-xs text-orange-700 mt-1">
          Time out before {formatTo12Hour(officialTimeOut)} = Undertime | After {formatTo12Hour(officialTimeOut)} = Overtime
        </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Example Scenarios */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5">
            <h4 className="font-bold text-purple-900 mb-3 flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Example Scenarios with Current Settings:
            </h4>
            <div className="space-y-2 text-xs text-purple-800">
              <div className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Employee times in at 7:45 AM → <strong>On-time</strong> (within window)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 font-bold">⚠</span>
                <span>Employee times in at 8:10 AM → <strong>On-time</strong> (within grace period)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Employee times in at 8:30 AM → <strong>Late</strong> (22 minutes late)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-orange-600 font-bold">⏰</span>
                <span>Employee times out at 4:00 PM → <strong>Undertime</strong> (left 1 hour early)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">⏱</span>
                <span>Employee times out at 7:00 PM → <strong>Overtime</strong> (2 hours OT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-8 py-5 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : (existingPolicy ? 'Update Policy' : 'Save Policy')}</span>
          </button>
        </div>
      </div>

      {/* Time Policy Alert */}
      <TimePolicyAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        type={alertType}
        message={alertMessage}
      />
    </div>
  );
}