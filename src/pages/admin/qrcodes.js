import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, QrCode, Scan, Shield, Smartphone } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export default function QRCodes() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('qr-codes');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    const admin = JSON.parse(adminData);
    setAdminName(admin.name);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} adminName={adminName} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">QR Code Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage employee QR codes for attendance tracking</p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <QrCode className="w-12 h-12 text-purple-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">QR Code Management Coming Soon</h3>
                <p className="text-gray-600 mb-8">
                  Advanced QR code generation, management, and scanning features will be available here. 
                  Create and manage unique QR codes for each employee.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <QrCode className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Generate QR</h4>
                    <p className="text-sm text-gray-600">Create unique QR codes for employee identification</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Scan className="w-6 h-6 text-[#0A7EB1]" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Scan & Track</h4>
                    <p className="text-sm text-gray-600">Quick scanning for attendance check-in and check-out</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Secure Access</h4>
                    <p className="text-sm text-gray-600">Encrypted QR codes for secure authentication</p>
                  </div>
                </div>

                <div className="mt-12 space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 text-left">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                      <Smartphone className="w-6 h-6 mr-2" />
                      How QR Code Attendance Works:
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
                        <div>
                          <p className="font-semibold text-gray-800">Generate QR Code</p>
                          <p className="text-sm text-gray-600">Each employee receives a unique QR code linked to their profile</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
                        <div>
                          <p className="font-semibold text-gray-800">Employee Scans</p>
                          <p className="text-sm text-gray-600">Employees scan their QR code at the entrance using a scanner device</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
                        <div>
                          <p className="font-semibold text-gray-800">Automatic Recording</p>
                          <p className="text-sm text-gray-600">System automatically records time-in/time-out with timestamp</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">4</div>
                        <div>
                          <p className="font-semibold text-gray-800">Real-time Updates</p>
                          <p className="text-sm text-gray-600">Attendance data is instantly updated in the admin dashboard</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Development Status:</span> This feature is currently being developed. 
                      QR code functionality for attendance tracking will be available in the next update.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}