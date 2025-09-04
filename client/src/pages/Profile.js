import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCloudinary } from '../hooks/useCloudinary';
import '../styles/pages/Profile.css';

const Profile = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const { uploadImage } = useCloudinary();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    profession: '',
    location: '',
    website: '',
    linkedIn: '',
    twitter: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailCourseUpdates: true,
    emailMarketing: false,
    emailSecurity: true,
    pushCourseUpdates: true,
    pushMessages: true,
    pushMarketing: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showProgress: false,
    showCertificates: true,
    allowMessages: true
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        profession: user.profession || '',
        location: user.location || '',
        website: user.website || '',
        linkedIn: user.socialLinks?.linkedIn || '',
        twitter: user.socialLinks?.twitter || '',
        avatar: user.avatar || ''
      });

      if (user.settings) {
        setNotificationSettings(prev => ({
          ...prev,
          ...user.settings.notifications
        }));
        setPrivacySettings(prev => ({
          ...prev,
          ...user.settings.privacy
        }));
      }
    }
  }, [user]);

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profileData.website && !/^https?:\/\/.+/.test(profileData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setIsLoading(true);
    try {
      await updateProfile({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        email: profileData.email,
        bio: profileData.bio,
        profession: profileData.profession,
        location: profileData.location,
        website: profileData.website,
        socialLinks: {
          linkedIn: profileData.linkedIn,
          twitter: profileData.twitter
        }
      });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ password: error.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
    } catch (error) {
      setErrors({ delete: error.message || 'Failed to delete account' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: 'Image must be less than 5MB' });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setProfileData(prev => ({ ...prev, avatar: imageUrl }));
      await updateProfile({ avatar: imageUrl });
      setSuccessMessage('Profile picture updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ avatar: error.message || 'Failed to upload image' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === 'profile') {
      setProfileData(prev => ({ ...prev, [name]: value }));
    } else if (activeTab === 'password') {
      setPasswordData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({ ...prev, [name]: checked }));
  };

  const saveNotificationSettings = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        settings: {
          ...user.settings,
          notifications: notificationSettings
        }
      });
      setSuccessMessage('Notification preferences saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ notifications: error.message || 'Failed to save notification settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        settings: {
          ...user.settings,
          privacy: privacySettings
        }
      });
      setSuccessMessage('Privacy settings saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ privacy: error.message || 'Failed to save privacy settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'account', label: 'Account Settings' }
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container profile-dark-mode-fix">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-sidebar">
          <nav className="profile-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="profile-main profile-content-area">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-section">
                <h2>Profile Information</h2>
                
                <div className="avatar-section">
                  <div className="avatar-container">
                    <img
                      src={profileData.avatar || '/default-avatar.png'}
                      alt="Profile"
                      className="avatar"
                    />
                    {isUploading && (
                      <div className="avatar-overlay">
                        <div>Loading...</div>
                      </div>
                    )}
                  </div>
                  <div className="avatar-actions">
                    <label htmlFor="avatar-upload" className="avatar-upload-btn">
                      {isUploading ? 'Uploading...' : 'Change Photo'}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                    {errors.avatar && (
                      <div className="error-message">{errors.avatar}</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'error' : ''}
                      required
                    />
                    {errors.firstName && (
                      <div className="error-message">{errors.firstName}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'error' : ''}
                      required
                    />
                    {errors.lastName && (
                      <div className="error-message">{errors.lastName}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    required
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <div className="character-count">
                    {profileData.bio.length}/500
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Profession</label>
                    <input
                      type="text"
                      name="profession"
                      value={profileData.profession}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Developer"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className={errors.website ? 'error' : ''}
                  />
                  {errors.website && (
                    <div className="error-message">{errors.website}</div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      name="linkedIn"
                      value={profileData.linkedIn}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Twitter</label>
                    <input
                      type="url"
                      name="twitter"
                      value={profileData.twitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Save Changes'}
                </button>

                {errors.submit && (
                  <div className="error-message">{errors.submit}</div>
                )}
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              
              <div className="settings-group">
                <h3>Email Notifications</h3>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="emailCourseUpdates"
                    checked={notificationSettings.emailCourseUpdates}
                    onChange={handleNotificationChange}
                  />
                  <span>Course updates and announcements</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="emailMarketing"
                    checked={notificationSettings.emailMarketing}
                    onChange={handleNotificationChange}
                  />
                  <span>Marketing emails and promotions</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="emailSecurity"
                    checked={notificationSettings.emailSecurity}
                    onChange={handleNotificationChange}
                  />
                  <span>Security alerts and account changes</span>
                </label>
              </div>

              <div className="settings-group">
                <h3>Push Notifications</h3>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="pushCourseUpdates"
                    checked={notificationSettings.pushCourseUpdates}
                    onChange={handleNotificationChange}
                  />
                  <span>New lessons and course updates</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="pushMessages"
                    checked={notificationSettings.pushMessages}
                    onChange={handleNotificationChange}
                  />
                  <span>Messages and instructor updates</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="pushMarketing"
                    checked={notificationSettings.pushMarketing}
                    onChange={handleNotificationChange}
                  />
                  <span>Marketing notifications</span>
                </label>
              </div>

              <button onClick={saveNotificationSettings} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Save Notification Settings'}
              </button>

              {errors.notifications && (
                <div className="error-message">{errors.notifications}</div>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Security</h2>
              
              <div className="settings-group">
                <h3>Profile Visibility</h3>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="profilePublic"
                    checked={privacySettings.profilePublic}
                    onChange={handlePrivacyChange}
                  />
                  <span>Make my profile public</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="showProgress"
                    checked={privacySettings.showProgress}
                    onChange={handlePrivacyChange}
                  />
                  <span>Show learning progress to others</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="showCertificates"
                    checked={privacySettings.showCertificates}
                    onChange={handlePrivacyChange}
                  />
                  <span>Display certificates on profile</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    name="allowMessages"
                    checked={privacySettings.allowMessages}
                    onChange={handlePrivacyChange}
                  />
                  <span>Allow other users to message me</span>
                </label>
              </div>

              <button onClick={savePrivacySettings} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Save Privacy Settings'}
              </button>

              {errors.privacy && (
                <div className="error-message">{errors.privacy}</div>
              )}

              <div className="security-actions">
                <h3>Security</h3>
                <button onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </button>
                <p className="help-text">
                  Last changed: {user.passwordChanged ? new Date(user.passwordChanged).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              
              <div className="account-info">
                <div className="info-item">
                  <span className="label">Account Type:</span>
                  <span className="value">{user.role || 'Student'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Member Since:</span>
                  <span className="value">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Account Status:</span>
                  <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>These actions are permanent and cannot be undone.</p>
                <button onClick={() => setShowDeleteModal(true)}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handleInputChange}
                  className={errors.currentPassword ? 'error' : ''}
                  required
                />
                {errors.currentPassword && (
                  <div className="error-message">{errors.currentPassword}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleInputChange}
                  className={errors.newPassword ? 'error' : ''}
                  required
                />
                {errors.newPassword && (
                  <div className="error-message">{errors.newPassword}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  required
                />
                {errors.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Account</h2>
            <div className="delete-confirmation">
              <p>
                Are you sure you want to delete your account? This action cannot be undone.
                All your courses, progress, and data will be permanently removed.
              </p>
              {errors.delete && (
                <div className="error-message">{errors.delete}</div>
              )}
              <div className="modal-actions">
                <button onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={isLoading}>
                  {isLoading ? 'Loading.....' : 'Yes, Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;