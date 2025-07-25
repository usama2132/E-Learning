import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import '../../styles/pages/InstructorProfile.css';

const InstructorProfile = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    expertise: [],
    experience: '',
    education: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: '',
      youtube: ''
    },
    profileImage: '',
    phoneNumber: '',
    location: '',
    languages: [],
    achievements: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newExpertise, setNewExpertise] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        expertise: user.expertise || [],
        experience: user.experience || '',
        education: user.education || '',
        socialLinks: user.socialLinks || {
          linkedin: '',
          twitter: '',
          website: '',
          youtube: ''
        },
        profileImage: user.profileImage || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        languages: user.languages || [],
        achievements: user.achievements || []
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (type) => {
    let newItem = '';
    let currentArray = [];

    switch (type) {
      case 'expertise':
        newItem = newExpertise.trim();
        currentArray = profile.expertise;
        setNewExpertise('');
        break;
      case 'language':
        newItem = newLanguage.trim();
        currentArray = profile.languages;
        setNewLanguage('');
        break;
      case 'achievement':
        newItem = newAchievement.trim();
        currentArray = profile.achievements;
        setNewAchievement('');
        break;
    }

    if (newItem && !currentArray.includes(newItem)) {
      setProfile(prev => ({
        ...prev,
        [type === 'expertise' ? 'expertise' : type === 'language' ? 'languages' : 'achievements']: [...currentArray, newItem]
      }));
    }
  };

  const removeSkill = (type, index) => {
    const field = type === 'expertise' ? 'expertise' : type === 'language' ? 'languages' : 'achievements';
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="instructor-profile">
      <div className="profile-header">
        <div className="profile-image-section">
          <div className="profile-image-container">
            <img
              src={profile.profileImage || '/default-avatar.png'}
              alt="Profile"
              className="profile-image"
            />
            {isEditing && (
              <button
                className="image-edit-btn"
                onClick={() => setShowImageModal(true)}
              >
                <i className="fas fa-camera"></i>
              </button>
            )}
          </div>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">12</span>
              <span className="stat-label">Courses</span>
            </div>
            <div className="stat">
              <span className="stat-value">1,234</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat">
              <span className="stat-value">4.9</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>

        <div className="profile-info">
          <h1>{profile.firstName} {profile.lastName}</h1>
          <p className="profile-title">Instructor</p>
          <div className="profile-actions">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <i className="fas fa-edit"></i>
                Edit Profile
              </Button>
            ) : (
              <div className="edit-actions">
                <Button variant="success" onClick={handleSubmit} loading={loading}>
                  <i className="fas fa-save"></i>
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-sections">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <Input
                label="First Name"
                value={profile.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                required
              />
              <Input
                label="Last Name"
                value={profile.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                required
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={true}
              />
              <Input
                label="Phone Number"
                value={profile.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Professional Information</h3>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us about yourself and your expertise..."
                className="form-textarea"
              />
            </div>
            <Input
              label="Experience"
              value={profile.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              disabled={!isEditing}
              placeholder="e.g., 5+ years in web development"
            />
            <Input
              label="Education"
              value={profile.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              disabled={!isEditing}
              placeholder="e.g., BS Computer Science, MIT"
            />
          </div>

          <div className="form-section">
            <h3>Areas of Expertise</h3>
            <div className="skills-section">
              <div className="skills-list">
                {profile.expertise.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        className="skill-remove"
                        onClick={() => removeSkill('expertise', index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="add-skill">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Add expertise area"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('expertise'))}
                  />
                  <Button type="button" onClick={() => addSkill('expertise')}>
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Languages</h3>
            <div className="skills-section">
              <div className="skills-list">
                {profile.languages.map((language, index) => (
                  <span key={index} className="skill-tag">
                    {language}
                    {isEditing && (
                      <button
                        type="button"
                        className="skill-remove"
                        onClick={() => removeSkill('language', index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="add-skill">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add language"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('language'))}
                  />
                  <Button type="button" onClick={() => addSkill('language')}>
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Social Links</h3>
            <div className="form-grid">
              <Input
                label="LinkedIn"
                value={profile.socialLinks.linkedin}
                onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/username"
              />
              <Input
                label="Twitter"
                value={profile.socialLinks.twitter}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                disabled={!isEditing}
                placeholder="https://twitter.com/username"
              />
              <Input
                label="Website"
                value={profile.socialLinks.website}
                onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                disabled={!isEditing}
                placeholder="https://yourwebsite.com"
              />
              <Input
                label="YouTube"
                value={profile.socialLinks.youtube}
                onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                disabled={!isEditing}
                placeholder="https://youtube.com/channel/..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Achievements & Certifications</h3>
            <div className="achievements-section">
              <div className="achievements-list">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <i className="fas fa-trophy"></i>
                    <span>{achievement}</span>
                    {isEditing && (
                      <button
                        type="button"
                        className="achievement-remove"
                        onClick={() => removeSkill('achievement', index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="add-achievement">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Add achievement or certification"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('achievement'))}
                  />
                  <Button type="button" onClick={() => addSkill('achievement')}>
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {showImageModal && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title="Change Profile Picture"
        >
          <div className="image-upload-modal">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-input"
            />
            <p>Choose a new profile picture</p>
            <div className="modal-actions">
              <Button onClick={() => setShowImageModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InstructorProfile;
