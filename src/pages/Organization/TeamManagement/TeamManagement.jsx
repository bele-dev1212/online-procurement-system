import React, { useState } from 'react';
import './TeamManagement.css';

const TeamManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@abccorp.com',
      role: 'Admin',
      department: 'Management',
      status: 'Active',
      lastActive: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@abccorp.com',
      role: 'Procurement Manager',
      department: 'Procurement',
      status: 'Active',
      lastActive: '2024-01-14'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@abccorp.com',
      role: 'User',
      department: 'Operations',
      status: 'Inactive',
      lastActive: '2024-01-10'
    }
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'User',
    department: ''
  });

  const handleInvite = () => {
    console.log('Sending invitation:', inviteData);
    setShowInviteModal(false);
    setInviteData({ email: '', role: 'User', department: '' });
  };

  return (
    <div className="team-management">
      <div className="team-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage users and permissions in your organization</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="btn btn-primary"
        >
          Invite Team Member
        </button>
      </div>

      <div className="team-table">
        <table>
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
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(e) => {/* Handle role change */}}>
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>{user.department}</td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.lastActive}</td>
                <td>
                  <button className="btn btn-sm btn-secondary">Edit</button>
                  <button className="btn btn-sm btn-danger">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Invite Team Member</h2>
            <div className="modal-content">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
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
            <div className="modal-actions">
              <button onClick={() => setShowInviteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleInvite} className="btn btn-primary">
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
