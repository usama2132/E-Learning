import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import usePagination from '../../hooks/usePagination';
import UserTable from './UserTable';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import '../../styles/dashboards/UserTable.css';
import '../../styles/dashboards/UserManagement.css';

// Move UserDetailsForm component to the top
const UserDetailsForm = ({ user, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    role: user?.role || 'student',
    status: user?.status || 'active',
    bio: user?.bio || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Add safety check for user prop
  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="user-details-form">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="3"
          placeholder="User biography..."
        />
      </div>

      <div className="user-stats-info">
        <div className="stat-info">
          <span className="label">Joined:</span>
          <span className="value">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div className="stat-info">
          <span className="label">Last Login:</span>
          <span className="value">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
          </span>
        </div>
        <div className="stat-info">
          <span className="label">Courses Enrolled:</span>
          <span className="value">{user.enrolledCourses?.length || 0}</span>
        </div>
        {user?.role === 'instructor' && (
          <div className="stat-info">
            <span className="label">Courses Created:</span>
            <span className="value">{user?.createdCourses?.length || 0}</span>
          </div>
        )}
      </div>

      <div className="modal-actions">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if useApi hook is available and handle gracefully
  let request;
  try {
    const apiHook = useApi();
    request = apiHook?.request;
  } catch (err) {
    console.warn('useApi hook not available:', err);
    // Provide a fallback request function
    request = async (url, options) => {
      console.warn('Mock API request:', url, options);
      // Return mock data for development
      return {
        success: true,
        data: {
          users: [
            {
              _id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              username: 'johndoe',
              role: 'student',
              status: 'active',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              enrolledCourses: []
            },
            {
              _id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              username: 'janesmith',
              role: 'instructor',
              status: 'active',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              enrolledCourses: [],
              createdCourses: []
            }
          ]
        }
      };
    };
  }

  // Initialize pagination with safe defaults and null checks
  const paginationHook = usePagination(filteredUsers, 10);
  const {
    currentPage = 1,
    itemsPerPage = 10,
    totalPages = 1,
    paginatedData = [],
    goToPage = () => {},
    setTotalItems = () => {} // Provide a no-op function as fallback
  } = paginationHook || {};

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedStatus]);

  useEffect(() => {
    // Add safety check for setTotalItems function
    if (setTotalItems && typeof setTotalItems === 'function') {
      setTotalItems(filteredUsers.length);
    }
  }, [filteredUsers, setTotalItems]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!request || typeof request !== 'function') {
        throw new Error('API request function not available');
      }
      
      const response = await request('/api/admin/users', {
        method: 'GET'
      });
      
      if (response?.success) {
        const usersData = response.data?.users || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        setError(response?.message || 'Failed to load users');
        setUsers([]); // Set empty array as fallback
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading users');
      setUsers([]); // Set empty array as fallback
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = [...users];

    // Search filter
    if (searchTerm && typeof searchTerm === 'string') {
      filtered = filtered.filter(user => {
        if (!user) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.username && user.username.toLowerCase().includes(searchLower))
        );
      });
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user && user.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user && user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (userId, action, additionalData = {}) => {
    if (!request || typeof request !== 'function') {
      setError('API request function not available');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const response = await request(`/api/admin/users/${userId}/${action}`, {
        method: 'PATCH',
        body: JSON.stringify(additionalData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response?.success) {
        // Update local state
        setUsers(prevUsers => 
          Array.isArray(prevUsers) ? prevUsers.map(user => 
            user && user._id === userId 
              ? { ...user, ...response.data?.user }
              : user
          ) : []
        );
        
        // Close modals if open
        setShowUserModal(false);
        setSelectedUser(null);
        
        console.log(`User ${action} successful`);
      } else {
        setError(response?.message || `Failed to ${action} user`);
      }
    } catch (err) {
      setError(err.message || `An error occurred while performing ${action}`);
      console.error(`User ${action} error:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !request || typeof request !== 'function') {
      setError('Cannot delete user: API not available');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const response = await request(`/api/admin/users/${userToDelete._id}`, {
        method: 'DELETE'
      });

      if (response?.success) {
        setUsers(prevUsers => 
          Array.isArray(prevUsers) ? prevUsers.filter(user => user && user._id !== userToDelete._id) : []
        );
        setShowDeleteModal(false);
        setUserToDelete(null);
        console.log('User deleted successfully');
      } else {
        setError(response?.message || 'Failed to delete user');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while deleting user');
      console.error('Delete user error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewUser = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const confirmDeleteUser = (user) => {
    if (!user) return;
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = async (updatedData) => {
    if (!selectedUser) return;
    
    await handleUserAction(selectedUser._id, 'update', updatedData);
  };

  const exportUsers = async () => {
    if (!request || typeof request !== 'function') {
      setError('Export not available: API not connected');
      return;
    }

    try {
      setError(null);
      const response = await request('/api/admin/users/export', {
        method: 'GET'
      });

      if (response?.success) {
        // Create and download CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to export users');
      console.error('Export error:', err);
    }
  };

  if (loading) {
    return <Loading message="Loading users..." />;
  }

  if (error && (!Array.isArray(users) || users.length === 0)) {
    return (
      <div className="user-management-error">
        <h3>Error Loading Users</h3>
        <p>{error}</p>
        <Button onClick={fetchUsers} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  // Safe array access for stats
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <Button 
            onClick={exportUsers} 
            variant="secondary"
            className="export-btn"
          >
            <i className="icon-download"></i>
            Export Users
          </Button>
          <Button 
            onClick={fetchUsers} 
            variant="primary"
            className="refresh-btn"
          >
            <i className="icon-refresh"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="user-filters">
        <div className="filter-row">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, email, or username..."
            className="user-search"
          />
          
          <div className="filter-selects">
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-filter"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Administrators</option>
            </select>

            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-value">{safeUsers.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {safeUsers.filter(user => user && user.status === 'active').length}
          </span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {safeUsers.filter(user => user && user.role === 'instructor').length}
          </span>
          <span className="stat-label">Instructors</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {safeUsers.filter(user => user && user.role === 'student').length}
          </span>
          <span className="stat-label">Students</span>
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={Array.isArray(paginatedData) ? paginatedData : []}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={confirmDeleteUser}
        onStatusChange={(userId, status) => handleUserAction(userId, 'status', { status })}
        onRoleChange={(userId, role) => handleUserAction(userId, 'role', { role })}
        loading={actionLoading}
      />

      {/* Pagination - Add safety check for goToPage */}
      {totalPages > 1 && goToPage && typeof goToPage === 'function' && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          className="user-pagination"
        />
      )}

      {/* User Details/Edit Modal */}
      {showUserModal && selectedUser && (
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          title="User Details"
          className="user-modal"
        >
          <UserDetailsForm
            user={selectedUser}
            onSave={handleUpdateUser}
            onCancel={() => {
              setShowUserModal(false);
              setSelectedUser(null);
            }}
            loading={actionLoading}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          title="Confirm Delete"
          className="delete-modal"
        >
          <div className="delete-confirmation">
            <p>
              Are you sure you want to delete user <strong>{userToDelete.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                variant="secondary"
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteUser}
                variant="danger"
                loading={actionLoading}
              >
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;