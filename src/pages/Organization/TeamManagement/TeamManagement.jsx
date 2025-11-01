import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import './TeamManagement.css';

const TeamManagement = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'user',
    department: '',
    firstName: '',
    lastName: ''
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load team members from API
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${user.organization}/team-members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        addNotification('error', 'Failed to load team members');
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      addNotification('error', 'Error loading team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteData.email) return;

    setInviteLoading(true);
    try {
      const response = await fetch(`/api/organizations/${user.organization}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteData)
      });

      if (response.ok) {
        setShowInviteModal(false);
        setInviteData({ email: '', role: 'user', department: '', firstName: '', lastName: '' });
        addNotification('success', 'Invitation sent successfully');
        loadTeamMembers();
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      addNotification('error', 'Error sending invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        addNotification('success', 'User role updated successfully');
        loadTeamMembers();
      } else {
        addNotification('error', 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      addNotification('error', 'Error updating user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        addNotification('success', `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        loadTeamMembers();
      } else {
        addNotification('error', 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addNotification('error', 'Error updating user status');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleRemoveUser = async () => {
    if (!userToDelete) return;

    setActionLoading(userToDelete.id);
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        addNotification('success', 'User removed successfully');
        loadTeamMembers();
      } else {
        addNotification('error', 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      addNotification('error', 'Error removing user');
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (updatedData) => {
    if (!editingUser) return;

    setActionLoading(editingUser.id);
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        addNotification('success', 'User updated successfully');
        loadTeamMembers();
        setEditingUser(null);
      } else {
        addNotification('error', 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      addNotification('error', 'Error updating user');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleDisplayName = (role) => {
    const roleMap = {
      user: 'User',
      manager: 'Manager',
      admin: 'Admin',
      super_admin: 'Super Admin'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="team-management">
        <div className="loading-spinner"></div>
        <p>Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="team-management">
      <div className="team-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage users and permissions in {user?.organization?.name || user?.organizationName}</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="btn btn-primary"
        >
          + Invite Team Member
        </button>
      </div>

      {/* Filters and Search */}
      <div className="team-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="team-stats">
        <div className="stat-card">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{users.filter(u => u.status === 'active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{users.filter(u => u.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="team-table-container">
        <table className="team-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.firstName} {user.lastName}</div>
                      {user.id === user.id && <div className="current-user-badge">You</div>}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.id === user.id || actionLoading === user.id}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{user.department || '-'}</td>
                <td>
                  <div className="status-container">
                    <select 
                      value={user.status} 
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      disabled={user.id === user.id || actionLoading === user.id}
                      className="status-select"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                    <span className={`status-indicator ${user.status}`}></span>
                  </div>
                </td>
                <td>
                  {user.lastActive ? (
                    <div className="last-active">
                      <div>{new Date(user.lastActive).toLocaleDateString()}</div>
                      <div className="time-ago">
                        {new Date(user.lastActive).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    'Never'
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditUser(user)}
                      disabled={actionLoading === user.id}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => confirmDeleteUser(user)}
                      disabled={user.id === user.id || actionLoading === user.id}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No team members found</h3>
            <p>Try adjusting your search or filters, or invite new team members.</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button 
                className="modal-close"
                onClick={() => setShowInviteModal(false)}
                disabled={inviteLoading}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={inviteData.firstName}
                    onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={inviteData.lastName}
                    onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={inviteData.department}
                    onChange={(e) => setInviteData({...inviteData, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowInviteModal(false)} 
                className="btn btn-secondary"
                disabled={inviteLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleInvite} 
                className="btn btn-primary"
                disabled={!inviteData.email || inviteLoading}
              >
                {inviteLoading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Remove Team Member</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading === userToDelete.id}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to remove <strong>{userToDelete.firstName} {userToDelete.lastName}</strong> from your team?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="btn btn-secondary"
                disabled={actionLoading === userToDelete.id}
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveUser} 
                className="btn btn-danger"
                disabled={actionLoading === userToDelete.id}
              >
                {actionLoading === userToDelete.id ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Removing...
                  </>
                ) : (
                  'Remove User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
