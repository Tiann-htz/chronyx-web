import { useRouter } from 'next/router';
import { useState } from 'react';
import QRScannerModal from '../components/QRScannerModal';

export default function Home() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [actionType, setActionType] = useState('time-in');

  const handleOpenScanner = (type) => {
    setActionType(type);
    setShowScanner(true);
    setScanResult(null);
  };

  const handleScanSuccess = async (qrCode) => {
    console.log('🎯 QR Code scanned:', qrCode);

    try {
      // Call API to record attendance
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
        console.log('📊 Response:', data);
        
        setScanResult({
          success: true,
          message: data.message,
          userName: data.data.userName,
          time: data.data.time,
          actionType: data.data.actionType
        });
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

  const handleAdminPortal = () => {
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header with Admin Portal Button */}
      <header className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Chronyx</span>
          </div>
          
          <button
            onClick={handleAdminPortal}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2.5 rounded-lg transition duration-200 border border-white/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Time Tracking Made Simple
            </h1>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
              Scan your QR code to clock in and out. Fast, secure, and reliable attendance management.
            </p>
          </div>

          {/* Success/Error Message */}
          {scanResult && (
            <div className={`max-w-2xl mx-auto mb-8 p-6 rounded-xl border-2 ${
              scanResult.success 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-start">
                <div className={`flex-shrink-0 ${
                  scanResult.success ? 'text-green-500' : 'text-red-500'
                }`}>
                  {scanResult.success ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className={`font-bold text-lg ${
                    scanResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {scanResult.success ? 'Success!' : 'Error'}
                  </h3>
                  <p className={`mt-1 ${
                    scanResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {scanResult.message}
                  </p>
                  {scanResult.success && (
                    <div className="mt-2 text-sm text-green-600">
                      <p>Employee: <strong>{scanResult.userName}</strong></p>
                      <p>Time: <strong>{scanResult.time}</strong></p>
                      <p>Action: <strong>{scanResult.actionType.toUpperCase()}</strong></p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setScanResult(null)}
                  className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Main Action Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Employee Time Clock
                </h2>
                <p className="text-indigo-100">
                  Scan employee QR code to record attendance
                </p>
              </div>

              {/* Card Body */}
              <div className="p-8">
                <div className="grid grid-cols-2 gap-4">
                  {/* Time In Button */}
                  <button
                    onClick={() => handleOpenScanner('time-in')}
                    className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-8 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="text-xl">Time In</span>
                      <span className="text-sm opacity-90">Start Shift</span>
                    </div>
                  </button>

                  {/* Time Out Button */}
                  <button
                    onClick={() => handleOpenScanner('time-out')}
                    className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-8 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="text-xl">Time Out</span>
                      <span className="text-sm opacity-90">End Shift</span>
                    </div>
                  </button>
                </div>

                {/* Info */}
                <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-indigo-800 text-center">
                    <strong>Note:</strong> Click the button above to open the camera and scan employee QR code
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Secure</h3>
              <p className="text-indigo-200 text-sm">Protected QR code authentication</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Fast</h3>
              <p className="text-indigo-200 text-sm">Clock in/out in seconds</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Accurate</h3>
              <p className="text-indigo-200 text-sm">Precise time tracking</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6">
        <p className="text-indigo-300 text-sm">
          © 2024 Chronyx. Powered by QRLogix
        </p>
      </footer>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}