import React, { useState, useEffect, useContext } from 'react';
import  AuthContext  from '../../context/AuthContext';
import  NotificationContext  from '../../context/NotificationContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import '../../styles/pages/Profile.css';
import '../../styles/pages/StudentProfile.css';

const StudentProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    avatar: '',
    interests: [],
    learningGoals: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: ''
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    certificatesEarned: 0,
    totalLearningHours: 0
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        interests: user.interests || [],
        learningGoals: user.learningGoals || '',
        socialLinks: user.socialLinks || {
          linkedin: '',
          twitter: '',
          github: ''
        }
      });
      fetchStudentStats();
    }
  }, [user]);

  const fetchStudentStats = async () => {
    try {
      // This would typically be an API call
      // const response = await api.get('/api/student/stats');
      // setStats(response.data);
      
      // Mock data for demonstration
      setStats({
        coursesEnrolled: 12,
        coursesCompleted: 8,
        certificatesEarned: 5,
        totalLearningHours: 124
      });
    } catch (error) {
      console.error('Failed to fetch student stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('socialLinks.')) {
      const socialField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleInterestsChange = (e) => {
    const interests = e.target.value.split(',').map(interest => interest.trim());
    setProfileData(prev => ({
      ...prev,
      interests
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      addNotification('Profile updated successfully!', 'success');
    } catch (error) {
      addNotification('Failed to update profile', 'error');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addNotification('New passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // This would typically be an API call
      // await api.post('/api/auth/change-password', passwordData);
      
      addNotification('Password changed successfully!', 'success');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      addNotification('Failed to change password', 'error');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // This would typically upload to your cloud storage
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsLoading(true);
      // const response = await api.post('/api/upload/avatar', formData);
      // setProfileData(prev => ({ ...prev, avatar: response.data.url }));
      
      // Mock URL for demonstration
      const mockUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatar: mockUrl }));
      
      addNotification('Avatar uploaded successfully!', 'success');
    } catch (error) {
      addNotification('Failed to upload avatar', 'error');
      console.error('Avatar upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="student-profile">
      <div className="profile-header">
        <div className="avatar-section">
          <img 
            src={profileData.avatar || '/default-avatar.png'} 
            alt="Profile Avatar"
            className="profile-avatar"
          />
          {isEditing && (
            <div className="avatar-upload">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="avatar-upload" className="upload-btn">
                Change Photo
              </label>
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h1>{profileData.firstName} {profileData.lastName}</h1>
          <p className="email">{profileData.email}</p>
          <p className="bio">{profileData.bio}</p>
        </div>
        
        <div className="profile-actions">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="primary">
              Edit Profile
            </Button>
          ) : (
            <div className="edit-actions">
              <Button onClick={handleSaveProfile} className="primary">
                Save Changes
              </Button>
              <Button 
                onClick={() => setIsEditing(false)} 
                className="secondary"
              >
                Cancel
              </Button>
            </div>
          )}
          <Button 
            onClick={() => setShowPasswordModal(true)} 
            className="secondary"
          >
            Change Password
          </Button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>{stats.coursesEnrolled}</h3>
          <p>Courses Enrolled</p>
        </div>
        <div className="stat-card">
          <h3>{stats.coursesCompleted}</h3>
          <p>Courses Completed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.certificatesEarned}</h3>
          <p>Certificates Earned</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalLearningHours}h</h3>
          <p>Learning Hours</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <Input
              label="First Name"
              name="firstName"
              value={profileData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <Input
              label="Last Name"
              name="lastName"
              value={profileData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled={true} // Email usually can't be changed
            />
          </div>
          
          <div className="form-field">
            <label>Bio</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>
        </div>

        <div className="profile-section">
          <h2>Learning Preferences</h2>
          <div className="form-field">
            <label>Interests</label>
            <input
              type="text"
              value={profileData.interests.join(', ')}
              onChange={handleInterestsChange}
              disabled={!isEditing}
              placeholder="e.g., Web Development, Data Science, Design"
            />
            <small>Separate interests with commas</small>
          </div>
          
          <div className="form-field">
            <label>Learning Goals</label>
            <textarea
              name="learningGoals"
              value={profileData.learningGoals}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="What do you want to achieve with your learning?"
              rows="3"
            />
          </div>
        </div>

        <div className="profile-section">
          <h2>Social Links</h2>
          <div className="form-grid">
            <Input
              label="LinkedIn"
              name="socialLinks.linkedin"
              value={profileData.socialLinks.linkedin}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="https://linkedin.com/in/username"
            />
            <Input
              label="Twitter"
              name="socialLinks.twitter"
              value={profileData.socialLinks.twitter}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="https://twitter.com/username"
            />
            <Input
              label="GitHub"
              name="socialLinks.github"
              value={profileData.socialLinks.github}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="https://github.com/username"
            />
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal
          title="Change Password"
          onClose={() => setShowPasswordModal(false)}
        >
          <div className="password-form">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
            />
            <div className="modal-actions">
              <Button onClick={handlePasswordChange} className="primary">
                Change Password
              </Button>
              <Button 
                onClick={() => setShowPasswordModal(false)} 
                className="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentProfile;
