import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import VideoPlayer from '../components/common/VideoPlayer';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { formatCurrency, formatDuration } from '../utils/formatters';
import '../styles/component/CourseDetail.css';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, getToken } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError('Course ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching course details for ID:', id);
        
        const response = await api.courses.getCourseById(id);
        
        if (response.success && response.data) {
          const courseData = response.data.course || response.data;
          setCourse(courseData);
          
          // Check if user is enrolled
          if (user && isAuthenticated) {
            const enrollmentCheck = await checkEnrollmentStatus(courseData._id);
            setIsEnrolled(enrollmentCheck);
          }
          
          console.log('Course details loaded:', courseData.title);
        } else {
          setError('Course not found');
        }
        
      } catch (error) {
        console.error('Error fetching course:', error);
        setError(error.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user, isAuthenticated]);

  const checkEnrollmentStatus = async (courseId) => {
    if (!isAuthenticated) return false;
    
    try {
      const token = getToken();
      if (!token) return false;

      const response = await fetch(`http://localhost:5000/api/student/enrolled-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.courses) {
          return data.courses.some(course => 
            course._id === courseId || course.id === courseId
          );
        }
      }
    } catch (error) {
      console.log('Could not check enrollment status:', error.message);
    }
    
    return false;
  };

  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/courses/${id}` } });
      return;
    }

    if (isEnrolled) {
      navigate(`/student/course/${id}/lessons`);
      return;
    }

    if (course.instructor && user && (
      user._id === course.instructor._id || 
      user._id === course.instructor ||
      user.id === course.instructor._id ||
      user.id === course.instructor
    )) {
      navigate(`/instructor/courses`);
      return;
    }

    setEnrolling(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Enrolling in course:', id);

      if (course.price === 0) {
        // Free course enrollment
        const response = await fetch(`http://localhost:5000/api/courses/${id}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            courseId: String(course._id || id),
            paymentMethod: 'free'
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        if (result.success) {
          console.log('Successfully enrolled in free course');
          setIsEnrolled(true);
          alert('Successfully enrolled! Redirecting to course...');
          navigate(`/student/course/${id}/lessons`);
        } else {
          throw new Error(result.message || 'Enrollment failed');
        }
      } else {
        // Paid course - redirect to checkout
        navigate(`/checkout/${id}`);
      }

    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error.message || 'Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSection(expandedSection === sectionIndex ? null : sectionIndex);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`course-star ${i < Math.floor(rating) ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className={`course-details-page ${isDarkMode() ? 'dark-theme' : 'light-theme'}`}>
        <Header />
        <Loading message="Loading course details..." />
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={`course-details-page ${isDarkMode() ? 'dark-theme' : 'light-theme'}`}>
        <Header />
        <div className="course-error-container">
          <div className="course-error-content">
            <h1 className="course-error-title">
              {error || 'Course Not Found'}
            </h1>
            <p className="course-error-text">
              {error ? 'There was an error loading the course.' : "The course you're looking for doesn't exist."}
            </p>
            <button 
              onClick={() => navigate('/courses')}
              className="course-error-button"
            >
              Browse Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`course-details-page ${isDarkMode() ? 'dark-theme' : 'light-theme'}`}>
      <Header />
      
      <main className="course-main-content">
        <div className="course-grid">
          {/* Main Content */}
          <div className="course-main-section">
            {/* Course Header */}
            <div className="course-header-card">
              <div className="course-badges">
                <span className="course-category-badge">
                  {course.category?.name || course.category || 'General'}
                </span>
                <span className="course-level-badge">
                  {course.level || 'Beginner'}
                </span>
              </div>
              
              <h1 className="course-title">{course.title}</h1>
              <p className="course-description">
                {course.shortDescription || course.description}
              </p>
              
              <div className="course-meta-info">
                <div className="course-rating">
                  <div className="course-stars">
                    {renderStars(course.averageRating || 0)}
                  </div>
                  <span className="rating-value">{(course.averageRating || 0).toFixed(1)}</span>
                  <span className="rating-count">({course.totalReviews || 0} reviews)</span>
                </div>
                <div className="course-stat">
                  <span className="stat-icon">👥</span>
                  <span>{course.totalStudents || 0} students</span>
                </div>
                <div className="course-stat">
                  <span className="stat-icon">👨‍🏫</span>
                  <span>Created by {course.instructor?.name || 'Unknown'}</span>
                </div>
                <div className="course-stat">
                  <span className="stat-icon">📅</span>
                  <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            {course.previewVideo?.url && (
              <div className="course-video-card">
                <VideoPlayer
                  src={course.previewVideo.url}
                  poster={course.thumbnail?.url || course.thumbnail}
                  title="Course Preview"
                />
              </div>
            )}

            {/* Tabs */}
            <div className="course-tabs-container">
              <div className="course-tabs-nav">
                {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`course-tab ${activeTab === tab ? 'active' : ''}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="course-tab-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="course-overview">
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                      <div className="course-section">
                        <h3 className="course-section-title">What you'll learn</h3>
                        <ul className="course-learning-outcomes">
                          {course.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="course-outcome">
                              <span className="outcome-check">✓</span>
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {course.requirements && course.requirements.length > 0 && (
                      <div className="course-section">
                        <h3 className="course-section-title">Requirements</h3>
                        <ul className="course-requirements">
                          {course.requirements.map((requirement, index) => (
                            <li key={index} className="course-requirement">• {requirement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="course-section">
                      <h3 className="course-section-title">Description</h3>
                      <div className="course-full-description">
                        <p>{course.description}</p>
                      </div>
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div className="course-section">
                        <h3 className="course-section-title">Course Tags</h3>
                        <div className="course-tags">
                          {course.tags.map((tag, index) => (
                            <span key={index} className="course-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div className="course-curriculum">
                    <div className="curriculum-stats">
                      <p>
                        {course.sections?.length || 0} sections • {course.totalLessons || 0} lessons • {formatDuration(course.totalDuration)}
                      </p>
                    </div>
                    
                    <div className="curriculum-sections">
                      {course.sections?.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="curriculum-section">
                          <button
                            onClick={() => toggleSection(sectionIndex)}
                            className="section-header"
                          >
                            <div className="section-info">
                              <h4 className="section-title">
                                Section {sectionIndex + 1}: {section.title}
                              </h4>
                              <p className="section-meta">
                                {section.lessons?.length || 0} lectures • {formatDuration(section.duration)}
                              </p>
                            </div>
                            <span className="section-toggle">
                              {expandedSection === sectionIndex ? '−' : '+'}
                            </span>
                          </button>
                          
                          {expandedSection === sectionIndex && section.lessons && (
                            <div className="section-lessons">
                              {section.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="section-lesson">
                                  <div className="lesson-info">
                                    <span className="lesson-icon">
                                      {lesson.isPreview ? '🔓' : '🔒'}
                                    </span>
                                    <span className="lesson-title">{lesson.title}</span>
                                    {lesson.isPreview && (
                                      <span className="lesson-preview-badge">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <span className="lesson-duration">{formatDuration(lesson.duration)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )) || (
                        <p className="curriculum-empty">
                          Course curriculum will be available soon.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div className="course-instructor-tab">
                    <div className="instructor-profile">
                      <img
                        src={course.instructor?.profile?.avatar || course.instructor?.avatar || '/default-avatar.png'}
                        alt={course.instructor?.name || 'Instructor'}
                        className="instructor-avatar"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div className="instructor-details">
                        <h3 className="instructor-name">
                          {course.instructor?.name || 'Unknown Instructor'}
                        </h3>
                        <p className="instructor-title">
                          {course.instructor?.profile?.title || course.instructor?.title || 'Course Instructor'}
                        </p>
                        <div className="instructor-stats">
                          <span className="instructor-stat">
                            <span>⭐</span>
                            <span>{course.instructor?.averageRating || 'N/A'} rating</span>
                          </span>
                          <span className="instructor-stat">
                            <span>👥</span>
                            <span>{course.instructor?.totalStudents || 0} students</span>
                          </span>
                          <span className="instructor-stat">
                            <span>📚</span>
                            <span>{course.instructor?.totalCourses || 0} courses</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="instructor-bio">
                      <p>
                        {course.instructor?.profile?.bio || 
                         course.instructor?.bio || 
                         'Bio not available for this instructor.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="course-reviews-tab">
                    <div className="reviews-summary">
                      <div className="reviews-rating">
                        <span className="rating-large">
                          {(course.averageRating || 0).toFixed(1)}
                        </span>
                        <div className="rating-details">
                          <div className="rating-stars-large">
                            {renderStars(course.averageRating || 0)}
                          </div>
                          <p>{course.totalReviews || 0} reviews</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="reviews-list">
                      {course.reviews && course.reviews.length > 0 ? (
                        course.reviews.map((review) => (
                          <div key={review._id} className="review-item">
                            <div className="review-header">
                              <img
                                src={review.student?.profile?.avatar || review.student?.avatar || '/default-avatar.png'}
                                alt={review.student?.name || 'Student'}
                                className="review-avatar"
                              />
                              <div className="review-meta">
                                <div className="review-user-rating">
                                  <h4 className="review-user-name">
                                    {review.student?.name || 'Anonymous'}
                                  </h4>
                                  <div className="review-rating-stars">
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                                <p className="review-date">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                                <p className="review-comment">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="reviews-empty">
                          No reviews yet. Be the first to review this course!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            <div className="course-sidebar-card">
              {/* Course Thumbnail */}
              <div className="sidebar-thumbnail">
                <img
                  src={course.thumbnail?.url || course.thumbnail || '/placeholder-course.png'}
                  alt={course.title}
                  className="thumbnail-image"
                  onError={(e) => {
                    e.target.src = '/placeholder-course.png';
                  }}
                />
              </div>

              {/* Pricing */}
              <div className="sidebar-pricing">
                {course.price === 0 ? (
                  <div className="price-free">
                    Free
                  </div>
                ) : (
                  <div className="price-section">
                    <div className="current-price">
                      {formatCurrency(course.discountPrice && course.discountPrice < course.price ? course.discountPrice : course.price)}
                    </div>
                    {course.discountPrice && course.discountPrice < course.price && (
                      <div className="price-discount">
                        <span className="original-price">
                          {formatCurrency(course.price)}
                        </span>
                        <span className="discount-badge">
                          {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% off
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purchase/Enroll Button */}
              <div className="sidebar-action">
                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/student/course/${course._id || course.id}/lessons`)}
                    className="enroll-button enrolled"
                  >
                    Go to Course
                  </button>
                ) : (
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className="enroll-button"
                  >
                    {enrolling ? 'Processing...' : (course.price === 0 ? 'Enroll for Free' : 'Enroll Now')}
                  </button>
                )}
              </div>

              {/* Course Info */}
              <div className="sidebar-info">
                <div className="info-item">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{formatDuration(course.totalDuration)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Lessons:</span>
                  <span className="info-value">{course.totalLessons || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Level:</span>
                  <span className="info-value">{course.level || 'Beginner'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Language:</span>
                  <span className="info-value">{course.language || 'English'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Certificate:</span>
                  <span className="info-value">
                    {course.features?.certificate ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Access:</span>
                  <span className="info-value">
                    {course.features?.lifetimeAccess ? 'Lifetime' : 'Limited'}
                  </span>
                </div>
              </div>

              {/* Course Features */}
              <div className="sidebar-features">
                <h4 className="features-title">This course includes:</h4>
                <ul className="features-list">
                  <li className="feature-item">
                    <span className="feature-icon">📹</span>
                    <span>On-demand video</span>
                  </li>
                  {course.features?.downloadableResources && (
                    <li className="feature-item">
                      <span className="feature-icon">📁</span>
                      <span>Downloadable resources</span>
                    </li>
                  )}
                  {course.features?.mobileAccess && (
                    <li className="feature-item">
                      <span className="feature-icon">📱</span>
                      <span>Mobile access</span>
                    </li>
                  )}
                  {course.features?.certificate && (
                    <li className="feature-item">
                      <span className="feature-icon">🏆</span>
                      <span>Certificate of completion</span>
                    </li>
                  )}
                  {course.features?.lifetimeAccess && (
                    <li className="feature-item">
                      <span className="feature-icon">♾️</span>
                      <span>Full lifetime access</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetails;