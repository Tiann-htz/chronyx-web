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
            // Select the first camera (usually back camera on mobile, any camera on laptop)
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

          // Stop scanning
          await stopScanning();

          // Call success handler
          if (onScanSuccess) {
            await onScanSuccess(decodedText);
          }

          setProcessing(false);
        },
        (errorMessage) => {
          // Ignore common scan errors (these fire constantly when no QR is detected)
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Scan QR Code</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
            disabled={processing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-6">
          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instructions
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ask the employee to open their QR code on their phone</li>
              <li>• Position the QR code within the scanning frame</li>
              <li>• The system will automatically detect and process the QR code</li>
              <li>• Wait for the confirmation message</li>
            </ul>
          </div>

          {/* Camera Selector */}
          {cameras.length > 1 && !processing && (
            <div className="mb-4 flex items-center justify-between bg-indigo-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-indigo-900">
                Using: {cameras.find(c => c.id === selectedCamera)?.label || 'Camera'}
              </span>
              <button
                onClick={handleCameraSwitch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Switch Camera
              </button>
            </div>
          )}

          {/* Scanner Container */}
          <div className="bg-gray-900 rounded-lg overflow-hidden relative">
            {processing ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
                <p className="text-white font-medium">Processing QR Code...</p>
              </div>
            ) : (
              <>
                <div id="qr-reader" style={{ width: '100%', minHeight: '400px' }}></div>
                
                {/* Overlay scanning frame */}
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-green-500 rounded-lg animate-pulse"></div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-800 font-medium">{error}</p>
                  <p className="text-red-600 text-sm mt-1">
                    Please make sure you've granted camera permissions to this website.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          {scanning && !processing && !error && (
            <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium text-center flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                📷 Camera active. Point at QR code to scan...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
            disabled={processing}
          >
            Close
          </button>
        </div>
      </div>

      {/* Global styles for html5-qrcode */}
      <style jsx global>{`
        #qr-reader {
          width: 100% !important;
        }
        #qr-reader video {
          width: 100% !important;
          max-width: 100% !important;
          border-radius: 8px;
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