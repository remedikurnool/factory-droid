'use client';

import { useState, useEffect } from 'react';
import { usersApi, User, UserStats } from '@/lib/api/users';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Activity,
  Shield
} from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [searchQuery, roleFilter, statusFilter, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      };
      const data = await usersApi.getUsers(filters);
      setUsers(data.users || data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await usersApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleActivateUser = async (id: string) => {
    try {
      await usersApi.activateUser(id);
      loadUsers();
    } catch (err) {
      console.error('Error activating user:', err);
      alert('Failed to activate user');
    }
  };

  const handleDeactivateUser = async (id: string) => {
    try {
      await usersApi.deactivateUser(id);
      loadUsers();
    } catch (err) {
      console.error('Error deactivating user:', err);
      alert('Failed to deactivate user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersApi.deleteUser(id);
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await usersApi.bulkActivate(selectedUsers);
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      console.error('Error bulk activating:', err);
      alert('Failed to activate users');
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await usersApi.bulkDeactivate(selectedUsers);
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      console.error('Error bulk deactivating:', err);
      alert('Failed to deactivate users');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await usersApi.exportUsers('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Failed to export users');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      doctor: 'bg-green-100 text-green-800',
      pharmacist: 'bg-purple-100 text-purple-800',
      lab_technician: 'bg-yellow-100 text-yellow-800',
      customer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.customer;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage customers, staff, and administrators</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
                </div>
                <UserPlus className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Today</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.activeToday}</p>
                </div>
                <Activity className="h-10 w-10 text-purple-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
            <option value="staff">Staff</option>
            <option value="doctor">Doctors</option>
            <option value="pharmacist">Pharmacists</option>
            <option value="lab_technician">Lab Technicians</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3">
            <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
            <button
              onClick={handleBulkActivate}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Deactivate
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Last Login</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="inline-flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/users/${user.id}`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivateUser(user.id)}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Deactivate"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Activate"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
