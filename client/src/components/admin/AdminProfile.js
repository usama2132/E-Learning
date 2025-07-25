import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import '../../styles/pages/AdminProfile.css';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      // API call to update password
      console.log('Updating password...');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <h2>Admin Profile</h2>
        <div className="profile-actions">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave} loading={loading}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="avatar-info">
            <h3>{user?.name || 'Admin User'}</h3>
            <span className="role-badge">Administrator</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="4"
              placeholder="Tell us about yourself..."
            />
          </div>
        </form>

        <div className="profile-stats">
          <div className="stat-item">
            <h4>Account Created</h4>
            <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="stat-item">
            <h4>Last Login</h4>
            <p>{new Date(user?.lastLogin).toLocaleString()}</p>
          </div>
          <div className="stat-item">
            <h4>Role</h4>
            <p>System Administrator</p>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <Modal
          title="Change Password"
          onClose={() => setShowPasswordModal(false)}
        >
          <form onSubmit={handlePasswordUpdate}>
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
            <div className="modal-actions">
              <Button type="submit" loading={loading}>
                Update Password
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminProfile;
