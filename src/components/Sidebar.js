import { useState } from 'react';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, Calendar, Banknote, QrCode, FileText, LogOut, Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Sidebar({ activeTab, setActiveTab, adminName }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'employees', label: 'Employees', icon: Users, href: '/admin/employees' },
  { id: 'attendance', label: 'Attendance', icon: Calendar, href: '/admin/attendance' },
  { id: 'payroll', label: 'Payroll', icon: Banknote, href: '/admin/payroll' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/admin/reports' }
];

  const handleLogout = () => {
    localStorage.removeItem('adminData');
    router.push('/');
  };

  const handleNavigation = (item) => {
  router.push(item.href);
};

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-40 ${
          sidebarOpen ? 'w-72' : 'lg:w-20'
        } h-screen bg-gradient-to-b from-[#0A7EB1] via-[#105891] to-[#0A6BA3] text-white transition-all duration-300 flex flex-col shadow-2xl`}
      >
      {/* Admin Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FEFDFD] to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-[#0A7EB1] font-bold text-lg">{adminName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{adminName}</p>
                    <p className="text-xs text-white/70">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors mx-auto"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="space-y-1 px-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center ${
                    sidebarOpen ? 'px-4' : 'px-3 justify-center'
                  } py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 shadow-lg border-l-4 border-[#FEFDFD]'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className={`${sidebarOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              sidebarOpen ? 'px-6' : 'px-4 justify-center'
            } py-4 border-t border-white/10 hover:bg-white/10 transition-colors group`}
          >
            <LogOut className="w-5 h-5 group-hover:text-white/80" />
            {sidebarOpen && <span className="ml-3 font-medium group-hover:text-white/80">Logout</span>}
          </button>
          
          {/* Footer */}
          <div className={`${sidebarOpen ? 'px-6' : 'px-4'} py-4 border-t border-white/10`}>
            <p className={`text-white/50 text-xs ${sidebarOpen ? 'text-left' : 'text-center'}`}>
              {sidebarOpen ? '© 2025 Chronyx. All rights reserved.' : '© 2025'}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}