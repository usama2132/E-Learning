import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/pages/InstructorProfile.css';

const InstructorProfile = () => {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  
  // Add these new state variables for crop functionality
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 120, height: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCropPreview, setShowCropPreview] = useState(false);
  
  // Refs for crop functionality
  const imageRef = useRef(null);
  const cropContainerRef = useRef(null);
  const canvasRef = useRef(null);
const previewCanvasRef = useRef(null);

  // Memoized initial profile state
  const initialProfile = useMemo(() => ({
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
  }), []);

  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newExpertise, setNewExpertise] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  // WhatsApp-style Image Crop Functions
  const handleImageSelect = useCallback((event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setShowCropPreview(true);
      
      // Reset crop data
      setTimeout(() => {
        if (imageRef.current && cropContainerRef.current) {
          const img = imageRef.current;
          const imgWidth = img.offsetWidth;
          const imgHeight = img.offsetHeight;
          const imgLeft = img.offsetLeft;
          const imgTop = img.offsetTop;
          
          // Create a crop area that's 60% of the smaller dimension
          const cropSize = Math.min(imgWidth, imgHeight) * 0.6;
          
          // Center the crop area on the image
          const cropX = imgLeft + (imgWidth - cropSize) / 2;
          const cropY = imgTop + (imgHeight - cropSize) / 2;
          
          setCropData({
            x: cropX,
            y: cropY,
            width: cropSize,
            height: cropSize
          });
        }
      }, 100);
    };
    reader.readAsDataURL(file);
  }
}, []);

 const updateCropPreview = useCallback(() => {
  if (!selectedImage || !imageRef.current) return;

  const img = imageRef.current;
  
  // Create a temporary image to get original dimensions
  const tempImg = new Image();
  tempImg.onload = () => {
    const imgRect = img.getBoundingClientRect();
    const containerRect = cropContainerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;
    
    // Calculate the actual image dimensions and position
    const displayWidth = img.offsetWidth;
    const displayHeight = img.offsetHeight;
    const naturalWidth = tempImg.width;
    const naturalHeight = tempImg.height;
    
    // Scale factors
    const scaleX = naturalWidth / displayWidth;
    const scaleY = naturalHeight / displayHeight;
    
    // Get crop area relative to the displayed image (subtract image offset from container)
    const cropX = cropData.x - img.offsetLeft;
    const cropY = cropData.y - img.offsetTop;
    
    // Make sure crop is within image bounds
    const boundedCropX = Math.max(0, Math.min(cropX, displayWidth - cropData.width));
    const boundedCropY = Math.max(0, Math.min(cropY, displayHeight - cropData.height));
    const boundedWidth = Math.min(cropData.width, displayWidth - boundedCropX);
    const boundedHeight = Math.min(cropData.height, displayHeight - boundedCropY);
    
    // Convert to actual pixel coordinates in the original image
    const actualX = boundedCropX * scaleX;
    const actualY = boundedCropY * scaleY;
    const actualWidth = boundedWidth * scaleX;
    const actualHeight = boundedHeight * scaleY;
    
    // Update large preview canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = actualWidth;
      canvas.height = actualHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(
        tempImg,
        actualX, actualY, actualWidth, actualHeight,
        0, 0, actualWidth, actualHeight
      );
    }
    
    // Update small preview canvas
    if (previewCanvasRef.current) {
      const smallCanvas = previewCanvasRef.current;
      const smallCtx = smallCanvas.getContext('2d');
      
      smallCanvas.width = actualWidth;
      smallCanvas.height = actualHeight;
      
      smallCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
      
      smallCtx.drawImage(
        tempImg,
        actualX, actualY, actualWidth, actualHeight,
        0, 0, actualWidth, actualHeight
      );
    }
  };
  tempImg.src = selectedImage;
}, [selectedImage, cropData]);

  // Update crop preview when crop data changes
  useEffect(() => {
    if (showCropPreview) {
      updateCropPreview();
    }
  }, [cropData, showCropPreview, updateCropPreview]);

  const handleMouseDown = useCallback((e, action) => {
  e.preventDefault();
  
  if (!cropContainerRef.current) return;
  
  const containerRect = cropContainerRef.current.getBoundingClientRect();
  
  // Get coordinates from either mouse or touch event
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  
  if (action === 'drag') {
    setIsDragging(true);
    // Store the offset from touch/mouse to crop top-left corner
    setDragStart({
      x: clientX - containerRect.left - cropData.x,
      y: clientY - containerRect.top - cropData.y
    });
  } else if (action === 'resize') {
    setIsResizing(true);
    setDragStart({
      x: clientX,
      y: clientY,
      width: cropData.width,
      height: cropData.height
    });
  }
}, [cropData]);

const handleMouseMove = useCallback((e) => {
  if (!cropContainerRef.current || !imageRef.current) return;
  
  const containerRect = cropContainerRef.current.getBoundingClientRect();
  const img = imageRef.current;
  
  // Get coordinates from either mouse or touch event
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  
  // Get mouse/touch position relative to container
  const mouseX = clientX - containerRect.left;
  const mouseY = clientY - containerRect.top;
  
  if (isDragging) {
    // Calculate new crop position
    const newX = mouseX - dragStart.x;
    const newY = mouseY - dragStart.y;
    
    // Get image boundaries
    const imgLeft = img.offsetLeft;
    const imgTop = img.offsetTop;
    const imgRight = imgLeft + img.offsetWidth;
    const imgBottom = imgTop + img.offsetHeight;
    
    // Constrain crop within image boundaries
    const constrainedX = Math.max(imgLeft, Math.min(newX, imgRight - cropData.width));
    const constrainedY = Math.max(imgTop, Math.min(newY, imgBottom - cropData.height));
    
    setCropData(prev => ({
      ...prev,
      x: constrainedX,
      y: constrainedY
    }));
    
  } else if (isResizing) {
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    const delta = Math.max(deltaX, deltaY);
    
    // Calculate new size
    const newSize = Math.max(60, dragStart.width + delta);
    
    // Get image boundaries
    const imgLeft = img.offsetLeft;
    const imgTop = img.offsetTop;
    const imgRight = imgLeft + img.offsetWidth;
    const imgBottom = imgTop + img.offsetHeight;
    
    // Ensure crop doesn't exceed image boundaries
    const maxWidth = imgRight - cropData.x;
    const maxHeight = imgBottom - cropData.y;
    const maxSize = Math.min(maxWidth, maxHeight);
    
    const constrainedSize = Math.min(newSize, maxSize);
    
    setCropData(prev => ({
      ...prev,
      width: constrainedSize,
      height: constrainedSize
    }));
  }
}, [isDragging, isResizing, dragStart, cropData]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
  if (isDragging || isResizing) {
    // Add both mouse and touch event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }
}, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

 const confirmCrop = useCallback(() => {
  if (canvasRef.current) {
    const canvas = canvasRef.current;
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    setProfile(prev => ({ ...prev, profileImage: croppedImage }));
    setShowImageModal(false);
    setShowCropPreview(false);
    setSelectedImage(null);
    // Reset crop data
    setCropData({ x: 0, y: 0, width: 120, height: 120 });
  }
}, []);

  const cancelCrop = useCallback(() => {
  setShowImageModal(false);
  setShowCropPreview(false);
  setSelectedImage(null);
  // Reset crop data
  setCropData({ x: 0, y: 0, width: 120, height: 120 });
}, []);

  // Your existing code remains the same until the modal part...
  // [All your existing useEffect, callbacks, and memoized components stay unchanged]

  // Improved theme class generation that works with different theme systems
  const getThemeClass = useCallback((baseClass) => {
    if (theme === 'dark') {
      return `${baseClass} ${baseClass}--dark`;
    }
    return `${baseClass} ${baseClass}--light`;
  }, [theme]);

  // Generate main container class with proper theme handling
  const containerClass = useMemo(() => {
    let classes = 'instructor-profile';
    
    // Add theme-specific classes
    if (theme === 'dark') {
      classes += ' instructor-profile--dark';
    } else {
      classes += ' instructor-profile--light';
    }
    
    // Also add data attribute for CSS targeting
    return classes;
  }, [theme]);

  // Optimized effect with dependency array
  useEffect(() => {
    if (user) {
      setProfile(prevProfile => ({
        firstName: user.firstName || prevProfile.firstName,
        lastName: user.lastName || prevProfile.lastName,
        email: user.email || prevProfile.email,
        bio: user.bio || prevProfile.bio,
        expertise: user.expertise || prevProfile.expertise,
        experience: user.experience || prevProfile.experience,
        education: user.education || prevProfile.education,
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || prevProfile.socialLinks.linkedin,
          twitter: user.socialLinks?.twitter || prevProfile.socialLinks.twitter,
          website: user.socialLinks?.website || prevProfile.socialLinks.website,
          youtube: user.socialLinks?.youtube || prevProfile.socialLinks.youtube
        },
        profileImage: user.profileImage || prevProfile.profileImage,
        phoneNumber: user.phoneNumber || prevProfile.phoneNumber,
        location: user.location || prevProfile.location,
        languages: user.languages || prevProfile.languages,
        achievements: user.achievements || prevProfile.achievements
      }));
    }
  }, [user]);

  // Memoized callbacks to prevent re-renders
  const handleInputChange = useCallback((field, value) => {
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
  }, []);

  const handleSubmit = useCallback(async (e) => {
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
  }, [profile, updateProfile]);

  const addSkill = useCallback((type) => {
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
      default:
        return;
    }

    if (newItem && !currentArray.includes(newItem)) {
      const field = type === 'expertise' ? 'expertise' : type === 'language' ? 'languages' : 'achievements';
      setProfile(prev => ({
        ...prev,
        [field]: [...currentArray, newItem]
      }));
    }
  }, [newExpertise, newLanguage, newAchievement, profile.expertise, profile.languages, profile.achievements]);

  const removeSkill = useCallback((type, index) => {
    const field = type === 'expertise' ? 'expertise' : type === 'language' ? 'languages' : 'achievements';
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  // Memoized skill components to prevent unnecessary re-renders
  const ExpertiseSkills = useMemo(() => (
    <div className="skills-section">
      <div className="skills-list">
        {profile.expertise.map((skill, index) => (
          <span key={`expertise-${index}`} className="skill-tag">
            {skill}
            {isEditing && (
              <button
                type="button"
                className="skill-remove"
                onClick={() => removeSkill('expertise', index)}
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {isEditing && (
        <div className="add-skill">
          <input
            className="skill-input"
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            placeholder="Add expertise area"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('expertise'))}
          />
          <button 
            type="button" 
            className="add-btn"
            onClick={() => addSkill('expertise')}
          >
            Add
          </button>
        </div>
      )}
    </div>
  ), [profile.expertise, isEditing, newExpertise, removeSkill, addSkill]);

  const LanguageSkills = useMemo(() => (
    <div className="skills-section">
      <div className="skills-list">
        {profile.languages.map((language, index) => (
          <span key={`language-${index}`} className="skill-tag">
            {language}
            {isEditing && (
              <button
                type="button"
                className="skill-remove"
                onClick={() => removeSkill('language', index)}
                aria-label={`Remove ${language}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {isEditing && (
        <div className="add-skill">
          <input
            className="skill-input"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Add language"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('language'))}
          />
          <button 
            type="button" 
            className="add-btn"
            onClick={() => addSkill('language')}
          >
            Add
          </button>
        </div>
      )}
    </div>
  ), [profile.languages, isEditing, newLanguage, removeSkill, addSkill]);

  const AchievementsList = useMemo(() => (
    <div className="achievements-section">
      <div className="achievements-list">
        {profile.achievements.map((achievement, index) => (
          <div key={`achievement-${index}`} className="achievement-item">
            <span className="achievement-icon">🏆</span>
            <span>{achievement}</span>
            {isEditing && (
              <button
                type="button"
                className="achievement-remove"
                onClick={() => removeSkill('achievement', index)}
                aria-label={`Remove ${achievement}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {isEditing && (
        <div className="add-achievement">
          <input
            className="achievement-input"
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            placeholder="Add achievement or certification"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('achievement'))}
          />
          <button 
            type="button" 
            className="add-btn"
            onClick={() => addSkill('achievement')}
          >
            Add
          </button>
        </div>
      )}
    </div>
  ), [profile.achievements, isEditing, newAchievement, removeSkill, addSkill]);

  return (
    <div className={containerClass} data-theme={theme}>
      {/* Your existing profile header and form sections remain the same... */}
      <div className="profile-header">
        <div className="profile-image-section">
          <div className="profile-image-container">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                className="profile-image"
                loading="lazy"
              />
            ) : (
              <div className="profile-image no-image"></div>
            )}
            {isEditing && (
              <button
                className="image-edit-btn"
                onClick={() => setShowImageModal(true)}
                aria-label="Edit profile image"
              >
                📷
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
          <h1 className="profile-name">{profile.firstName} {profile.lastName}</h1>
          <p className="profile-title">Instructor</p>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? '⏳' : '💾'} {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All your existing form sections stay the same... */}
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-sections">
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  className="form-input"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={true}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  value={profile.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  value={profile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Professional Information</h3>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us about yourself and your expertise..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience</label>
              <input
                className="form-input"
                value={profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., 5+ years in web development"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Education</label>
              <input
                className="form-input"
                value={profile.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., BS Computer Science, MIT"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Areas of Expertise</h3>
            {ExpertiseSkills}
          </div>

          <div className="form-section">
            <h3 className="section-title">Languages</h3>
            {LanguageSkills}
          </div>

          <div className="form-section">
            <h3 className="section-title">Social Links</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">LinkedIn</label>
                <input
                  className="form-input"
                  value={profile.socialLinks.linkedin}
                  onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Twitter</label>
                <input
                  className="form-input"
                  value={profile.socialLinks.twitter}
                  onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  className="form-input"
                  value={profile.socialLinks.website}
                  onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">YouTube</label>
                <input
                  className="form-input"
                  value={profile.socialLinks.youtube}
                  onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://youtube.com/channel/..."
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Achievements & Certifications</h3>
            {AchievementsList}
          </div>
        </div>
      </form>

      {/* UPDATED MODAL - This is the new WhatsApp-style crop modal */}
      {showImageModal && (
    <div className="instructor-profile-image-modal-overlay" onClick={cancelCrop}>
      <div className="instructor-profile-image-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-modal-header">
          <h3>Change Profile Picture</h3>
          <button className="close-btn" onClick={cancelCrop}>×</button>
        </div>
        
        {!showCropPreview ? (
          <div className="image-upload-modal">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="image-input"
            />
            <p>Choose a photo to crop for your profile</p>
            <div className="upload-tip">
              📸 Select an image and we'll help you crop it to perfection!
            </div>
          </div>
        ) : (
          <div className="image-preview-section active">
            <div className="image-preview-container" ref={cropContainerRef}>
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Preview"
                className="preview-image"
                draggable={false}
                onLoad={() => {
                  // Recalculate position after image loads
                  setTimeout(() => {
                    if (imageRef.current && cropContainerRef.current) {
                      const relativeImgRect = {
                        width: imageRef.current.offsetWidth,
                        height: imageRef.current.offsetHeight,
                        left: imageRef.current.offsetLeft,
                        top: imageRef.current.offsetTop
                      };
                      
                      const size = Math.min(relativeImgRect.width, relativeImgRect.height) * 0.5;
                      
                      setCropData({
                        x: relativeImgRect.left + (relativeImgRect.width - size) / 2,
                        y: relativeImgRect.top + (relativeImgRect.height - size) / 2,
                        width: size,
                        height: size
                      });
                    }
                  }, 100);
                }}
              />
              <div className="crop-overlay">
                <div
                    className="crop-selection"
                    style={{
                    left: `${cropData.x}px`,
                    top: `${cropData.y}px`,
                    width: `${cropData.width}px`,
                    height: `${cropData.height}px`
                      }}
                    onMouseDown={(e) => handleMouseDown(e, 'drag')}
                    onTouchStart={(e) => handleMouseDown(e, 'drag')}
                    >
                    <div
                    className="crop-handle"
                    onMouseDown={(e) => {
                    e.stopPropagation();
                     handleMouseDown(e, 'resize');
                    }}
                  onTouchStart={(e) => {
                   e.stopPropagation();
                   handleMouseDown(e, 'resize');
                  }}
                />
               </div>
              </div>
            </div>

            {/* Updated preview section with larger size */}
            <div className="crop-preview-container" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '1.5rem',
              padding: '1.5rem',
              background: 'var(--ip-bg-tertiary)',
              borderRadius: 'var(--ip-radius-md)',
              margin: '1rem 0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div className="crop-preview-label" style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--ip-text-secondary)',
                  marginBottom: '0.75rem'
                }}>
                  Profile Preview
                </div>
                <canvas
                  ref={canvasRef}
                  style={{ 
                    width: '180px', 
                    height: '180px', 
                    borderRadius: '50%',
                    border: '4px solid var(--ip-accent-primary)',
                    background: 'var(--ip-bg-primary)',
                    display: 'block'
                  }}
                />
              </div>
            </div>

            <div className="profile-preview" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: 'var(--ip-bg-secondary)',
              borderRadius: 'var(--ip-radius-md)',
              border: '1px solid var(--ip-border-color)',
              margin: '1rem 0'
            }}>
              <canvas
                ref={previewCanvasRef}
                style={{ 
                  width: '80px', 
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid var(--ip-accent-primary)',
                  flexShrink: 0
                }}
              />
              <div className="preview-info">
                <div className="preview-name" style={{
                  fontWeight: '600',
                  color: 'var(--ip-text-primary)',
                  marginBottom: '0.25rem',
                  fontSize: '1.1rem'
                }}>
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="preview-desc" style={{
                  fontSize: '0.9rem',
                  color: 'var(--ip-text-secondary)'
                }}>
                  This is how others will see your profile
                </div>
              </div>
            </div>
          </div>
        )}

        {showCropPreview && (
          <div className="modal-actions">
            <button className="cancel-upload-btn" onClick={cancelCrop}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={confirmCrop}>
              Use This Photo
            </button>
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  );
};

export default InstructorProfile;