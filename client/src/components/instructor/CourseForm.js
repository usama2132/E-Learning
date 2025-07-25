import React, { useState, useEffect } from 'react';

// Simple Button component without CSS classes
const Button = ({ children, type = 'button', variant = 'primary', loading = false, onClick, ...props }) => {
  const styles = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.5 : 1,
    backgroundColor: variant === 'primary' ? '#2563eb' : '#e5e7eb',
    color: variant === 'primary' ? 'white' : '#374151',
    transition: 'all 0.2s'
  };
  
  return (
    <button
      type={type}
      style={styles}
      disabled={loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

// Simple Input component without CSS classes
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
  const inputStyles = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none'
  };
  
  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
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
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
          {helperText}
        </div>
      )}
      {error && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>
          {error}
        </div>
      )}
    </div>
  );
};

const CourseForm = ({ course = null, onSubmit, onCancel, loading = false }) => {
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

  const handleInputChange = (field, value) => {
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
  };

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('thumbnail', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addLearningPoint = () => {
    if (currentLearningPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, currentLearningPoint.trim()]
      }));
      setCurrentLearningPoint('');
    }
  };

  const removeLearningPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    } else if (formData.shortDescription.length > 150) {
      newErrors.shortDescription = 'Short description must be 150 characters or less';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    if (formData.whatYouWillLearn.length === 0) {
      newErrors.whatYouWillLearn = 'At least one learning outcome is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const sectionStyle = {
    backgroundColor: '#f9fafb',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '32px'
  };

  const tagStyle = {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    margin: '4px'
  };

  const listItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
    marginBottom: '8px'
  };

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '24px', backgroundColor: 'white' }}>
      <div>
        {/* Basic Information */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Course Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
                placeholder="Enter an engaging course title"
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Category <span style={{ color: '#dad5d5ff' }}>*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.category ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none'
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
              {errors.category && <div style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>{errors.category}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Level</label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
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
          </div>
        </div>

        {/* Course Description */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Course Description</h3>
          <div>
            <Input
              label="Short Description"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              error={errors.shortDescription}
              placeholder="Brief description for course preview (max 150 characters)"
              maxLength={150}
              helperText={
                <span style={{ color: formData.shortDescription.length >= 150 ? '#ef4444' : '#6b7280' }}>
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
                <span style={{ color: '#6b7280' }}>
                  {formData.description.length} characters
                </span>
              }
              rows={6}
              required
            />
          </div>
        </div>

        {/* Thumbnail */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Course Thumbnail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {formData.thumbnail ? (
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <img 
                  src={formData.thumbnail} 
                  alt="Course thumbnail" 
                  style={{ width: '192px', height: '128px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onClick={() => handleInputChange('thumbnail', '')}
                >
                  ×
                </button>
              </div>
            ) : (
              <div style={{
                width: '192px',
                height: '128px',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Upload course thumbnail</p>
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
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              {formData.thumbnail ? 'Change Image' : 'Upload Image'}
            </label>
          </div>
        </div>

        {/* Tags */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Tags</h3>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {formData.tags.map((tag, index) => (
                <span key={index} style={tagStyle}>
                  {tag}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#1e40af', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => removeTag(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                Add Tag
              </Button>
            </div>
            {errors.tags && <div style={{ fontSize: '12px', color: '#ef4444' }}>{errors.tags}</div>}
          </div>
        </div>

        {/* Requirements */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Requirements</h3>
          <div>
            <div style={{ marginBottom: '16px' }}>
              {formData.requirements.map((requirement, index) => (
                <div key={index} style={listItemStyle}>
                  <div style={{ color: '#10b981' }}>✓</div>
                  <span style={{ flex: 1 }}>{requirement}</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => removeRequirement(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                value={currentRequirement}
                onChange={(e) => setCurrentRequirement(e.target.value)}
                placeholder="Add a requirement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement}>
                Add Requirement
              </Button>
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>What Students Will Learn</h3>
          <div>
            <div style={{ marginBottom: '16px' }}>
              {formData.whatYouWillLearn.map((point, index) => (
                <div key={index} style={listItemStyle}>
                  <div style={{ color: '#f59e0b' }}>⭐</div>
                  <span style={{ flex: 1 }}>{point}</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => removeLearningPoint(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                value={currentLearningPoint}
                onChange={(e) => setCurrentLearningPoint(e.target.value)}
                placeholder="Add a learning outcome"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningPoint())}
              />
              <Button type="button" onClick={addLearningPoint}>
                Add Learning Outcome
              </Button>
            </div>
            {errors.whatYouWillLearn && <div style={{ fontSize: '12px', color: '#ef4444' }}>{errors.whatYouWillLearn}</div>}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
          >
            {course ? 'Update Course' : 'Create Course'}
          </Button>
        </div>

      </div>
    </div>
  );
};

// Demo component to show the form in action
export default function CourseFormDemo() {
  const [loading, setLoading] = useState(false);

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
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '32px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px', color: 'white' }}>
          Create New Course
        </h1>
        <CourseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
}