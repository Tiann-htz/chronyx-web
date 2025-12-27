import { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Lock, User, Copy, CheckCircle, AlertCircle, Camera, RefreshCw } from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hourlyRate: '100.00'
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Password Display, 3: Success

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        hourlyRate: '100.00'
      });
      setGeneratedPassword('');
      setPasswordCopied(false);
      setError('');
      setStep(1);
    }
  }, [isOpen]);

  const generateSecurePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    
    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    
    // Fill the rest randomly (total length: 16 characters)
    for (let i = 3; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleContinue = () => {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('First name, last name, and email are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Hourly rate validation
    const rate = parseFloat(formData.hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      setError('Please enter a valid hourly rate');
      return;
    }

    // Generate password and move to step 2
    const newPassword = generateSecurePassword();
    setGeneratedPassword(newPassword);
    setPasswordCopied(false);
    setStep(2);
  };

  const handleRegeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setGeneratedPassword(newPassword);
    setPasswordCopied(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 3000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const employeeData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: generatedPassword,
        hourlyRate: parseFloat(formData.hourlyRate)
      };

      await onSave(employeeData);
      setStep(3); // Move to success step
    } catch (err) {
      setError(err.message || 'Failed to register employee');
      setStep(1); // Go back to form
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 3) {
      onClose();
    } else {
      if (confirm('Are you sure you want to cancel? The generated password will be lost.')) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
        onClick={step === 3 ? onClose : handleClose}
      ></div>

      {/* Modal */}
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${step === 2 ? 'max-w-6xl' : 'max-w-2xl'} overflow-hidden flex flex-col transform transition-all duration-300 max-h-[95vh]`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-7 h-7 text-[#0A7EB1]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add New Employee</h2>
              <p className="text-white/80 text-sm">
                {step === 1 && 'Register employee manually'}
                {step === 2 && 'Generated secure password'}
                {step === 3 && 'Registration successful!'}
              </p>
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
        <div className="p-8 space-y-6 overflow-y-auto"
          style={{ maxHeight: 'calc(95vh - 200px)' }}
        >
          {/* Step 1: Employee Information Form */}
          {step === 1 && (
            <>
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-[#0A7EB1] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-2">Manual Employee Registration</p>
                    <p className="text-xs text-gray-700 mb-2">
                      Use this form to register an employee who cannot sign up through the mobile app.
                    </p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• The system will generate a secure password automatically</li>
                      <li>• You must share this password with the employee</li>
                      <li>• Recommend taking a photo for record keeping</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Hourly Rate (PHP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-semibold">₱</span>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-[#0A7EB1] outline-none transition-all"
                      placeholder="100.00"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Password Display */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Instructions and Employee Details */}
              <div className="space-y-6">
                {/* Important Instructions */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-5">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-orange-900 text-base mb-2">⚠️ IMPORTANT: Save This Password!</p>
                      <ul className="text-sm text-gray-800 space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2">1.</span>
                          <span>Copy or write down this password</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">2.</span>
                          <span><strong>Take a photo of this screen</strong> for your records</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">3.</span>
                          <span>Share this password with the employee privately</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">4.</span>
                          <span>Inform them to <strong>NEVER forget or lose this password</strong></span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">5.</span>
                          <span>Once you click "Register Employee", this password will not be shown again</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-[#0A7EB1]" />
                    Employee Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Name:</span>
                      <p className="text-gray-900 font-medium text-base mt-1">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Email:</span>
                      <p className="text-gray-900 font-medium text-base mt-1">{formData.email}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Hourly Rate:</span>
                      <p className="text-gray-900 font-medium text-base mt-1">₱{parseFloat(formData.hourlyRate).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Security Note:</strong> This password is randomly generated and cannot be recovered if lost. 
                    Make sure to save it before proceeding.
                  </p>
                </div>
              </div>

              {/* Right Column - Password Display */}
              <div className="space-y-6">
                {/* Generated Password */}
                <div className="bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-2xl p-6 border-4 border-[#0A7EB1] lg:sticky lg:top-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Generated Password
                    </h3>
                    <button
                      onClick={handleRegeneratePassword}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Generate New Password"
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="bg-white rounded-xl p-6 mb-4">
                    <p className="text-3xl font-mono font-bold text-gray-800 text-center tracking-widest break-all">
                      {generatedPassword}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCopyPassword}
                      className="flex-1 px-4 py-3 bg-white hover:bg-gray-100 text-[#0A7EB1] rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      {passwordCopied ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>Copy Password</span>
                        </>
                      )}
                    </button>
                    <div className="p-3 bg-white/20 rounded-xl" title="Take a photo">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span>Password Strength:</span>
                      <span className="font-bold">Very Strong</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-white/80 text-xs mt-2">
                      16 characters • Letters & Numbers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success Message */}
          {step === 3 && (
            <>
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Employee Registered Successfully! 🎉</h3>
                <p className="text-gray-600 mb-6">
                  {formData.firstName} {formData.lastName} has been added to the system.
                </p>
              </div>

              {/* Success Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-2">What's Next?</p>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>✓ Employee can now be found in the employee list</li>
                      <li>✓ They can log in using their email and the password you provided</li>
                      <li>✓ Remind them to check if they have installed the mobile app</li>
                      <li>✓ They should generate their QR code after first login</li>
                      <li>✓ Ensure they understand they must never forget their password</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Employee Summary */}
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Registered Employee</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <p className="text-gray-900 font-medium text-base mt-1">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>
                    <p className="text-gray-900 font-medium text-base mt-1">{formData.email}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Hourly Rate:</span>
                    <p className="text-gray-900 font-medium text-base mt-1">₱{parseFloat(formData.hourlyRate).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Status:</span>
                    <p className="text-green-600 font-bold text-base mt-1">Active</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-8 py-5 bg-gray-50 flex justify-end space-x-3">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Continue</span>
                <Lock className="w-5 h-5" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Register Employee</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 3 && (
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}