import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, Edit3, Shield, Calendar, Clock, Mail, Phone, FileText, 
  Save, X, Lock, Eye, EyeOff, Sun, Moon 
} from 'lucide-react';
import '../../styles/pages/AdminProfile.css';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  // Theme state management
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // Existing state management
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  }));
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Theme management effects
  useEffect(() => {
    const adminProfileElement = document.querySelector('.admin-profile');
    if (adminProfileElement) {
      adminProfileElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        adminProfileElement.classList.add('dark-mode');
        adminProfileElement.classList.remove('light-mode');
      } else {
        adminProfileElement.classList.add('light-mode');
        adminProfileElement.classList.remove('dark-mode');
      }
    }
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('admin-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  // Optimized user data with minimal dependencies
  const userData = useMemo(() => {
    if (!user) return {
      name: 'Admin User',
      email: '',
      phone: '',
      bio: '',
      createdAt: 'N/A',
      lastLogin: 'N/A',
      avatar: 'A'
    };

    return {
      name: user.name || 'Admin User',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A',
      avatar: (user.name?.charAt(0) || 'A').toUpperCase()
    };
  }, [user?.name, user?.email, user?.phone, user?.bio, user?.createdAt, user?.lastLogin]);

  // Sync form data only when user changes significantly
  useEffect(() => {
    if (user && (
      formData.name !== (user.name || '') ||
      formData.email !== (user.email || '') ||
      formData.phone !== (user.phone || '') ||
      formData.bio !== (user.bio || '')
    )) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user?.name, user?.email, user?.phone, user?.bio]);

  // All existing handlers remain the same...
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleEditProfile = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleViewGeneralProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleSave = useCallback(async (e) => {
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
  }, [formData, updateProfile]);

  const handlePasswordUpdate = useCallback(async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Updating password...');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordVisibility({ current: false, new: false, confirm: false });
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setLoading(false);
    }
  }, [passwordData]);

  const handleCancel = useCallback(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  }, [user]);

  const closePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordVisibility({ current: false, new: false, confirm: false });
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  // Early return if no user to prevent unnecessary renders
  if (!user && !userData) {
    return (
      <div className="admin-profile" data-theme={theme}>
        <div className="admin-profile__loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile" data-theme={theme}>
      {/* Header Section */}
      <div className="admin-profile__header">
        <div className="admin-profile__title">
          <Shield className="admin-profile__icon" />
          <h1>Admin Profile</h1>
        </div>
        <div className="admin-profile__actions">
          {/* Theme Toggle Button */}
          <button 
            className="btn btn--secondary"
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          
          {!isEditing ? (
            <>
              <button 
                className="btn btn--primary"
                onClick={handleEditProfile}
                type="button"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
              <button 
                className="btn btn--secondary"
                onClick={() => setShowPasswordModal(true)}
                type="button"
              >
                <Lock size={16} />
                Change Password
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn--success"
                onClick={handleSave}
                disabled={loading}
                type="button"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="btn btn--secondary"
                onClick={handleCancel}
                type="button"
              >
                <X size={16} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Profile Card */}
      <div className="admin-profile__card">
        {/* Avatar Section */}
        <div className="admin-profile__avatar-section">
          <div className="admin-profile__avatar">
            <span className="admin-profile__avatar-text">
              {userData.avatar}
            </span>
          </div>
          <div className="admin-profile__user-info">
            <h2 className="admin-profile__name">{userData.name}</h2>
            <span className="admin-profile__role">System Administrator</span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="admin-profile__details">
          {!isEditing ? (
            <div className="admin-profile__detail-group">
              <div className="admin-profile__detail-item">
                <Mail className="admin-profile__detail-icon" />
                <div className="admin-profile__detail-content">
                  <label>Email Address</label>
                  <span>{userData.email || 'Not provided'}</span>
                </div>
              </div>

              <div className="admin-profile__detail-item">
                <Phone className="admin-profile__detail-icon" />
                <div className="admin-profile__detail-content">
                  <label>Phone Number</label>
                  <span>{userData.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="admin-profile__detail-item">
                <FileText className="admin-profile__detail-icon" />
                <div className="admin-profile__detail-content">
                  <label>Bio</label>
                  <span>{userData.bio || 'No bio provided'}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="admin-profile__edit-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </form>
          )}
        </div>

        {/* Stats Section */}
        <div className="admin-profile__stats">
          <div className="admin-profile__stat">
            <Calendar className="admin-profile__stat-icon" />
            <div className="admin-profile__stat-content">
              <label>Account Created</label>
              <span>{userData.createdAt}</span>
            </div>
          </div>
          
          <div className="admin-profile__stat">
            <Clock className="admin-profile__stat-icon" />
            <div className="admin-profile__stat-content">
              <label>Last Login</label>
              <span>{userData.lastLogin}</span>
            </div>
          </div>

          <div className="admin-profile__stat">
            <Shield className="admin-profile__stat-icon" />
            <div className="admin-profile__stat-content">
              <label>Access Level</label>
              <span>Full Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal remains the same... */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button 
                className="modal-close"
                onClick={closePasswordModal}
                type="button"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="currentPassword"
                    type={passwordVisibility.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                    aria-label={passwordVisibility.current ? "Hide password" : "Show password"}
                  >
                    {passwordVisibility.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    type={passwordVisibility.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                    className="form-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                    aria-label={passwordVisibility.new ? "Hide password" : "Show password"}
                  >
                    {passwordVisibility.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={passwordVisibility.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                    className="form-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                    aria-label={passwordVisibility.confirm ? "Hide password" : "Show password"}
                  >
                    {passwordVisibility.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  type="button" 
                  className="btn btn--secondary"
                  onClick={closePasswordModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;