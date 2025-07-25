import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useCourses from '../../hooks/useCourses';
import useUpload from '../../hooks/useUpload';
import VideoUpload from './VideoUpload';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCourse, loading: courseLoading } = useCourses();
  const { uploadImage, uploading: imageUploading } = useUpload();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'beginner',
    price: '',
    estimatedHours: '',
    prerequisites: '',
    learningObjectives: ['']
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [videos, setVideos] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const categories = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'Design', 'Business', 'Marketing', 'Photography',
    'Music', 'Language', 'Health & Fitness', 'Cooking', 'Other'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all', label: 'All Levels' }
  ];

  // Inline Styles
  const styles = {
    createCourseContainer: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    createCourseHeader: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    createCourseTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '0.5rem'
    },
    createCourseSubtitle: {
      fontSize: '1.1rem',
      color: '#000000',
      fontWeight: '400'
    },
    progressContainer: {
      maxWidth: '600px',
      margin: '0 auto 3rem',
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    progressSteps: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem'
    },
    stepCircle: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#e2e8f0',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    stepCircleActive: {
      backgroundColor: '#3b82f6',
      color: '#fff',
      transform: 'scale(1.1)'
    },
    stepLine: {
      width: '80px',
      height: '2px',
      backgroundColor: '#e2e8f0',
      margin: '0 1rem',
      transition: 'background-color 0.3s ease'
    },
    stepLineActive: {
      backgroundColor: '#3b82f6'
    },
    stepLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: '1rem'
    },
    stepLabel: {
      fontSize: '0.9rem',
      color: '#000000',
      fontWeight: '500',
      flex: 1,
      textAlign: 'center'
    },
    stepLabelActive: {
      color: '#3b82f6',
      fontWeight: '600'
    },
    formCard: {
      maxWidth: '800px',
      margin: '0 auto 2rem',
      backgroundColor: '#fff',
      padding: '2.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    formSection: {
      width: '100%'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    sectionIcon: {
      fontSize: '1.25rem'
    },
    inputGroup: {
      marginBottom: '1.5rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.5rem'
    },
    required: {
      color: '#ef4444'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#000000',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      backgroundColor: '#fff',
      boxSizing: 'border-box'
    },
    formInputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      outline: 'none'
    },
    formInputError: {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
    },
    formTextarea: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#000000',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      backgroundColor: '#fff',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    formSelect: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#000000',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxSizing: 'border-box'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      display: 'block'
    },
    charCount: {
      fontSize: '0.75rem',
      color: '#000000',
      textAlign: 'right',
      marginTop: '0.25rem'
    },
    objectiveContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    objectiveInput: {
      flex: 1
    },
    btn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      textDecoration: 'none',
      lineHeight: '1'
    },
    btnPrimary: {
      backgroundColor: '#3b82f6',
      color: '#fff',
      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
    },
    btnPrimaryHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
    },
    btnOutline: {
      backgroundColor: 'transparent',
      color: '#000000',
      border: '2px solid #e5e7eb'
    },
    btnOutlineHover: {
      backgroundColor: '#f9fafb',
      borderColor: '#d1d5db'
    },
    btnSm: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem'
    },
    btnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    addObjectiveBtn: {
      marginTop: '0.5rem'
    },
    uploadArea: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f9fafb',
      transition: 'border-color 0.2s ease'
    },
    uploadPlaceholder: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    },
    uploadIcon: {
      fontSize: '3rem',
      opacity: 0.5
    },
    hiddenInput: {
      display: 'none'
    },
    uploadBtn: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#3b82f6',
      color: '#fff',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      border: 'none',
      transition: 'background-color 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    uploadBtnLoading: {
      opacity: 0.7,
      cursor: 'wait'
    },
    uploadHint: {
      fontSize: '0.875rem',
      color: '#000000',
      margin: 0
    },
    thumbnailPreviewContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    },
    thumbnailPreview: {
      maxWidth: '300px',
      maxHeight: '200px',
      borderRadius: '8px',
      objectFit: 'cover',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    errorCard: {
      maxWidth: '800px',
      margin: '0 auto 2rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    errorIcon: {
      fontSize: '1.25rem'
    },
    navigationContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
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

  const handleLearningObjectiveChange = (index, value) => {
    const updatedObjectives = [...formData.learningObjectives];
    updatedObjectives[index] = value;
    setFormData(prev => ({
      ...prev,
      learningObjectives: updatedObjectives
    }));
  };

  const addLearningObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const removeLearningObjective = (index) => {
    if (formData.learningObjectives.length > 1) {
      const updatedObjectives = formData.learningObjectives.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        learningObjectives: updatedObjectives
      }));
    }
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 2:
        if (!formData.price || formData.price < 0) newErrors.price = 'Valid price is required';
        if (!formData.estimatedHours || formData.estimatedHours < 1) newErrors.estimatedHours = 'Estimated hours must be at least 1';
        if (formData.learningObjectives.some(obj => !obj.trim())) {
          newErrors.learningObjectives = 'All learning objectives must be filled';
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
      let thumbnailUrl = '';
      
      if (thumbnail) {
        thumbnailUrl = await uploadImage(thumbnail, 'course-thumbnails');
      }

      const courseData = {
        ...formData,
        thumbnail: thumbnailUrl,
        videos: videos.map(video => ({
          title: video.title,
          url: video.url,
          duration: video.duration,
          order: video.order
        })),
        instructorId: user.id,
        status,
        createdAt: new Date().toISOString()
      };

      const course = await createCourse(courseData);
      
      if (status === 'draft') {
        navigate('/instructor/courses');
      } else {
        navigate(`/instructor/courses?success=Course submitted for review`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setErrors({ submit: 'Failed to create course. Please try again.' });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>📚</span>
              Course Information
            </h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.formLabel}>
                Course Title <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                style={{
                  ...styles.formInput,
                  ...(errors.title ? styles.formInputError : {})
                }}
                placeholder="Enter an engaging course title"
                required
              />
              {errors.title && <span style={styles.errorText}>{errors.title}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.formLabel}>
                Short Description <span style={styles.required}>*</span>
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                style={{
                  ...styles.formTextarea,
                  ...(errors.shortDescription ? styles.formInputError : {})
                }}
                rows="2"
                placeholder="Brief description for course listings (max 150 characters)"
                maxLength="150"
                required
              />
              {errors.shortDescription && <span style={styles.errorText}>{errors.shortDescription}</span>}
              <div style={styles.charCount}>{formData.shortDescription.length}/150 characters</div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.formLabel}>
                Detailed Description <span style={styles.required}>*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={{
                  ...styles.formTextarea,
                  ...(errors.description ? styles.formInputError : {})
                }}
                rows="6"
                placeholder="Provide a comprehensive course description..."
                required
              />
              {errors.description && <span style={styles.errorText}>{errors.description}</span>}
            </div>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.formLabel}>
                  Category <span style={styles.required}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    ...styles.formSelect,
                    ...(errors.category ? styles.formInputError : {})
                  }}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <span style={styles.errorText}>{errors.category}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.formLabel}>Difficulty Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  style={styles.formSelect}
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
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>⚙️</span>
              Course Details
            </h3>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.formLabel}>
                  Price ($) <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  style={{
                    ...styles.formInput,
                    ...(errors.price ? styles.formInputError : {})
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.price && <span style={styles.errorText}>{errors.price}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.formLabel}>
                  Estimated Hours <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  style={{
                    ...styles.formInput,
                    ...(errors.estimatedHours ? styles.formInputError : {})
                  }}
                  placeholder="e.g., 8"
                  min="1"
                  required
                />
                {errors.estimatedHours && <span style={styles.errorText}>{errors.estimatedHours}</span>}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.formLabel}>Prerequisites (Optional)</label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                style={styles.formTextarea}
                rows="3"
                placeholder="List any requirements or prior knowledge needed..."
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.formLabel}>
                Learning Objectives <span style={styles.required}>*</span>
              </label>
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} style={styles.objectiveContainer}>
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleLearningObjectiveChange(index, e.target.value)}
                    style={{...styles.formInput, ...styles.objectiveInput}}
                    placeholder={`Learning objective ${index + 1}`}
                  />
                  {formData.learningObjectives.length > 1 && (
                    <button
                      type="button"
                      style={{...styles.btn, ...styles.btnOutline, ...styles.btnSm}}
                      onClick={() => removeLearningObjective(index)}
                    >
                      <span>✕</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                style={{...styles.btn, ...styles.btnOutline, ...styles.btnSm, ...styles.addObjectiveBtn}}
                onClick={addLearningObjective}
              >
                <span>+</span> Add Learning Objective
              </button>
              {errors.learningObjectives && <span style={styles.errorText}>{errors.learningObjectives}</span>}
            </div>
          </div>
        );

      case 3:
        return (
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>🎬</span>
              Course Media
            </h3>

            <div style={styles.inputGroup}>
              <label style={styles.formLabel}>
                Course Thumbnail <span style={styles.required}>*</span>
              </label>
              <div style={styles.uploadArea}>
                {thumbnailPreview ? (
                  <div style={styles.thumbnailPreviewContainer}>
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      style={styles.thumbnailPreview}
                    />
                    <button
                      type="button"
                      style={{...styles.btn, ...styles.btnOutline}}
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailPreview('');
                      }}
                    >
                      Change Thumbnail
                    </button>
                  </div>
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <div style={styles.uploadIcon}>📷</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      style={styles.hiddenInput}
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      style={{
                        ...styles.uploadBtn,
                        ...(imageUploading ? styles.uploadBtnLoading : {})
                      }}
                    >
                      {imageUploading ? (
                        <>
                          <div style={styles.spinner}></div>
                          Uploading...
                        </>
                      ) : (
                        'Upload Thumbnail'
                      )}
                    </label>
                    <p style={styles.uploadHint}>
                      PNG, JPG, GIF up to 10MB. Recommended: 1280x720px
                    </p>
                  </div>
                )}
              </div>
              {errors.thumbnail && <span style={styles.errorText}>{errors.thumbnail}</span>}
            </div>

            <VideoUpload videos={videos} setVideos={setVideos} />
            {errors.videos && <span style={styles.errorText}>{errors.videos}</span>}
          </div>
        );

      default:
        return null;
    }
  };

  const isLoading = courseLoading || imageUploading;

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.createCourseContainer}>
        <div style={styles.createCourseHeader}>
          <h1 style={styles.createCourseTitle}>Create New Course</h1>
          <p style={styles.createCourseSubtitle}>Build and share your knowledge with students worldwide</p>
        </div>

        {/* Progress Steps */}
        <div style={styles.progressContainer}>
          <div style={styles.progressSteps}>
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div style={{
                  ...styles.stepCircle,
                  ...(currentStep >= step ? styles.stepCircleActive : {})
                }}>
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 3 && (
                  <div style={{
                    ...styles.stepLine,
                    ...(currentStep > step ? styles.stepLineActive : {})
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div style={styles.stepLabels}>
            <span style={{
              ...styles.stepLabel,
              ...(currentStep >= 1 ? styles.stepLabelActive : {})
            }} className="step-label">
              Basic Info
            </span>
            <span style={{
              ...styles.stepLabel,
              ...(currentStep >= 2 ? styles.stepLabelActive : {})
            }} className="step-label">
              Details
            </span>
            <span style={{
              ...styles.stepLabel,
              ...(currentStep >= 3 ? styles.stepLabelActive : {})
            }} className="step-label">
              Media
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div style={styles.formCard}>
          {renderStepContent()}
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div style={styles.errorCard}>
            <div style={styles.errorIcon}>⚠️</div>
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={styles.navigationContainer}>
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                style={{
                  ...styles.btn,
                  ...styles.btnOutline,
                  ...(isLoading ? styles.btnDisabled : {})
                }}
                onClick={prevStep}
                disabled={isLoading}
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div style={styles.buttonGroup}>
            {currentStep < 3 ? (
              <button
                type="button"
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary,
                  ...(isLoading ? styles.btnDisabled : {})
                }}
                onClick={nextStep}
                disabled={isLoading}
              >
                Next →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  style={{
                    ...styles.btn,
                    ...styles.btnOutline,
                    ...(isLoading ? styles.btnDisabled : {})
                  }}
                  onClick={() => handleSubmit('draft')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div style={styles.spinner}></div>
                      Saving...
                    </>
                  ) : (
                    '💾 Save as Draft'
                  )}
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    ...(isLoading ? styles.btnDisabled : {})
                  }}
                  onClick={() => handleSubmit('pending')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div style={styles.spinner}></div>
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
    </>
  );
};

export default CreateCourse;