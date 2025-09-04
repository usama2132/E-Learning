import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import VideoPlayer from '../components/common/VideoPlayer';
import PurchaseButton from '../components/student/PurchaseButton';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import { useTheme } from '../context/ThemeContext';
import '../styles/pages/CourseDetails.css';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCourseById } = useCourses();
  const { isDarkMode } = useTheme();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
  const fetchCourse = async () => {
    try {
      const courseData = await fetchCourseById(id);
      setCourse(courseData);
      
      // Check enrollment status if user is logged in
      if (user && courseData) {
        setCheckingEnrollment(true);
        const enrolled = await checkEnrollmentStatus(courseData._id || courseData.id);
        setIsEnrolled(enrolled);
        setCheckingEnrollment(false);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchCourse();
}, [id, fetchCourseById, user]);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const checkEnrollmentStatus = async (courseId) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('lms_auth_token');
    if (!token || !user) return false;

    const response = await fetch('http://localhost:5000/api/student/enrolled-courses', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.courses) {
        return data.courses.some(course => 
          course._id === courseId || course.id === courseId
        );
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
};

  if (loading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="course-details-container">
        <Navbar />
        <div className="course-not-found">
          <div className="not-found-content">
            <div className="not-found-icon">📚</div>
            <h1>Course Not Found</h1>
            <p>The course you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/courses')}
              className="browse-courses-btn"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-details-container">
      <Navbar />
      
      <main className="course-details-main">
        <div className="course-details-grid">
          {/* Main Content */}
          <div className="course-main-content">
            {/* Course Header */}
            <div className="course-header-card">
              <div className="course-category">
                <span className="category-badge">
                  {course.category?.name || course.category || 'General'}
                </span>
              </div>
              
              <h1 className="course-title">{course.title}</h1>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <div className="rating-info">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.floor(course.averageRating || 4.5) ? 'filled' : ''}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">
                    {course.averageRating || course.rating || 4.5}
                  </span>
                  <span className="reviews-count">
                    ({course.totalReviews || course.reviewCount || 0} reviews)
                  </span>
                </div>
                
                <div className="meta-divider">•</div>
                <div className="students-count">
                  👥 {course.totalEnrollments || course.studentsEnrolled || 0} students
                </div>
                
                <div className="meta-divider">•</div>
                <div className="instructor-name">
                  Created by {course.instructor?.name || 'Unknown Instructor'}
                </div>
                
                <div className="meta-divider">•</div>
                <div className="last-updated">
                  Updated {new Date(course.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Video Preview */}
            {course.previewVideo && (
              <div className="video-preview-card">
                <VideoPlayer
                  src={course.previewVideo}
                  poster={course.thumbnail?.url || course.thumbnail}
                  title="Course Preview"
                />
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="course-tabs-container">
              <div className="tabs-navigation">
                {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="tab-panel overview-panel">
                    <div className="learning-outcomes-section">
                      <h3 className="section-title">What you'll learn</h3>
                      <div className="outcomes-grid">
                        {(course.learningOutcomes || course.learningObjectives || []).map((outcome, index) => (
                          <div key={index} className="outcome-item">
                            <span className="check-icon">✓</span>
                            <span className="outcome-text">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {course.requirements && course.requirements.length > 0 && (
                      <div className="requirements-section">
                        <h3 className="section-title">Requirements</h3>
                        <ul className="requirements-list">
                          {course.requirements.map((requirement, index) => (
                            <li key={index} className="requirement-item">
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="full-description-section">
                      <h3 className="section-title">Description</h3>
                      <div className="description-content">
                        {course.fullDescription || course.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div className="tab-panel curriculum-panel">
                    <div className="curriculum-stats">
                      <span className="stat-item">
                        {course.sections?.length || 0} sections
                      </span>
                      <span className="stat-divider">•</span>
                      <span className="stat-item">
                        {course.totalLectures || course.totalLessons || 0} lectures
                      </span>
                      <span className="stat-divider">•</span>
                      <span className="stat-item">
                        {course.totalDuration || course.estimatedHours + ' hours'}
                      </span>
                    </div>
                    
                    <div className="sections-list">
                      {(course.sections || []).map((section, index) => (
                        <div key={section.id || section._id || index} className="section-item">
                          <button
                            onClick={() => toggleSection(section.id || section._id || index)}
                            className="section-header"
                          >
                            <div className="section-info">
                              <h4 className="section-title">
                                Section {index + 1}: {section.title}
                              </h4>
                              <p className="section-meta">
                                {section.lectures?.length || 0} lectures • {section.duration || '0 min'}
                              </p>
                            </div>
                            <span className="expand-icon">
                              {expandedSection === (section.id || section._id || index) ? '−' : '+'}
                            </span>
                          </button>
                          
                          {expandedSection === (section.id || section._id || index) && (
                            <div className="section-content">
                              {(section.lectures || []).map((lecture, lectureIndex) => (
                                <div key={lecture.id || lecture._id || lectureIndex} className="lecture-item">
                                  <div className="lecture-info">
                                    <span className="play-icon">▷</span>
                                    <span className="lecture-title">{lecture.title}</span>
                                  </div>
                                  <span className="lecture-duration">
                                    {lecture.duration || '0 min'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div className="tab-panel instructor-panel">
                    <div className="instructor-header">
                      <img
                        src={course.instructor?.profile?.avatar || course.instructor?.avatar || '/default-avatar.jpg'}
                        alt={course.instructor?.name || 'Instructor'}
                        className="instructor-avatar"
                      />
                      <div className="instructor-details">
                        <h3 className="instructor-name">
                          {course.instructor?.name || 'Unknown Instructor'}
                        </h3>
                        <p className="instructor-title">
                          {course.instructor?.title || 'Course Instructor'}
                        </p>
                        <div className="instructor-stats">
                          <span className="stat">⭐ {course.instructor?.rating || 4.5} rating</span>
                          <span className="stat">👥 {course.instructor?.students || 0} students</span>
                          <span className="stat">📚 {course.instructor?.courses || 0} courses</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="instructor-bio">
                      {course.instructor?.profile?.bio || course.instructor?.bio || 'No instructor biography available.'}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="tab-panel reviews-panel">
                    <div className="reviews-summary">
                      <div className="rating-overview">
                        <span className="overall-rating">
                          {course.averageRating || course.rating || 4.5}
                        </span>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="star filled">★</span>
                          ))}
                        </div>
                        <p className="total-reviews">
                          {course.totalReviews || course.reviewCount || 0} reviews
                        </p>
                      </div>
                    </div>
                    
                    <div className="reviews-list">
                      {(course.reviews || []).map((review, index) => (
                        <div key={review.id || review._id || index} className="review-item">
                          <div className="review-header">
                            <img
                              src={review.user?.avatar || '/default-avatar.jpg'}
                              alt={review.user?.name || 'Student'}
                              className="reviewer-avatar"
                            />
                            <div className="reviewer-info">
                              <h4 className="reviewer-name">
                                {review.user?.name || 'Anonymous'}
                              </h4>
                              <div className="review-rating">
                                {[...Array(review.rating || 5)].map((_, i) => (
                                  <span key={i} className="star">★</span>
                                ))}
                              </div>
                              <p className="review-date">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            <div className="pricing-card">
              <div className="price-section">
                <div className="current-price">
                  ${course.price || 0}
                </div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <div className="original-price">
                    ${course.originalPrice}
                  </div>
                )}
              </div>

              {checkingEnrollment ? (
  <button className="purchase-button" disabled>
    Checking enrollment...
  </button>
) : isEnrolled ? (
  <button 
    className="purchase-button enrolled"
    onClick={() => navigate(`/student/course/${course._id || course.id}/progress`)}
  >
    Continue Learning
  </button>
) : (
  <PurchaseButton course={course} />
)}

              <div className="course-features">
                <div className="feature-item">
                  <span className="feature-label">Duration:</span>
                  <span className="feature-value">
                    {course.totalDuration || course.estimatedHours + ' hours'}
                  </span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Lectures:</span>
                  <span className="feature-value">
                    {course.totalLectures || course.totalLessons || 0}
                  </span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Level:</span>
                  <span className="feature-value">{course.level}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Certificate:</span>
                  <span className="feature-value">Yes</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Access:</span>
                  <span className="feature-value">Lifetime</span>
                </div>
              </div>

              <div className="includes-section">
                <h4 className="includes-title">This course includes:</h4>
                <ul className="includes-list">
                  <li className="include-item">
                    <span className="include-icon">📹</span>
                    <span>On-demand video</span>
                  </li>
                  <li className="include-item">
                    <span className="include-icon">📝</span>
                    <span>Assignments</span>
                  </li>
                  <li className="include-item">
                    <span className="include-icon">📱</span>
                    <span>Mobile access</span>
                  </li>
                  <li className="include-item">
                    <span className="include-icon">🏆</span>
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;