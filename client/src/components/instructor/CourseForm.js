import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Camera, X, Plus, CheckCircle, Circle, Upload, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

// CSS Styles for animations and responsive design
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .form-container {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  .step-content {
    animation: slideIn 0.3s ease-in-out;
  }
  
  .loading-spinner {
    animation: spin 1s linear infinite;
  }
  
  input:focus,
  textarea:focus,
  select:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }
  
  .tag-item:hover {
    transform: scale(1.05);
  }
  
  .list-item:hover {
    transform: translateX(4px);
  }
  
  .thumbnail-upload:hover {
    border-color: #3b82f6 !important;
    background-color: rgba(59, 130, 246, 0.05) !important;
  }
  
  @media (max-width: 768px) {
    .step-indicator {
      flex-direction: column;
      gap: 16px !important;
    }
    
    .step-connector {
      display: none !important;
    }
    
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    
    .button-group {
      flex-direction: column;
      width: 100%;
    }
    
    .button-group button {
      width: 100%;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 12px !important;
    }
    
    .form-container {
      border-radius: 12px !important;
    }
    
    .header {
      padding: 20px 16px !important;
    }
    
    .content {
      padding: 20px 16px !important;
    }
    
    .step-circle {
      width: 40px !important;
      height: 40px !important;
      font-size: 14px !important;
    }
    
    .step-label {
      font-size: 11px !important;
    }
  }
`;

// Button component with theme support
const Button = ({ children, type = 'button', variant = 'primary', loading = false, onClick, disabled, className = '', ...props }) => {
  const { theme } = useTheme();
  
  const getButtonStyles = () => {
    const baseStyles = {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: loading || disabled ? 'not-allowed' : 'pointer',
      opacity: loading || disabled ? 0.6 : 1,
      transition: 'all 0.2s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      outline: 'none',
      minHeight: '44px',
      position: 'relative'
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
          color: 'white',
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#10b981',
          color: 'white',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
        };
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: '#ef4444',
          color: 'white',
          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
        };
      default:
        return baseStyles;
    }
  };
  
  return (
    <button
      type={type}
      style={getButtonStyles()}
      disabled={loading || disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {loading ? (
        <div className="loading-spinner" style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%'
        }}></div>
      ) : children}
    </button>
  );
};

// Input component with theme support
const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder, 
  helperText, 
  required = false,
  rows = 3,
  maxLength,
  min,
  step,
  onKeyPress,
  ...props 
}) => {
  const { theme } = useTheme();
  
  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${error ? '#ef4444' : (theme === 'dark' ? '#4b5563' : '#d1d5db')}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
    color: theme === 'dark' ? '#e5e7eb' : '#111827',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    minHeight: type === 'textarea' ? 'auto' : '44px',
    resize: type === 'textarea' ? 'vertical' : 'none'
  };
  
  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: theme === 'dark' ? '#e5e7eb' : '#374151'
        }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          style={inputStyles}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          onKeyPress={onKeyPress}
          {...props}
        />
      ) : (
        <input
          type={type}
          style={inputStyles}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          step={step}
          onKeyPress={onKeyPress}
          {...props}
        />
      )}
      {helperText && (
        <div style={{ 
          marginTop: '6px', 
          fontSize: '12px', 
          color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
        }}>
          {helperText}
        </div>
      )}
      {error && (
        <div style={{ 
          marginTop: '6px', 
          fontSize: '12px', 
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <X size={12} />
          {error}
        </div>
      )}
    </div>
  );
};

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps, steps }) => {
  const { theme } = useTheme();
  
  return (
    <div className="step-indicator" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '40px',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            minWidth: '80px'
          }}>
            <div className="step-circle" style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: index + 1 <= currentStep 
                ? '#3b82f6' 
                : (theme === 'dark' ? '#374151' : '#e5e7eb'),
              color: index + 1 <= currentStep 
                ? 'white' 
                : (theme === 'dark' ? '#9ca3af' : '#6b7280'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              border: index + 1 === currentStep ? '3px solid #60a5fa' : 'none',
              boxShadow: index + 1 <= currentStep ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}>
              {index + 1 < currentStep ? <CheckCircle size={24} /> : index + 1}
            </div>
            <span className="step-label" style={{
              fontSize: '12px',
              fontWeight: '500',
              color: index + 1 <= currentStep 
                ? (theme === 'dark' ? '#e5e7eb' : '#374151')
                : (theme === 'dark' ? '#6b7280' : '#9ca3af'),
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="step-connector" style={{
              width: '40px',
              height: '2px',
              backgroundColor: index + 1 < currentStep 
                ? '#3b82f6' 
                : (theme === 'dark' ? '#374151' : '#e5e7eb'),
              marginTop: '-20px',
              transition: 'background-color 0.3s ease'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Progress bar component
const ProgressBar = ({ currentStep, totalSteps }) => {
  const { theme } = useTheme();
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div style={{
      width: '100%',
      height: '4px',
      backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      borderRadius: '2px',
      marginBottom: '24px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: '2px',
        transition: 'width 0.3s ease'
      }} />
    </div>
  );
};

const CourseForm = ({ course = null, onSubmit, onCancel, loading = false }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'beginner',
    price: '',
    thumbnail: '',
    tags: [],
    requirements: [],
    whatYouWillLearn: [],
    curriculum: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentLearningPoint, setCurrentLearningPoint] = useState('');
  const [errors, setErrors] = useState({});

  const steps = [
    { label: 'Basic Info', icon: FileText },
    { label: 'Details', icon: Settings },
    { label: 'Media', icon: Camera }
  ];

  const categories = [
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Design',
    'Marketing',
    'Business',
    'Photography',
    'Music',
    'Art',
    'Health & Fitness',
    'Language',
    'Other'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all-levels', label: 'All Levels' }
  ];

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        shortDescription: course.shortDescription || '',
        category: course.category || '',
        level: course.level || 'beginner',
        price: course.price || '',
        thumbnail: course.thumbnail || '',
        tags: course.tags || [],
        requirements: course.requirements || [],
        whatYouWillLearn: course.whatYouWillLearn || [],
        curriculum: course.curriculum || []
      });
    }
  }, [course]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const handleThumbnailUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setErrors(prev => ({ ...prev, thumbnail: 'File size must be less than 5MB' }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, thumbnail: 'Please select a valid image file' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('thumbnail', e.target.result);
        setErrors(prev => ({ ...prev, thumbnail: '' }));
      };
      reader.readAsDataURL(file);
    }
  }, [handleInputChange]);

  const addTag = useCallback(() => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag('');
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: '' }));
      }
    }
  }, [currentTag, formData.tags, errors.tags]);

  const removeTag = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  }, []);

  const addRequirement = useCallback(() => {
    const trimmedRequirement = currentRequirement.trim();
    if (trimmedRequirement && formData.requirements.length < 10) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, trimmedRequirement]
      }));
      setCurrentRequirement('');
    }
  }, [currentRequirement, formData.requirements]);

  const removeRequirement = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  }, []);

  const addLearningPoint = useCallback(() => {
    const trimmedPoint = currentLearningPoint.trim();
    if (trimmedPoint && formData.whatYouWillLearn.length < 10) {
      setFormData(prev => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, trimmedPoint]
      }));
      setCurrentLearningPoint('');
      if (errors.whatYouWillLearn) {
        setErrors(prev => ({ ...prev, whatYouWillLearn: '' }));
      }
    }
  }, [currentLearningPoint, formData.whatYouWillLearn, errors.whatYouWillLearn]);

  const removeLearningPoint = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index)
    }));
  }, []);

  const validateStep = useCallback((step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Course title is required';
      } else if (formData.title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters';
      }

      if (!formData.category) {
        newErrors.category = 'Category is required';
      }

      if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
        newErrors.price = 'Valid price is required';
      }
    }

    if (step === 2) {
      if (!formData.description.trim()) {
        newErrors.description = 'Course description is required';
      } else if (formData.description.length < 50) {
        newErrors.description = 'Description must be at least 50 characters';
      }

      if (!formData.shortDescription.trim()) {
        newErrors.shortDescription = 'Short description is required';
      } else if (formData.shortDescription.length > 150) {
        newErrors.shortDescription = 'Short description must be 150 characters or less';
      }

      if (formData.tags.length === 0) {
        newErrors.tags = 'At least one tag is required';
      }

      if (formData.whatYouWillLearn.length === 0) {
        newErrors.whatYouWillLearn = 'At least one learning outcome is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateForm = useCallback(() => {
    return validateStep(1) && validateStep(2);
  }, [validateStep]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit?.(formData);
    }
  }, [formData, validateForm, onSubmit]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Theme-based styles
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
    padding: '20px',
    transition: 'all 0.3s ease'
  };

  const formContainerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: theme === 'dark' 
      ? '0 10px 25px rgba(0, 0, 0, 0.3)' 
      : '0 10px 25px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const headerStyle = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '32px 24px',
    color: 'white',
    textAlign: 'center'
  };

  const contentStyle = {
    padding: '32px 24px'
  };

  const sectionStyle = {
    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb'
  };

  const tagStyle = {
    backgroundColor: theme === 'dark' ? '#1e40af' : '#dbeafe',
    color: theme === 'dark' ? '#bfdbfe' : '#1e40af',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    margin: '4px',
    fontWeight: '500',
    transition: 'transform 0.2s ease'
  };

  const listItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
    marginBottom: '12px',
    transition: 'transform 0.2s ease'
  };

  const renderBasicInfo = () => (
    <div className="step-content">
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        marginBottom: '24px',
        color: theme === 'dark' ? '#e5e7eb' : '#111827'
      }}>
        Basic Information
      </h3>
      
      <Input
        label="Course Title"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={errors.title}
        placeholder="Enter an engaging course title"
        required
      />
      
      <div className="form-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: theme === 'dark' ? '#e5e7eb' : '#374151'
          }}>
            Category <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.category ? '#ef4444' : (theme === 'dark' ? '#4b5563' : '#d1d5db')}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
              color: theme === 'dark' ? '#e5e7eb' : '#111827',
              minHeight: '44px'
            }}
            required
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <div style={{ 
              marginTop: '6px', 
              fontSize: '12px', 
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <X size={12} />
              {errors.category}
            </div>
          )}
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: theme === 'dark' ? '#e5e7eb' : '#374151'
          }}>
            Difficulty Level
          </label>
          <select
            value={formData.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
              color: theme === 'dark' ? '#e5e7eb' : '#111827',
              minHeight: '44px'
            }}
          >
            {levels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Price ($)"
        type="number"
        value={formData.price}
        onChange={(e) => handleInputChange('price', e.target.value)}
        error={errors.price}
        placeholder="0.00"
        min="0"
        step="0.01"
        required
      />
    </div>
  );

  const renderDetails = () => (
    <div className="step-content">
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        marginBottom: '24px',
        color: theme === 'dark' ? '#e5e7eb' : '#111827'
      }}>
        Course Details
      </h3>
      
      <Input
        label="Short Description"
        value={formData.shortDescription}
        onChange={(e) => handleInputChange('shortDescription', e.target.value)}
        error={errors.shortDescription}
        placeholder="Brief description for course preview (max 150 characters)"
        maxLength={150}
        helperText={
          <span style={{ color: formData.shortDescription.length >= 150 ? '#ef4444' : (theme === 'dark' ? '#9ca3af' : '#6b7280') }}>
            {formData.shortDescription.length}/150 characters
          </span>
        }
        required
      />

      <Input
        label="Detailed Description"
        type="textarea"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        error={errors.description}
        placeholder="Detailed course description..."
        helperText={
          <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            {formData.description.length} characters (minimum 50)
          </span>
        }
        rows={6}
        required
      />

      {/* Tags Section */}
      <div style={sectionStyle}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: theme === 'dark' ? '#e5e7eb' : '#111827'
        }}>
          Tags {formData.tags.length === 0 && <span style={{ color: '#ef4444' }}>*</span>}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', minHeight: '40px' }}>
          {formData.tags.length > 0 ? (
            formData.tags.map((tag, index) => (
              <span key={index} style={tagStyle} className="tag-item">
                {tag}
                <button
                  type="button"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'inherit', 
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={() => removeTag(index)}
                >
                  <X size={14} />
                </button>
              </span>
            ))
          ) : (
            <div style={{ 
              color: theme === 'dark' ? '#6b7280' : '#9ca3af',
              fontSize: '14px',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              minHeight: '32px'
            }}>
              No tags added yet. Add some relevant tags to help students find your course.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add a tag (e.g., JavaScript, Beginner, Web Development)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                color: theme === 'dark' ? '#e5e7eb' : '#111827',
                minHeight: '44px'
              }}
            />
          </div>
          <Button 
            type="button" 
            onClick={addTag}
            disabled={!currentTag.trim() || formData.tags.includes(currentTag.trim()) || formData.tags.length >= 10}
          >
            <Plus size={16} />
            Add Tag
          </Button>
        </div>
        {formData.tags.length >= 10 && (
          <div style={{ 
            fontSize: '12px', 
            color: '#f59e0b',
            marginTop: '8px'
          }}>
            Maximum 10 tags allowed
          </div>
        )}
        {errors.tags && (
          <div style={{ 
            fontSize: '12px', 
            color: '#ef4444',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <X size={12} />
            {errors.tags}
          </div>
        )}
      </div>

      {/* Requirements Section */}
      <div style={sectionStyle}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: theme === 'dark' ? '#e5e7eb' : '#111827'
        }}>
          Prerequisites & Requirements
        </h4>
        <div style={{ marginBottom: '16px', minHeight: '60px' }}>
          {formData.requirements.length > 0 ? (
            formData.requirements.map((requirement, index) => (
              <div key={index} style={listItemStyle} className="list-item">
                <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span style={{ 
                  flex: 1, 
                  color: theme === 'dark' ? '#e5e7eb' : '#111827' 
                }}>
                  {requirement}
                </span>
                <button
                  type="button"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
                  onClick={() => removeRequirement(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <div style={{ 
              color: theme === 'dark' ? '#6b7280' : '#9ca3af',
              fontSize: '14px',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              minHeight: '60px',
              justifyContent: 'center',
              border: `2px dashed ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              padding: '20px'
            }}>
              No requirements added. Add any prerequisites students need before taking this course.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              value={currentRequirement}
              onChange={(e) => setCurrentRequirement(e.target.value)}
              placeholder="Add a requirement (e.g., Basic knowledge of HTML/CSS)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                color: theme === 'dark' ? '#e5e7eb' : '#111827',
                minHeight: '44px'
              }}
            />
          </div>
          <Button 
            type="button" 
            onClick={addRequirement}
            disabled={!currentRequirement.trim() || formData.requirements.length >= 10}
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
        {formData.requirements.length >= 10 && (
          <div style={{ 
            fontSize: '12px', 
            color: '#f59e0b',
            marginTop: '8px'
          }}>
            Maximum 10 requirements allowed
          </div>
        )}
      </div>

      {/* Learning Outcomes Section */}
      <div style={sectionStyle}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: theme === 'dark' ? '#e5e7eb' : '#111827'
        }}>
          What Students Will Learn {formData.whatYouWillLearn.length === 0 && <span style={{ color: '#ef4444' }}>*</span>}
        </h4>
        <div style={{ marginBottom: '16px', minHeight: '60px' }}>
          {formData.whatYouWillLearn.length > 0 ? (
            formData.whatYouWillLearn.map((point, index) => (
              <div key={index} style={listItemStyle} className="list-item">
                <div style={{ color: '#f59e0b', flexShrink: 0, fontSize: '16px' }}>⭐</div>
                <span style={{ 
                  flex: 1, 
                  color: theme === 'dark' ? '#e5e7eb' : '#111827' 
                }}>
                  {point}
                </span>
                <button
                  type="button"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
                  onClick={() => removeLearningPoint(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <div style={{ 
              color: theme === 'dark' ? '#6b7280' : '#9ca3af',
              fontSize: '14px',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              minHeight: '60px',
              justifyContent: 'center',
              border: `2px dashed ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              padding: '20px'
            }}>
              No learning outcomes added yet. Describe what students will achieve after completing this course.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              value={currentLearningPoint}
              onChange={(e) => setCurrentLearningPoint(e.target.value)}
              placeholder="Add a learning outcome (e.g., Build responsive websites using modern CSS)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningPoint())}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                color: theme === 'dark' ? '#e5e7eb' : '#111827',
                minHeight: '44px'
              }}
            />
          </div>
          <Button 
            type="button" 
            onClick={addLearningPoint}
            disabled={!currentLearningPoint.trim() || formData.whatYouWillLearn.length >= 10}
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
        {formData.whatYouWillLearn.length >= 10 && (
          <div style={{ 
            fontSize: '12px', 
            color: '#f59e0b',
            marginTop: '8px'
          }}>
            Maximum 10 learning outcomes allowed
          </div>
        )}
        {errors.whatYouWillLearn && (
          <div style={{ 
            fontSize: '12px', 
            color: '#ef4444',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <X size={12} />
            {errors.whatYouWillLearn}
          </div>
        )}
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="step-content">
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        marginBottom: '24px',
        color: theme === 'dark' ? '#e5e7eb' : '#111827'
      }}>
        Course Media & Assets
      </h3>
      
      <div style={sectionStyle}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: theme === 'dark' ? '#e5e7eb' : '#111827'
        }}>
          Course Thumbnail
        </h4>
        <p style={{ 
          fontSize: '14px', 
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          marginBottom: '20px'
        }}>
          Upload an attractive thumbnail that represents your course. This will be the first thing students see.
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '20px'
        }}>
          {formData.thumbnail ? (
            <div style={{ position: 'relative', maxWidth: '100%' }}>
              <img 
                src={formData.thumbnail} 
                alt="Course thumbnail" 
                style={{ 
                  width: '100%',
                  maxWidth: '400px',
                  height: '250px', 
                  objectFit: 'cover', 
                  borderRadius: '12px', 
                  border: `2px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                }}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
                onClick={() => handleInputChange('thumbnail', '')}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="thumbnail-upload" style={{
              width: '100%',
              maxWidth: '400px',
              height: '250px',
              border: `2px dashed ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <Camera size={64} style={{ 
                color: theme === 'dark' ? '#6b7280' : '#9ca3af',
                marginBottom: '16px'
              }} />
              <p style={{ 
                color: theme === 'dark' ? '#9ca3af' : '#6b7280', 
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'center',
                margin: '0 0 8px 0'
              }}>
                Upload Course Thumbnail
              </p>
              <p style={{ 
                color: theme === 'dark' ? '#6b7280' : '#9ca3af', 
                fontSize: '12px',
                textAlign: 'center',
                margin: '0'
              }}>
                Recommended: 1280x720px, Max size: 5MB
              </p>
              <p style={{ 
                color: theme === 'dark' ? '#6b7280' : '#9ca3af', 
                fontSize: '12px',
                textAlign: 'center',
                margin: '4px 0 0 0'
              }}>
                Supported formats: JPG, PNG, WebP
              </p>
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
            style={{ display: 'none' }}
            id="thumbnail-upload"
          />
          
          <label 
            htmlFor="thumbnail-upload" 
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
            }}
          >
            <Upload size={16} />
            {formData.thumbnail ? 'Change Image' : 'Upload Image'}
          </label>
          
          {errors.thumbnail && (
            <div style={{ 
              fontSize: '12px', 
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fef2f2',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ef4444'
            }}>
              <X size={12} />
              {errors.thumbnail}
            </div>
          )}
        </div>
      </div>

      {/* Course Summary */}
      <div style={sectionStyle}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: theme === 'dark' ? '#e5e7eb' : '#111827'
        }}>
          Course Summary
        </h4>
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>Title:</strong>{' '}
            <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              {formData.title || 'Not specified'}
            </span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>Category:</strong>{' '}
            <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              {formData.category || 'Not specified'}
            </span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>Level:</strong>{' '}
            <span style={{ 
              color: theme === 'dark' ? '#d1d5db' : '#374151',
              textTransform: 'capitalize'
            }}>
              {formData.level}
            </span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>Price:</strong>{' '}
            <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              ${formData.price || '0.00'}
            </span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>Tags:</strong>{' '}
            <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}
            </span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>Learning Outcomes:</strong>{' '}
            <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              {formData.whatYouWillLearn.length} items
            </span>
          </div>
          <div>
            <strong style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>Requirements:</strong>{' '}
            <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              {formData.requirements.length > 0 ? `${formData.requirements.length} items` : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderDetails();
      case 3:
        return renderMedia();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <>
      <style>{styles}</style>
      
      <div className="container" style={containerStyle}>
        <div style={formContainerStyle} className="form-container">
          {/* Header */}
          <div className="header" style={headerStyle}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {course ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p style={{ 
              fontSize: '18px', 
              margin: '0',
              opacity: 0.9
            }}>
              Build and share your knowledge with students worldwide
            </p>
          </div>

          {/* Content */}
          <div className="content" style={contentStyle}>
            {/* Progress Bar */}
            <ProgressBar currentStep={currentStep} totalSteps={3} />

            {/* Step Indicator */}
            <StepIndicator 
              currentStep={currentStep} 
              totalSteps={3} 
              steps={steps}
            />

            {/* Form Content */}
            <div style={{ marginBottom: '32px' }}>
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '24px', 
              borderTop: `2px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div className="button-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </div>

              <div className="button-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                  >
                    Next Step
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="success"
                    loading={loading}
                    onClick={handleSubmit}
                  >
                    <CheckCircle size={16} />
                    {course ? 'Update Course' : 'Create Course'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Demo component to show the form in action
export default function CourseFormDemo() {
  const [loading, setLoading] = useState(false);
  
  // Mock theme context for demo
  const [theme, setTheme] = useState('light');
  const mockThemeContext = {
    theme,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  };

  const handleSubmit = (formData) => {
    setLoading(true);
    console.log('Form submitted:', formData);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Course saved successfully!');
    }, 2000);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    alert('Form cancelled');
  };

  // Mock the useTheme hook
  const ThemeProvider = ({ children }) => {
    return (
      <div>
        {React.cloneElement(children, { 
          useTheme: () => mockThemeContext 
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Theme Toggle for Demo */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <Button
          onClick={mockThemeContext.toggleTheme}
          variant="secondary"
          style={{
            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
            color: theme === 'dark' ? '#e5e7eb' : '#374151'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </Button>
      </div>
      
      <CourseForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        useTheme={() => mockThemeContext}
      />
    </div>
  );
}