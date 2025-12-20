import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const html5QrcodeRef = useRef(null);

  // Get available cameras
  useEffect(() => {
    if (isOpen) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          console.log('📷 Available cameras:', devices);
          if (devices && devices.length) {
            setCameras(devices);
            setSelectedCamera(devices[0].id);
          } else {
            setError('No cameras found on this device');
          }
        })
        .catch((err) => {
          console.error('❌ Camera detection error:', err);
          setError('Unable to access cameras. Please check permissions.');
        });
    }
  }, [isOpen]);

  // Start scanning when camera is selected
  useEffect(() => {
    if (isOpen && selectedCamera && !html5QrcodeRef.current) {
      startScanning();
    }

    return () => {
      if (html5QrcodeRef.current && !isOpen) {
        stopScanning();
      }
    };
  }, [isOpen, selectedCamera]);

  const startScanning = async () => {
    try {
      console.log('🎬 Starting scanner with camera:', selectedCamera);
      
      const html5Qrcode = new Html5Qrcode("qr-reader");
      html5QrcodeRef.current = html5Qrcode;

      await html5Qrcode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText, decodedResult) => {
          if (processing) return;
          
          setProcessing(true);
          console.log(`✅ QR Code detected: ${decodedText}`);

          await stopScanning();

          if (onScanSuccess) {
            await onScanSuccess(decodedText);
          }

          setProcessing(false);
        },
        (errorMessage) => {
          if (!errorMessage.includes('NotFoundException')) {
            console.warn('Scan frame error:', errorMessage);
          }
        }
      );

      setScanning(true);
      setError('');
      console.log('✅ Scanner started successfully');
    } catch (err) {
      console.error('❌ Failed to start scanner:', err);
      setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
    }
  };

  const stopScanning = async () => {
    if (html5QrcodeRef.current) {
      try {
        console.log('🛑 Stopping scanner...');
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  const handleClose = async () => {
    console.log('🚪 Closing scanner modal...');
    await stopScanning();
    setError('');
    setProcessing(false);
    setCameras([]);
    setSelectedCamera(null);
    onClose();
  };

  const handleCameraSwitch = async () => {
    if (cameras.length > 1) {
      await stopScanning();
      const currentIndex = cameras.findIndex(cam => cam.id === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCamera(cameras[nextIndex].id);
      console.log('🔄 Switching to camera:', cameras[nextIndex].label);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop with blur - similar to PayrollModal */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-[#0A7EB1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Scan QR Code</h2>
              <p className="text-white/80 text-sm">Position QR code in the camera frame</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            disabled={processing}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scanner Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instructions
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Ask the employee to open their QR code on their phone</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Position the QR code within the scanning frame below</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The system will automatically detect and process the QR code</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Wait for the confirmation message</span>
              </li>
            </ul>
          </div>

          {/* Camera Selector */}
          {cameras.length > 1 && !processing && (
            <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-[#0A7EB1]/10 to-[#105891]/10 p-4 rounded-xl border border-[#0A7EB1]/20">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-[#0A7EB1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">
                  {cameras.find(c => c.id === selectedCamera)?.label || 'Camera'}
                </span>
              </div>
              <button
                onClick={handleCameraSwitch}
                className="bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Switch Camera</span>
              </button>
            </div>
          )}

          {/* Scanner Container */}
          <div className="bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl">
            {processing ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0A7EB1] mb-4"></div>
                <p className="text-white font-semibold text-lg">Processing QR Code...</p>
                <p className="text-white/60 text-sm mt-2">Please wait...</p>
              </div>
            ) : (
              <>
                <div id="qr-reader" style={{ width: '100%', minHeight: '400px' }}></div>
                
                {/* Overlay scanning frame */}
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative">
                      <div className="w-64 h-64 border-4 border-[#0A7EB1] rounded-2xl animate-pulse shadow-lg"></div>
                      {/* Corner decorations */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-800 font-semibold text-lg">{error}</p>
                  <p className="text-red-600 text-sm mt-2">
                    Please make sure you've granted camera permissions to this website.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          {scanning && !processing && !error && (
            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
              <p className="text-green-800 font-semibold text-center flex items-center justify-center text-lg">
                <svg className="w-6 h-6 mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Camera is active. Position QR code to scan...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 px-8 py-5 bg-gray-50 flex justify-end">
          <button
            onClick={handleClose}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
            disabled={processing}
          >
            Close Scanner
          </button>
        </div>
      </div>

      {/* Global styles for html5-qrcode */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        #qr-reader {
          width: 100% !important;
        }
        #qr-reader video {
          width: 200% !important;
          max-width: 100% !important;
          border-radius: 16px;
          display: block !important;
          object-fit: cover !important;
        }
        #qr-reader canvas {
          display: none !important;
        }
      `}</style>
    </div>
  );
}