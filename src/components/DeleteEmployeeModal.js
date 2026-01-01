import { useState } from 'react';
import { X, AlertTriangle, Trash2, UserX } from 'lucide-react';
import DeleteEmployeeAlert from './alerts/DeleteEmployeeAlert';

export default function DeleteEmployeeModal({ isOpen, onClose, employee, onDelete }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      setAlertMessage('Please type "DELETE" to confirm');
      setAlertOpen(true);
      return;
    }

    setLoading(true);

    try {
      await onDelete(employee.employee_id);
      onClose();
      setConfirmText('');
    } catch (err) {
      console.error('Delete error:', err);
      setAlertMessage('Failed to unregister employee');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <UserX className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Unregister Employee</h2>
              <p className="text-white/80 text-sm">Remove employee from active roster</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Warning Banner */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-5">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900 text-base mb-2">Warning: This action cannot be undone!</p>
                <p className="text-sm text-gray-700 mb-3">
                  You are about to unregister this employee. This will mark them as inactive in the system.
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Employee will be marked as inactive (not deleted)</li>
                  <li>• Historical attendance records will be preserved</li>
                  <li>• Payroll records will remain accessible</li>
                  <li>• QR codes will be deactivated</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-600" />
              Employee to be Unregistered
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                {employee.avatar_url ? (
                  <img 
                    src={employee.avatar_url} 
                    alt={`${employee.first_name} ${employee.last_name}`}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl font-semibold">
                      {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-300">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Employee ID:</span> #{employee.employee_id}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all"
              placeholder="Type DELETE in capital letters"
            />
            <p className="text-xs text-gray-500 mt-2">
              This confirmation is required to prevent accidental unregistration
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-8 py-5 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmText.toLowerCase() !== 'delete'}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Unregistering...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>Unregister Employee</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Delete Employee Alert */}
      <DeleteEmployeeAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
      />
    </div>
  );
}