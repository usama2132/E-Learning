import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useCourses from '../../hooks/useCourses';
import Button from '../common/Button';
import Input from '../common/Input';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import VideoUpload from './VideoUpload';
import '../../styles/dashboards/CourseForm.css';
import '../../styles/dashboards/EditCourse.css';




const EditCourse = () => {
  const { user, getToken } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { updateCourse, getCourse } = useCourses();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    discountPrice: '',
    category: '',
    level: 'Beginner',
    duration: '',
    language: 'English',
    requirements: [''],
    whatYouWillLearn: [''],
    tags: '',
    thumbnail: '',
    isPublished: false,
    sections: []
  });

  const categories = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'Design', 'Business', 'Marketing', 'Photography'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseData = await getCourse(courseId);
      
      if (courseData.instructorId !== user.id) {
        navigate('/unauthorized');
        return;
      }

      setCourse(courseData);
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        shortDescription: courseData.shortDescription || '',
        price: courseData.price || '',
        discountPrice: courseData.discountPrice || '',
        category: courseData.category || '',
        level: courseData.level || 'Beginner',
        duration: courseData.duration || '',
        language: courseData.language || 'English',
        requirements: courseData.requirements || [''],
        whatYouWillLearn: courseData.whatYouWillLearn || [''],
        tags: courseData.tags ? courseData.tags.join(', ') : '',
        thumbnail: courseData.thumbnail || '',
        isPublished: courseData.isPublished || false,
        sections: courseData.sections || []
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      setErrors({ general: 'Failed to load course data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
    setUnsavedChanges(true);
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
    setUnsavedChanges(true);
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, [field]: newArray }));
      setUnsavedChanges(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Valid duration is required';

    // Validate requirements array
    const validRequirements = formData.requirements.filter(req => req.trim());
    if (validRequirements.length === 0) {
      newErrors.requirements = 'At least one requirement is needed';
    }

    // Validate learning outcomes array
    const validLearningOutcomes = formData.whatYouWillLearn.filter(item => item.trim());
    if (validLearningOutcomes.length === 0) {
      newErrors.whatYouWillLearn = 'At least one learning outcome is needed';
    }

    if (formData.discountPrice && formData.discountPrice >= formData.price) {
      newErrors.discountPrice = 'Discount price must be less than regular price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const courseData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        whatYouWillLearn: formData.whatYouWillLearn.filter(item => item.trim()),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        duration: parseInt(formData.duration)
      };

      // Add this BEFORE await updateCourse(courseId, courseData);

// Save sections and videos to database
if (formData.sections.length > 0) {
  for (const section of formData.sections) {
    // Call API to create section
    const sectionResponse = await fetch(`http://localhost:5000/api/instructor/courses/${courseId}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        title: section.title,
        description: section.description,
        order: section.order || 1
      })
    });
    
    const sectionData = await sectionResponse.json();
    const sectionId = sectionData.data.section._id;
    
    // Add lessons and videos to this section
    if (section.lectures && section.lectures.length > 0) {
      for (const lecture of section.lectures) {
        // Create lesson
        const lessonResponse = await fetch(`http://localhost:5000/api/instructor/courses/${courseId}/sections/${sectionId}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            title: lecture.title,
            description: lecture.description,
            order: lecture.order || 1
          })
        });
        
        const lessonData = await lessonResponse.json();
        const lessonId = lessonData.data.lesson._id;
        
        // Add videos to lesson
        if (lecture.videos && lecture.videos.length > 0) {
          for (const video of lecture.videos) {
            await fetch(`http://localhost:5000/api/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/videos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
              },
              body: JSON.stringify({
                title: video.title,
                description: video.description,
                url: video.url,
                duration: video.duration,
                order: video.order || 1
              })
            });
          }
        }
      }
    }
  }
}

      await updateCourse(courseId, courseData);
      setUnsavedChanges(false);
      navigate(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Error updating course:', error);
      setErrors({ general: 'Failed to update course. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      const updatedCourse = {
        ...formData,
        isPublished: !formData.isPublished
      };
      
      await updateCourse(courseId, updatedCourse);
      setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }));
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error toggling publish status:', error);
      setErrors({ general: 'Failed to update publish status' });
    }
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      description: '',
      lectures: [],
      isCollapsed: false
    };
    
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setUnsavedChanges(true);
  };

  const updateSection = (sectionId, updates) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
    setUnsavedChanges(true);
  };

  const deleteSection = (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== sectionId)
      }));
      setUnsavedChanges(true);
    }
  };

  if (loading) {
    return <Loading message="Loading course data..." />;
  }

  if (!course) {
    return <div className="error-message">Course not found</div>;
  }

  return (
    <div className="edit-course">
      <div className="edit-course-header">
        <h1>Edit Course</h1>
        <div className="header-actions">
          <Button
            variant="outline"
            onClick={() => navigate('/instructor/courses')}
          >
            Cancel
          </Button>
          <Button
            variant={formData.isPublished ? 'danger' : 'success'}
            onClick={handlePublishToggle}
          >
            {formData.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="edit-course-content">
        <nav className="section-nav">
          <button
            className={activeSection === 'basic' ? 'active' : ''}
            onClick={() => setActiveSection('basic')}
          >
            Basic Info
          </button>
          <button
            className={activeSection === 'content' ? 'active' : ''}
            onClick={() => setActiveSection('content')}
          >
            Content
          </button>
          <button
            className={activeSection === 'pricing' ? 'active' : ''}
            onClick={() => setActiveSection('pricing')}
          >
            Pricing
          </button>
          <button
            className={activeSection === 'settings' ? 'active' : ''}
            onClick={() => setActiveSection('settings')}
          >
            Settings
          </button>
        </nav>

        <form onSubmit={handleSubmit} className="course-form">
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          {activeSection === 'basic' && (
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <Input
                label="Course Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
                required
              />

              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief course description (max 160 characters)"
                  maxLength={160}
                  className={errors.shortDescription ? 'error' : ''}
                  required
                />
                {errors.shortDescription && (
                  <span className="error-text">{errors.shortDescription}</span>
                )}
              </div>

              <div className="form-group">
                <label>Full Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed course description"
                  rows={6}
                  className={errors.description ? 'error' : ''}
                  required
                />
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={errors.category ? 'error' : ''}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="error-text">{errors.category}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <Input
                  label="Duration (hours)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  error={errors.duration}
                  min="1"
                  required
                />

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Tags (comma-separated)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="react, javascript, frontend, web development"
              />
            </div>
          )}

          {activeSection === 'content' && (
            <div className="form-section">
              <h2>Course Content</h2>
              
              <div className="array-field">
                <label>What students will learn</label>
                {formData.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                      placeholder="Learning outcome"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      onClick={() => removeArrayItem('whatYouWillLearn', index)}
                      disabled={formData.whatYouWillLearn.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('whatYouWillLearn')}
                >
                  Add Learning Outcome
                </Button>
                {errors.whatYouWillLearn && (
                  <span className="error-text">{errors.whatYouWillLearn}</span>
                )}
              </div>

              <div className="array-field">
                <label>Requirements</label>
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                      placeholder="Course requirement"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      onClick={() => removeArrayItem('requirements', index)}
                      disabled={formData.requirements.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('requirements')}
                >
                  Add Requirement
                </Button>
                {errors.requirements && (
                  <span className="error-text">{errors.requirements}</span>
                )}
              </div>

              <div className="sections-content">
                <div className="sections-header">
                  <h3>Course Sections</h3>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={addSection}
                  >
                    Add Section
                  </Button>
                </div>

                {formData.sections.map((section, index) => (
                  <div key={section.id} className="section-card">
                    <div className="section-header">
                      <Input
                        placeholder="Section title"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={() => deleteSection(section.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <textarea
                      placeholder="Section description"
                      value={section.description}
                      onChange={(e) => updateSection(section.id, { description: e.target.value })}
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={() => setShowVideoUpload(true)}
              >
                Manage Videos
              </Button>
            </div>
          )}

          {activeSection === 'pricing' && (
            <div className="form-section">
              <h2>Pricing</h2>
              
              <div className="form-row">
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  error={errors.price}
                  required
                />

                <Input
                  label="Discount Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discountPrice}
                  onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                  error={errors.discountPrice}
                  placeholder="Optional"
                />
              </div>

              {formData.discountPrice && formData.price && (
                <div className="discount-info">
                  <p>
                    Discount: {((1 - formData.discountPrice / formData.price) * 100).toFixed(0)}% off
                  </p>
                  <p>
                    Students save: ${(formData.price - formData.discountPrice).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="form-section">
              <h2>Course Settings</h2>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  />
                  Published (visible to students)
                </label>
              </div>

              <div className="course-status">
                <h3>Course Status</h3>
                <div className="status-info">
                  <div className="status-item">
                    <span>Current Status:</span>
                    <span className={`status ${formData.isPublished ? 'published' : 'draft'}`}>
                      {formData.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="status-item">
                    <span>Last Updated:</span>
                    <span>{new Date(course.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="status-item">
                    <span>Total Sections:</span>
                    <span>{formData.sections.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/instructor/courses')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving || !unsavedChanges}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {showVideoUpload && (
        <Modal
          isOpen={showVideoUpload}
          onClose={() => setShowVideoUpload(false)}
          title="Manage Course Videos"
        >
          <VideoUpload
            courseId={courseId}
            sections={formData.sections}
            onClose={() => setShowVideoUpload(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default EditCourse;
