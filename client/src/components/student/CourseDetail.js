import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import { useApi } from '../../hooks/useApi';
import Button from '../common/Button';
import Loading from '../common/Loading';
import VideoPlayer from '../common/VideoPlayer';
import ProgressBar from './ProgressBar';
import PurchaseButton from './PurchaseButton';
import { formatCurrency, formatDuration } from '../../utils/formatters';
import '../../styles/pages/CourseDetails.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { makeRequest } = useApi();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [previewLesson, setPreviewLesson] = useState(null);

  const {
    enrollInCourse,
    addToWishlist,
    removeFromWishlist,
    loading: courseActionLoading
  } = useCourses();

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await makeRequest(`/api/courses/${id}`, {
        method: 'GET'
      });
      
      if (response.success) {
        setCourse(response.course);
        fetchCourseReviews();
        fetchRelatedCourses(response.course.category);
        
        // Set first free lesson as preview
        const freeLesson = response.course.curriculum?.find(
          section => section.lessons?.find(lesson => lesson.isFree)
        )?.lessons?.find(lesson => lesson.isFree);
        
        if (freeLesson) {
          setPreviewLesson(freeLesson);
        }
      } else {
        setError(response.message || 'Course not found');
      }
    } catch (err) {
      setError('Failed to load course details');
      console.error('Course fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseReviews = async () => {
    try {
      const response = await makeRequest(`/api/courses/${id}/reviews`);
      if (response.success) {
        setReviews(response.reviews);
        
        // Check if user has already reviewed
        const existingReview = response.reviews.find(
          review => review.user._id === user?._id
        );
        if (existingReview) {
          setUserReview(existingReview);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedCourses = async (category) => {
    try {
      const response = await makeRequest(
        `/api/courses?category=${category}&limit=4&exclude=${id}`
      );
      if (response.success) {
        setRelatedCourses(response.courses);
      }
    } catch (error) {
      console.error('Error fetching related courses:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate(`/login?redirect=/course/${id}`);
      return;
    }

    try {
      await enrollInCourse(id);
      // Refresh course data to update enrollment status
      fetchCourseDetails();
    } catch (error) {
      console.error('Enrollment error:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate(`/login?redirect=/course/${id}`);
      return;
    }

    try {
      if (isInWishlist()) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
      // Refresh course data
      fetchCourseDetails();
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  const isEnrolled = () => {
    return user?.enrolledCourses?.includes(id) || false;
  };

  const isInWishlist = () => {
    return user?.wishlist?.includes(id) || false;
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSection(
      expandedSection === sectionIndex ? null : sectionIndex
    );
  };

  const calculateTotalLessons = () => {
    return course?.curriculum?.reduce((total, section) => 
      total + (section.lessons?.length || 0), 0
    ) || 0;
  };

  const renderCourseHeader = () => (
    <div className="course-header">
      <div className="course-meta">
        <div className="breadcrumb">
          <span onClick={() => navigate('/courses')}>Courses</span>
          <span className="separator">›</span>
          <span>{course.category}</span>
        </div>
        <div className="course-badges">
          {course.featured && <span className="badge featured">Featured</span>}
          {course.isNew && <span className="badge new">New</span>}
          {course.certificateEligible && <span className="badge certificate">Certificate</span>}
        </div>
      </div>
      
      <h1 className="course-title">{course.title}</h1>
      <p className="course-subtitle">{course.subtitle}</p>
      
      <div className="course-stats">
        <div className="stat">
          <span className="rating">
            ★ {course.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="review-count">
            ({course.reviewCount || 0} reviews)
          </span>
        </div>
        <div className="stat">
          <span className="enrolled-count">
            {course.enrolledCount || 0} students enrolled
          </span>
        </div>
        <div className="stat">
          <span className="last-updated">
            Last updated: {new Date(course.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="instructor-info">
        <img
          src={course.instructor.avatar || '/default-avatar.png'}
          alt={course.instructor.name}
          className="instructor-avatar"
        />
        <div className="instructor-details">
          <p className="instructor-name">By {course.instructor.name}</p>
          <p className="instructor-title">{course.instructor.title}</p>
        </div>
      </div>
    </div>
  );

  const renderCoursePreview = () => (
    <div className="course-preview">
      {previewLesson ? (
        <div className="preview-video">
          <VideoPlayer
            src={previewLesson.videoUrl}
            poster={course.thumbnail}
            title={`Preview: ${previewLesson.title}`}
            className="preview-player"
          />
          <div className="preview-info">
            <h4>Preview: {previewLesson.title}</h4>
            <p>{formatDuration(previewLesson.duration)}</p>
          </div>
        </div>
      ) : (
        <div className="course-thumbnail-large">
          <img src={course.thumbnail} alt={course.title} />
          <div className="play-overlay">
            <div className="play-button">▶</div>
            <p>Course Preview</p>
          </div>
        </div>
      )}
      
      <div className="purchase-section">
        <div className="price-info">
          {course.price === 0 ? (
            <span className="price free">Free</span>
          ) : (
            <div className="price-container">
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="original-price">
                  {formatCurrency(course.originalPrice)}
                </span>
              )}
              <span className="current-price">
                {formatCurrency(course.price)}
              </span>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="discount">
                  {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% off
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          {isEnrolled() ? (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => navigate(`/course/${id}/learn`)}
            >
              Go to Course
            </Button>
          ) : (
            <PurchaseButton
              course={course}
              onEnroll={handleEnroll}
              loading={courseActionLoading}
            />
          )}
          
          <Button
            variant={isInWishlist() ? "outline-primary" : "outline"}
            size="large"
            fullWidth
            onClick={handleWishlistToggle}
            loading={courseActionLoading}
          >
            {isInWishlist() ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
          </Button>
        </div>
        
        <div className="course-includes">
          <h4>This course includes:</h4>
          <ul>
            <li>📹 {formatDuration(course.totalDuration)} on-demand video</li>
            <li>📚 {calculateTotalLessons()} lessons</li>
            <li>📱 Access on mobile and desktop</li>
            {course.certificateEligible && (
              <li>🏆 Certificate of completion</li>
            )}
            <li>♾️ Full lifetime access</li>
            <li>💰 30-day money-back guarantee</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content overview">
            <div className="course-description">
              <h3>About this course</h3>
              <div dangerouslySetInnerHTML={{ __html: course.description }} />
            </div>
            
            <div className="what-you-learn">
              <h3>What you'll learn</h3>
              <ul className="learning-objectives">
                {course.learningObjectives?.map((objective, index) => (
                  <li key={index}>✓ {objective}</li>
                ))}
              </ul>
            </div>
            
            <div className="requirements">
              <h3>Requirements</h3>
              <ul>
                {course.requirements?.map((requirement, index) => (
                  <li key={index}>• {requirement}</li>
                )) || <li>• No prior experience required</li>}
              </ul>
            </div>
            
            <div className="target-audience">
              <h3>Who this course is for</h3>
              <ul>
                {course.targetAudience?.map((audience, index) => (
                  <li key={index}>• {audience}</li>
                )) || <li>• Anyone interested in learning</li>}
              </ul>
            </div>
          </div>
        );
        
      case 'curriculum':
        return (
          <div className="tab-content curriculum">
            <div className="curriculum-header">
              <h3>Course Content</h3>
              <p>
                {course.curriculum?.length || 0} sections • {calculateTotalLessons()} lessons • 
                {formatDuration(course.totalDuration)} total length
              </p>
            </div>
            
            <div className="curriculum-sections">
              {course.curriculum?.map((section, sectionIndex) => (
                <div key={sectionIndex} className="curriculum-section">
                  <div
                    className="section-header"
                    onClick={() => toggleSection(sectionIndex)}
                  >
                    <span className="section-title">
                      {section.title}
                    </span>
                    <div className="section-info">
                      <span className="lesson-count">
                        {section.lessons?.length || 0} lessons
                      </span>
                      <span className="expand-icon">
                        {expandedSection === sectionIndex ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {expandedSection === sectionIndex && (
                    <div className="section-lessons">
                      {section.lessons?.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="lesson-item">
                          <div className="lesson-info">
                            <span className="lesson-type">
                              {lesson.type === 'video' ? '📹' : '📄'}
                            </span>
                            <span className="lesson-title">{lesson.title}</span>
                            {lesson.isFree && <span className="free-badge">Free</span>}
                          </div>
                          <div className="lesson-meta">
                            <span className="lesson-duration">
                              {formatDuration(lesson.duration)}
                            </span>
                            {lesson.isFree && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => setPreviewLesson(lesson)}
                              >
                                Preview
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'instructor':
        return (
          <div className="tab-content instructor">
            <div className="instructor-profile">
              <div className="instructor-header">
                <img
                  src={course.instructor.avatar || '/default-avatar.png'}
                  alt={course.instructor.name}
                  className="instructor-avatar-large"
                />
                <div className="instructor-info">
                  <h3>{course.instructor.name}</h3>
                  <p className="instructor-title">{course.instructor.title}</p>
                  <div className="instructor-stats">
                    <div className="stat">
                      <span className="stat-number">
                        {course.instructor.totalStudents || 0}
                      </span>
                      <span className="stat-label">Students</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">
                        {course.instructor.totalCourses || 1}
                      </span>
                      <span className="stat-label">Courses</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">
                        ★ {course.instructor.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="stat-label">Rating</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="instructor-bio">
                <h4>About the Instructor</h4>
                <div dangerouslySetInnerHTML={{ 
                  __html: course.instructor.bio || 'No bio available.' 
                }} />
              </div>
              
              {course.instructor.socialLinks && (
                <div className="instructor-social">
                  <h4>Connect with {course.instructor.name}</h4>
                  <div className="social-links">
                    {course.instructor.socialLinks.website && (
                      <a href={course.instructor.socialLinks.website} target="_blank" rel="noopener noreferrer">
                        🌐 Website
                      </a>
                    )}
                    {course.instructor.socialLinks.linkedin && (
                      <a href={course.instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        💼 LinkedIn
                      </a>
                    )}
                    {course.instructor.socialLinks.twitter && (
                      <a href={course.instructor.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        🐦 Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'reviews':
        return (
          <div className="tab-content reviews">
            <div className="reviews-summary">
              <div className="rating-overview">
                <div className="average-rating">
                  <span className="rating-number">
                    {course.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`star ${star <= (course.averageRating || 0) ? 'filled' : 'empty'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p>{course.reviewCount || 0} reviews</p>
                </div>
                
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="rating-bar">
                      <span className="rating-label">{rating} ★</span>
                      <div className="bar">
                        <div
                          className="fill"
                          style={{
                            width: `${((course.ratingDistribution?.[rating] || 0) / (course.reviewCount || 1)) * 100}%`
                          }}
                        />
                      </div>
                      <span className="rating-count">
                        {course.ratingDistribution?.[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <img
                        src={review.user.avatar || '/default-avatar.png'}
                        alt={review.user.name}
                        className="reviewer-avatar"
                      />
                      <div className="reviewer-details">
                        <span className="reviewer-name">{review.user.name}</span>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              className={`star ${star <= review.rating ? 'filled' : 'empty'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-content">
                    <p>{review.comment}</p>
                  </div>
                </div>
              ))}
              
              {reviews.length === 0 && (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review this course!</p>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading message="Loading course details..." />;
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Course Not Found</h2>
        <p>{error}</p>
        <Button onClick={() => navigate('/courses')}>
          Browse All Courses
        </Button>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="course-detail">
      <div className="course-detail-container">
        <div className="course-content">
          {renderCourseHeader()}
          
          <div className="course-tabs">
            <div className="tab-nav">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'curriculum', label: 'Curriculum' },
                { key: 'instructor', label: 'Instructor' },
                { key: 'reviews', label: 'Reviews' }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {renderTabContent()}
          </div>
        </div>
        
        <div className="course-sidebar">
          {renderCoursePreview()}
        </div>
      </div>
      
      {relatedCourses.length > 0 && (
        <div className="related-courses">
          <h3>Related Courses</h3>
          <div className="related-courses-grid">
            {relatedCourses.map(relatedCourse => (
              <div
                key={relatedCourse._id}
                className="related-course-item"
                onClick={() => navigate(`/course/${relatedCourse._id}`)}
              >
                <img src={relatedCourse.thumbnail} alt={relatedCourse.title} />
                <div className="related-course-info">
                  <h4>{relatedCourse.title}</h4>
                  <p>{relatedCourse.instructor.name}</p>
                  <div className="related-course-meta">
                    <span className="rating">★ {relatedCourse.averageRating?.toFixed(1)}</span>
                    <span className="price">{formatCurrency(relatedCourse.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
