import { useState, useEffect } from 'react';
import { X, QrCode, Calendar, Mail, User, AlertCircle, CheckCircle, Download } from 'lucide-react';
import axios from 'axios';

export default function QRManagementModal({ isOpen, onClose, employee, adminId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const [showDeactivateForm, setShowDeactivateForm] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    if (isOpen && employee) {
      loadQRDetails();
    }
  }, [isOpen, employee]);

  const loadQRDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/chronyxApi', {
        employeeId: employee.employee_id
      }, {
        headers: { 'X-Action': 'get-employee-qr' }
      });

      if (response.data.success) {
        setQrDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error loading QR details:', error);
      alert('Failed to load QR details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    const reason = deactivationReason === 'other' ? customReason : deactivationReason;

    if (!reason.trim()) {
      alert('Please provide a reason for deactivation');
      return;
    }

    if (!confirm(`Deactivate QR code for ${employee.first_name} ${employee.last_name}?\n\nReason: ${reason}\n\nThe employee will not be able to use this QR code for attendance.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/chronyxApi', {
        employeeId: employee.employee_id,
        adminId: adminId,
        reason: reason
      }, {
        headers: { 'X-Action': 'deactivate-qr' }
      });

      if (response.data.success) {
        alert('✅ QR code deactivated successfully!');
        setShowDeactivateForm(false);
        setDeactivationReason('');
        setCustomReason('');
        if (onSuccess) onSuccess();
        loadQRDetails(); // Reload to show updated status
      }
    } catch (error) {
      console.error('Error deactivating QR:', error);
      alert('❌ Failed to deactivate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!confirm(`Reactivate QR code for ${employee.first_name} ${employee.last_name}?\n\nThe employee will be able to use this QR code for attendance again.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/chronyxApi', {
        employeeId: employee.employee_id
      }, {
        headers: { 'X-Action': 'activate-qr' }
      });

      if (response.data.success) {
        alert('✅ QR code activated successfully!');
        if (onSuccess) onSuccess();
        loadQRDetails(); // Reload to show updated status
      }
    } catch (error) {
      console.error('Error activating QR:', error);
      alert('❌ Failed to activate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDetails?.qr_code) return;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrDetails.qr_code)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${employee.first_name}_${employee.last_name}_${employee.employee_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyQRCode = () => {
    if (!qrDetails?.qr_code) return;
    
    navigator.clipboard.writeText(qrDetails.qr_code);
    alert('✅ QR code copied to clipboard!');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  const reasonOptions = [
    { value: 'excessive_absences', label: 'Excessive Absences' },
    { value: 'unauthorized_overtime', label: 'Unauthorized Overtime' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'employee_request', label: 'Employee Request' },
    { value: 'security_concern', label: 'Security Concern' },
    { value: 'other', label: 'Other (Specify)' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <QrCode className="w-7 h-7 text-[#0A7EB1]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">QR Code Management</h2>
              <p className="text-white/80 text-sm">Manage employee QR access</p>
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
        <div className="flex-1 overflow-y-auto p-8">
          {loading && !qrDetails ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-[#0A7EB1] border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Loading QR details...</p>
            </div>
          ) : qrDetails && qrDetails.qr_code ? (
            <div className="space-y-6">
              {/* Employee Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  {employee.avatar_url ? (
                    <img 
                      src={employee.avatar_url} 
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>ID: {employee.employee_id}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{employee.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* QR Image */}
                  <div className="flex-shrink-0">
                    <div className="bg-white p-4 border-4 border-gray-200 rounded-2xl shadow-lg">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDetails.qr_code)}`}
                        alt="QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  {/* QR Details */}
                  <div className="flex-1 space-y-4">
                    {/* Status Badge */}
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Current Status</p>
                      {qrDetails.is_active === 1 ? (
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Active
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Inactive
                        </div>
                      )}
                    </div>

                    {/* QR Code Value */}
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">QR Code ID</p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono text-gray-800 break-all">
                          {qrDetails.qr_code}
                        </code>
                        <button
                          onClick={handleCopyQRCode}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold transition-colors"
                          title="Copy QR Code"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    {/* Creation Date */}
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Created On</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(qrDetails.qr_created_at)}</span>
                      </div>
                    </div>

                    {/* Last Scan */}
                    {qrDetails.last_scan_at && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Last Scanned</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(qrDetails.last_scan_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deactivation Info (if inactive) */}
              {qrDetails.is_active === 0 && qrDetails.deactivation_reason && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-red-800 mb-2">Deactivation Details</p>
                      <div className="space-y-1 text-sm text-red-700">
                        <p><strong>Reason:</strong> {qrDetails.deactivation_reason}</p>
                        <p><strong>Deactivated On:</strong> {formatDate(qrDetails.deactivated_at)}</p>
                        {qrDetails.deactivated_by_name && (
                          <p><strong>Deactivated By:</strong> {qrDetails.deactivated_by_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deactivation Form (if showing) */}
              {showDeactivateForm && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
                  <h4 className="font-bold text-orange-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Deactivate QR Code
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={deactivationReason}
                        onChange={(e) => setDeactivationReason(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                      >
                        <option value="">-- Select a reason --</option>
                        {reasonOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {deactivationReason === 'other' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Specify Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Enter the reason for deactivation..."
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all resize-none"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleDeactivate}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Deactivating...' : 'Confirm Deactivation'}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeactivateForm(false);
                          setDeactivationReason('');
                          setCustomReason('');
                        }}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!showDeactivateForm && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download QR</span>
                  </button>

                  {qrDetails.is_active === 1 ? (
                    <button
                      onClick={() => setShowDeactivateForm(true)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>Deactivate QR</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleActivate}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Activate QR</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* No QR Code */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No QR Code Yet</h3>
              <p className="text-gray-600 mb-6">
                This employee hasn't created their QR code in the mobile app yet.
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Instructions for employee:</strong><br/>
                  Open the Chronyx mobile app → Click "Create My QR ID" on the home screen
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-8 py-5 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}