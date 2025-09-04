import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useCourse } from '../../context/CourseContext';
import VideoUpload from './VideoUpload';
import '../../styles/dashboards/CreateCourse.css';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const { createCourse, isLoading: courseLoading, error: courseError, categories, fetchCategories } = useCourse();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'beginner',
    price: '',
    estimatedHours: '',
    prerequisites: '',
    learningOutcomes: ['']
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [videos, setVideos] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [realCourseId, setRealCourseId] = useState(null);

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const stepLabels = ['Basic Info', 'Details', 'Media'];

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    if (courseError) {
      setErrors(prev => ({
        ...prev,
        submit: courseError
      }));
    }
  }, [courseError]);

  const getTokenFromStorage = () => {
    return token || 
           localStorage.getItem('token') || 
           localStorage.getItem('lms_auth_token') ||
           localStorage.getItem('auth_token') ||
           localStorage.getItem('access_token') ||
           sessionStorage.getItem('token');
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    const authToken = getTokenFromStorage();
    
    if (!authToken) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    console.log('Making authenticated request to:', url);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication failed - redirecting to login');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('Request failed:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLearningOutcomeChange = (index, value) => {
    const updatedOutcomes = [...formData.learningOutcomes];
    updatedOutcomes[index] = value;
    setFormData(prev => ({
      ...prev,
      learningOutcomes: updatedOutcomes
    }));
  };

  const addLearningOutcome = () => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, '']
    }));
  };

  const removeLearningOutcome = (index) => {
    if (formData.learningOutcomes.length > 1) {
      const updatedOutcomes = formData.learningOutcomes.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        learningOutcomes: updatedOutcomes
      }));
    }
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          thumbnail: 'File size must be less than 10MB'
        }));
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          thumbnail: 'Only JPEG, PNG, GIF, and WebP images are allowed'
        }));
        return;
      }

      setThumbnail(file);
      
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
      
      setErrors(prev => ({
        ...prev,
        thumbnail: ''
      }));
    }
  };

  const uploadThumbnailToBackend = async (courseId) => {
    if (!thumbnail) return '';

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('thumbnail', thumbnail);

      console.log('Uploading thumbnail for course:', courseId);
      
      const data = await makeAuthenticatedRequest(`http://localhost:5000/api/uploads/course/${courseId}/thumbnail`, {
        method: 'POST',
        body: formDataToUpload,
      });

      console.log('Thumbnail uploaded successfully:', data);
      return data.data?.thumbnailUrl || data.data?.url || '';

    } catch (error) {
      console.error('Thumbnail upload error:', error);
      throw new Error('Failed to upload thumbnail: ' + error.message);
    }
  };

  const uploadPendingVideos = async (courseId) => {
    const pendingVideos = videos.filter(video => video.pendingUpload && video.file);
    
    if (pendingVideos.length === 0) {
      console.log('No pending videos to upload');
      return;
    }

    console.log(`Uploading ${pendingVideos.length} pending videos to course ${courseId}`);

    const uploadPromises = pendingVideos.map(async (video, index) => {
      try {
        const formDataToUpload = new FormData();
        
        formDataToUpload.append('video', video.file);
        
        const videoTitle = video.title?.trim() || video.name || video.file.name.replace(/\.[^/.]+$/, '') || `Video ${index + 1}`;
        const videoDescription = video.description?.trim() || `Course video: ${videoTitle}`;
        
        formDataToUpload.append('title', videoTitle);
        formDataToUpload.append('description', videoDescription);
        formDataToUpload.append('duration', (video.duration || 600).toString());
        formDataToUpload.append('order', video.order.toString());

        console.log(`Uploading video ${index + 1}:`, {
          title: videoTitle,
          description: videoDescription,
          duration: video.duration || 600,
          order: index + 1,
          fileSize: video.file.size
        });

        const response = await makeAuthenticatedRequest(`http://localhost:5000/api/uploads/course/${courseId}/video`, {
          method: 'POST',
          body: formDataToUpload,
        });

        console.log(`Video ${index + 1} uploaded successfully:`, response);

        setVideos(prev => prev.map(v => 
          v.id === video.id 
            ? { 
                ...v, 
                url: response.data?.videoUrl || response.data?.url || '', 
                uploaded: true, 
                pendingUpload: false,
                videoId: response.data?.video?.id || response.data?.video?._id || response.data?.id
              }
            : v
        ));

        return {
          success: true,
          video: video,
          result: response
        };

      } catch (error) {
        console.error(`Error uploading video ${index + 1}:`, error);
        
        setVideos(prev => prev.map(v => 
          v.id === video.id 
            ? { ...v, uploadError: error.message, pendingUpload: false }
            : v
        ));

        return {
          success: false,
          video: video,
          error: error.message
        };
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`Video upload completed: ${successful} successful, ${failed} failed`);

    if (failed > 0) {
      console.warn(`${failed} videos failed to upload`);
      const errorMessages = results
        .filter(r => r.status === 'fulfilled' && !r.value.success)
        .map(r => r.value.error)
        .join('; ');
      
      throw new Error(`Some videos failed to upload: ${errorMessages}`);
    }

    console.log('All videos uploaded successfully');
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 2:
        if (!formData.price || formData.price < 0) newErrors.price = 'Valid price is required';
        if (!formData.estimatedHours || formData.estimatedHours < 1) newErrors.estimatedHours = 'Estimated hours must be at least 1';
        if (formData.learningOutcomes.some(obj => !obj.trim())) {
          newErrors.learningOutcomes = 'All learning outcomes must be filled';
        }
        if (formData.learningOutcomes.length < 3) {
          newErrors.learningOutcomes = 'At least 3 learning outcomes are required';
        }
        break;
      case 3:
        if (!thumbnail) newErrors.thumbnail = 'Course thumbnail is required';
        if (videos.length === 0) newErrors.videos = 'At least one video is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (status = 'draft') => {
    if (!validateStep(3)) return;

    try {
      console.log('Submitting course with status:', status);
      setUploading(true);
      setErrors({});

      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        category: formData.category,
        level: formData.level,
        price: parseFloat(formData.price) || 0,
        
        thumbnail: {
          url: thumbnailPreview || 'https://via.placeholder.com/800x450/e2e8f0/64748b?text=Course+Thumbnail',
          public_id: ''
        },
        
        learningOutcomes: formData.learningOutcomes.filter(obj => obj.trim()),
        requirements: formData.prerequisites ? [formData.prerequisites.trim()] : [],
        
        isPublished: status === 'published',
        isApproved: false,
        
        totalDuration: 0,
        totalLessons: videos.length,
        totalStudents: 0,
        averageRating: 0,
        totalReviews: 0,
        tags: [],
        targetAudience: [],
        
        features: {
          certificate: true,
          downloadableResources: true,
          lifetimeAccess: true,
          mobileAccess: true,
          discussion: true
        },
        
        sections: []
      };

      console.log('Creating course with data:', courseData);

      const result = await makeAuthenticatedRequest('http://localhost:5000/api/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      });

      if (!result || !result.success) {
        throw new Error(result?.message || result?.error || 'Failed to create course');
      }

      const createdCourseId = result.data?.course?._id || result.data?._id || result.course?._id;
      
      if (!createdCourseId) {
        throw new Error('Course created but no ID returned');
      }

      console.log('Course created successfully with ID:', createdCourseId);
      setRealCourseId(createdCourseId);

      let thumbnailUrl = '';
      if (thumbnail) {
        console.log('Uploading thumbnail...');
        try {
          thumbnailUrl = await uploadThumbnailToBackend(createdCourseId);
          console.log('Thumbnail uploaded:', thumbnailUrl);
        } catch (thumbnailError) {
          console.warn('Thumbnail upload failed:', thumbnailError.message);
        }
      }

      if (videos.length > 0) {
        console.log('Uploading videos...');
        try {
          await uploadPendingVideos(createdCourseId);
          console.log('Videos uploaded successfully');
        } catch (videoError) {
          console.error('Video upload failed:', videoError.message);
          setErrors({ 
            submit: `Course created successfully, but some videos failed to upload: ${videoError.message}` 
          });
        }
      }

      if (thumbnailUrl) {
        try {
          const updateData = { 
            thumbnail: {
              url: thumbnailUrl,
              public_id: `thumbnail_${createdCourseId}_${Date.now()}`
            }
          };
          await makeAuthenticatedRequest(`http://localhost:5000/api/courses/${createdCourseId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
          });
          console.log('Course updated with thumbnail URL');
        } catch (updateError) {
          console.warn('Failed to update course with thumbnail URL:', updateError.message);
        }
      }

      const message = status === 'draft' ? 'Course saved as draft' : 'Course submitted for review';
      const messageType = 'success';
      
      navigate(`/instructor/courses?message=${encodeURIComponent(message)}&type=${messageType}`);

    } catch (error) {
      console.error('Course creation error:', error);
      
      let errorMessage = 'Failed to create course. Please try again.';
      
      if (error.message.includes('Session expired') || error.message.includes('authentication')) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('validation') || error.message.includes('required')) {
        errorMessage = 'Please check all required fields and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ 
        submit: errorMessage 
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setUploading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="create-course__form-section">
            <h3 className="create-course__section-title">
              <span className="create-course__section-icon">📚</span>
              Course Information
            </h3>
            
            <div className="create-course__input-group">
              <label className="create-course__form-label">
                Course Title <span className="create-course__required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`create-course__form-input ${errors.title ? 'create-course__form-input--error' : ''}`}
                placeholder="Enter an engaging course title"
                required
              />
              {errors.title && <span className="create-course__error-text">{errors.title}</span>}
            </div>

            <div className="create-course__input-group">
              <label className="create-course__form-label">
                Short Description <span className="create-course__required">*</span>
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                className={`create-course__form-textarea ${errors.shortDescription ? 'create-course__form-input--error' : ''}`}
                rows="2"
                placeholder="Brief description for course listings (max 150 characters)"
                maxLength="150"
                required
              />
              {errors.shortDescription && <span className="create-course__error-text">{errors.shortDescription}</span>}
              <div className="create-course__char-count">{formData.shortDescription.length}/150 characters</div>
            </div>

            <div className="create-course__input-group">
              <label className="create-course__form-label">
                Detailed Description <span className="create-course__required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`create-course__form-textarea ${errors.description ? 'create-course__form-input--error' : ''}`}
                rows="6"
                placeholder="Provide a comprehensive course description (minimum 50 characters)..."
                required
              />
              {errors.description && <span className="create-course__error-text">{errors.description}</span>}
              <div className="create-course__char-count">{formData.description.length} characters</div>
            </div>

            <div className="create-course__form-grid">
              <div className="create-course__input-group">
                <label className="create-course__form-label">
                  Category <span className="create-course__required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`create-course__form-select ${errors.category ? 'create-course__form-input--error' : ''}`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
                {errors.category && <span className="create-course__error-text">{errors.category}</span>}
              </div>

              <div className="create-course__input-group">
                <label className="create-course__form-label">Difficulty Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="create-course__form-select"
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="create-course__form-section">
            <h3 className="create-course__section-title">
              <span className="create-course__section-icon">⚙️</span>
              Course Details
            </h3>

            <div className="create-course__form-grid">
              <div className="create-course__input-group">
                <label className="create-course__form-label">
                  Price ($) <span className="create-course__required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`create-course__form-input ${errors.price ? 'create-course__form-input--error' : ''}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.price && <span className="create-course__error-text">{errors.price}</span>}
              </div>

              <div className="create-course__input-group">
                <label className="create-course__form-label">
                  Estimated Hours <span className="create-course__required">*</span>
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  className={`create-course__form-input ${errors.estimatedHours ? 'create-course__form-input--error' : ''}`}
                  placeholder="e.g., 8"
                  min="1"
                  required
                />
                {errors.estimatedHours && <span className="create-course__error-text">{errors.estimatedHours}</span>}
              </div>
            </div>

            <div className="create-course__input-group">
              <label className="create-course__form-label">Prerequisites (Optional)</label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                className="create-course__form-textarea"
                rows="3"
                placeholder="List any requirements or prior knowledge needed..."
              />
            </div>

            <div className="create-course__input-group">
              <label className="create-course__form-label">
                Learning Outcomes <span className="create-course__required">*</span>
                <small>(Minimum 3 required)</small>
              </label>
              {formData.learningOutcomes.map((outcome, index) => (
                <div key={index} className="create-course__objective-container">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => handleLearningOutcomeChange(index, e.target.value)}
                    className="create-course__form-input create-course__objective-input"
                    placeholder={`Learning outcome ${index + 1}`}
                  />
                  {formData.learningOutcomes.length > 1 && (
                    <button
                      type="button"
                      className="create-course__btn create-course__btn--outline create-course__btn--sm"
                      onClick={() => removeLearningOutcome(index)}
                    >
                      <span>✕</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="create-course__btn create-course__btn--outline create-course__btn--sm create-course__add-objective-btn"
                onClick={addLearningOutcome}
              >
                <span>+</span> Add Learning Outcome
              </button>
              {errors.learningOutcomes && <span className="create-course__error-text">{errors.learningOutcomes}</span>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="create-course__form-section">
            <h3 className="create-course__section-title">
              <span className="create-course__section-icon">🎬</span>
              Course Media
            </h3>

            <div className="create-course__input-group">
              <label className="create-course__form-label">
                Course Thumbnail <span className="create-course__required">*</span>
              </label>
              <div className="create-course__upload-area">
                {thumbnailPreview ? (
                  <div className="create-course__thumbnail-preview-container">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="create-course__thumbnail-preview"
                    />
                    <button
                      type="button"
                      className="create-course__btn create-course__btn--outline"
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailPreview('');
                      }}
                    >
                      Change Thumbnail
                    </button>
                  </div>
                ) : (
                  <div className="create-course__upload-placeholder">
                    <div className="create-course__upload-icon">📷</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="create-course__hidden-input"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className={`create-course__upload-btn ${uploading ? 'create-course__upload-btn--loading' : ''}`}
                    >
                      {uploading ? (
                        <>
                          <div className="create-course__spinner"></div>
                          Uploading...
                        </>
                      ) : (
                        'Upload Thumbnail'
                      )}
                    </label>
                    <p className="create-course__upload-hint">
                      PNG, JPG, GIF up to 10MB. Recommended: 1280x720px
                    </p>
                  </div>
                )}
              </div>
              {errors.thumbnail && <span className="create-course__error-text">{errors.thumbnail}</span>}
            </div>

            <VideoUpload 
              videos={videos} 
              setVideos={setVideos} 
              courseId={realCourseId}
            />
            {errors.videos && <span className="create-course__error-text">{errors.videos}</span>}
          </div>
        );

      default:
        return null;
    }
  };

  const isLoading = courseLoading || uploading;

  return (
    <div className={`create-course ${theme === 'dark' ? 'create-course--dark' : ''}`}>
      <div className="create-course__container">
        <div className="create-course__header">
          <h1 className="create-course__title">Create New Course</h1>
          <p className="create-course__subtitle">Build and share your knowledge with students worldwide</p>
        </div>

        <div className="create-course__progress-container">
          <div className="create-course__progress-steps">
            {[1, 2, 3].map((step) => (
              <div key={step} className="create-course__step-wrapper">
                <div className={`create-course__step-circle ${currentStep >= step ? 'create-course__step-circle--active' : ''}`}>
                  {currentStep > step ? '✓' : step}
                </div>
                <span className={`create-course__step-label ${currentStep >= step ? 'create-course__step-label--active' : ''}`}>
                  {stepLabels[step - 1]}
                </span>
                {step < 3 && (
                  <div className={`create-course__step-line ${currentStep > step ? 'create-course__step-line--active' : ''}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="create-course__form-card">
          {renderStepContent()}
        </div>

        {errors.submit && (
          <div className="create-course__error-card">
            <div className="create-course__error-icon">⚠️</div>
            <p>{errors.submit}</p>
            <button 
              className="create-course__btn create-course__btn--outline create-course__btn--sm"
              onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="create-course__navigation-container">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                className={`create-course__btn create-course__btn--outline ${isLoading ? 'create-course__btn--disabled' : ''}`}
                onClick={prevStep}
                disabled={isLoading}
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div className="create-course__button-group">
            {currentStep < 3 ? (
              <button
                type="button"
                className={`create-course__btn create-course__btn--primary ${isLoading ? 'create-course__btn--disabled' : ''}`}
                onClick={nextStep}
                disabled={isLoading}
              >
                Next →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={`create-course__btn create-course__btn--primary ${isLoading ? 'create-course__btn--disabled' : ''}`}
                  onClick={() => handleSubmit('pending')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="create-course__spinner"></div>
                      Submitting...
                    </>
                  ) : (
                    '🚀 Submit for Review'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;