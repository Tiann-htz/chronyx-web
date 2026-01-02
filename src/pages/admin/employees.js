import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, Users, Plus, Archive, PhilippinePeso, Search, Mail, Calendar, Edit2, Trash2, QrCode } from 'lucide-react';
import axios from 'axios';
import EmployeeAlert from '../../components/alerts/EmployeeAlert';
import Sidebar from '../../components/Sidebar';
import EditEmployeeModal from '../../components/EditEmployeeModal';
import DeleteEmployeeModal from '../../components/DeleteEmployeeModal';
import AddEmployeeModal from '../../components/AddEmployeeModal';
import QRManagementModal from '../../components/QRManagementModal';
import ArchiveEmployeeModal from '../../components/ArchiveEmployeeModal';

export default function Employees() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('employees');
  const [adminName, setAdminName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [archivedEmployees, setArchivedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
const [editModalOpen, setEditModalOpen] = useState(false);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [qrModalOpen, setQrModalOpen] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState(null);


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
        // Separate active and archived employees
        const activeEmployees = response.data.data.filter(emp => emp.is_active === 1);
        const archived = response.data.data.filter(emp => emp.is_active === 0);
        setEmployees(activeEmployees);
        setArchivedEmployees(archived);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (employeeData) => {
    try {
      const response = await axios.post('/api/chronyxApi', employeeData, {
        headers: { 'X-Action': 'add-employee' }
      });

      if (response.data.success) {
        loadEmployees(); // Reload the list
        return response.data;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  };

  const handleEditEmployee = async (updateData) => {
    try {
      const response = await axios.post('/api/chronyxApi', updateData, {
        headers: { 'X-Action': 'update-employee' }
      });

      if (response.data.success) {
        setAlertType('success');
        setAlertMessage('Employee updated successfully!');
        setAlertOpen(true);
        loadEmployees(); // Reload the list
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await axios.post('/api/chronyxApi', 
        { employeeId },
        { headers: { 'X-Action': 'delete-employee' } }
      );

      if (response.data.success) {
        setAlertType('success');
        setAlertMessage('Employee unregistered successfully!');
        setAlertOpen(true);
        loadEmployees(); // Reload the list
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  };

   const handleRestoreEmployee = async (employeeId) => {
    try {
      const response = await axios.post('/api/chronyxApi', 
        { employeeId },
        { headers: { 'X-Action': 'restore-employee' } }
      );

      if (response.data.success) {
        setAlertType('success');
        setAlertMessage('Employee registered back successfully!');
        setAlertOpen(true);
        loadEmployees(); // Reload the list
      } else {
        throw new Error(response.data.message || 'Restore failed');
      }
    } catch (error) {
      console.error('Error restoring employee:', error);
      throw error;
    }
  };


  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };

  const openDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const openQRModal = (employee) => {
  setSelectedEmployee(employee);
  setQrModalOpen(true);
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

  const getQRStatus = (employee) => {
  if (!employee.qr_code) {
    return { label: 'No QR', color: 'bg-gray-100 text-gray-700', icon: '⚪' };
  }
  if (employee.qr_is_active === 1) {
    return { label: 'Active', color: 'bg-green-100 text-green-700', icon: '🟢' };
  }
  return { label: 'Inactive', color: 'bg-red-100 text-red-700', icon: '🔴' };
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:ring-2 focus:ring-[#0A7EB1] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center space-x-2"
                  onClick={() => setArchiveModalOpen(true)}
                >
                  <Archive className="w-5 h-5" />
                  <span>Archive ({archivedEmployees.length})</span>
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-[#0A7EB1] to-[#105891] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center space-x-2"
                  onClick={() => setAddModalOpen(true)}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Employee</span>
                </button>
              </div>
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
                     <PhilippinePeso className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
  <tr>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hourly Rate</th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">QR Status</th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined Date</th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
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
    {(() => {
      const status = getQRStatus(employee);
      return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${status.color}`}>
          <span className="mr-1">{status.icon}</span>
          {status.label}
        </span>
      );
    })()}
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
  <td className="px-6 py-4">
    <div className="flex items-center space-x-2">
      <button
        onClick={() => openEditModal(employee)}
        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
        title="Edit Employee"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => openQRModal(employee)}
        className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
        title="Manage QR Code"
      >
        <QrCode className="w-4 h-4" />
      </button>
      <button
        onClick={() => openDeleteModal(employee)}
        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
        title="Unregister Employee"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </td>
</tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
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

      {/* Modals */}
      <AddEmployeeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddEmployee}
      />

      <EditEmployeeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        employee={selectedEmployee}
        onSave={handleEditEmployee}
      />

      <DeleteEmployeeModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        employee={selectedEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* QR Management Modal */}
<QRManagementModal
  isOpen={qrModalOpen}
  onClose={() => setQrModalOpen(false)}
  employee={selectedEmployee}
  adminId={JSON.parse(localStorage.getItem('adminData'))?.id}
  onSuccess={() => {
    loadEmployees(); // Reload employees to update QR status
    setQrModalOpen(false);
  }}
/>
{/* Archive Modal */}
      <ArchiveEmployeeModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        employees={archivedEmployees}
        onRestore={handleRestoreEmployee}
      />
    {/* Employee Alert */}
      <EmployeeAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        type={alertType}
        message={alertMessage}
      />
    </div>
  );
}