import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, Users, Plus, Search, Mail, Calendar } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';

export default function Employees() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('employees');
  const [adminName, setAdminName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    const admin = JSON.parse(adminData);
    setAdminName(admin.name);
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/chronyxApi', { 
        headers: { 'X-Action': 'get-employees' } 
      });

      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#0A7EB1] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} adminName={adminName} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your organization's workforce</p>
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
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent outline-none transition-all"
                />
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-[#0A7EB1] to-[#105891] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Employee</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-800">{employees.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#0A7EB1]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Status</p>
                    <p className="text-3xl font-bold text-green-600">{employees.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Avg. Hourly Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(
                        employees.reduce((sum, emp) => sum + parseFloat(emp.hourly_rate), 0) / employees.length || 0
                      )}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hourly Rate</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.employee_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-mono font-semibold">
                              #{employee.employee_id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
  {employee.avatar_url ? (
    <img 
      src={employee.avatar_url} 
      alt={`${employee.first_name} ${employee.last_name}`}
      className="w-10 h-10 rounded-full object-cover mr-3"
    />
  ) : (
    <div className="w-10 h-10 bg-gradient-to-br from-[#0A7EB1] to-[#105891] rounded-full flex items-center justify-center mr-3">
      <span className="text-white text-sm font-semibold">
        {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
      </span>
    </div>
  )}
  <div>
    <p className="text-sm font-semibold text-gray-800">
      {employee.first_name} {employee.last_name}
    </p>
  </div>
</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {employee.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-[#0A7EB1]">
                              {formatCurrency(employee.hourly_rate)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDate(employee.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">
                            {searchQuery ? 'No employees found matching your search' : 'No employees yet'}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchQuery ? 'Try a different search term' : 'Add employees to get started'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}