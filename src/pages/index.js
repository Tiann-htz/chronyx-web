import { useRouter } from 'next/router';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Chronyx</span>
          </div>
          
          {/* Admin Portal Button */}
          <button
            onClick={() => router.push('/admin/login')}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Hero */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-[#0A7EB1] px-6 py-2 rounded-full mb-6 font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Modern Attendance Management</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Simplify Your
              <span className="block bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] bg-clip-text text-transparent">
                Workforce Management
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Chronyx is a comprehensive time tracking and attendance management system designed to streamline your organization's workforce operations with cutting-edge QR code technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/admin/login')}
                className="px-8 py-4 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1"
              >
                Get Started
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">QR Code Scanning</h3>
              <p className="text-gray-600 leading-relaxed">
                Fast and secure attendance tracking using unique QR codes for each employee. No manual entry required.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#105891] to-[#0A6BA3] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Automated Payroll</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically calculate salaries based on work hours. Generate payroll with just a few clicks.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A6BA3] to-[#0A7EB1] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Employee Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive employee profiles with attendance history, work hours, and performance tracking.
              </p>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-[#0A7EB1] via-[#105891] to-[#0A6BA3] rounded-3xl p-12 text-white mb-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Why Choose Chronyx?</h2>
              <p className="text-xl text-white/90 mb-10">
                Built for modern organizations that value efficiency, accuracy, and simplicity
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-5xl font-bold mb-2">99.9%</div>
                  <div className="text-white/80">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">&lt;2s</div>
                  <div className="text-white/80">Scan Time</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">24/7</div>
                  <div className="text-white/80">Availability</div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Register Employees</h3>
                  <p className="text-gray-600 text-lg">Add employees to the system and generate unique QR codes for each team member.</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#105891] to-[#0A6BA3] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan to Clock In/Out</h3>
                  <p className="text-gray-600 text-lg">Employees scan their QR codes at the attendance station to record their time.</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0A6BA3] to-[#0A7EB1] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Automatic Tracking</h3>
                  <p className="text-gray-600 text-lg">The system automatically calculates work hours and generates reports for payroll.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join organizations that trust Chronyx for their attendance management
            </p>
            <button
              onClick={() => router.push('/admin/login')}
              className="px-10 py-4 bg-gradient-to-r from-[#0A7EB1] to-[#105891] hover:from-[#105891] hover:to-[#0A6BA3] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1"
            >
              Access Admin Portal
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Chronyx</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Chronyx. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}