import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDuration } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import ProgressBar from './ProgressBar';
import '../../styles/dashboards/CourseCard.css';

const CourseCard = ({ 
  course, 
  variant = 'catalog', // 'catalog', 'enrolled', 'wishlist'
  onAddToWishlist,
  onRemoveFromWishlist,
  onEnroll,
  showProgress = false,
  userProgress = null,
  isEnrolled = false,
  isInWishlist = false,
  loadingAction = null
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [wishlistProcessing, setWishlistProcessing] = useState(false);
  
  const { isDarkMode, actualTheme } = useTheme();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login', { state: { returnTo: `/courses/${course._id}` } });
      return;
    }
    
    setWishlistProcessing(true);
    
    try {
      if (isInWishlist && onRemoveFromWishlist) {
        await onRemoveFromWishlist(course._id);
      } else if (!isInWishlist && onAddToWishlist) {
        await onAddToWishlist(course._id);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      alert(error.message || 'Failed to update wishlist');
    } finally {
      setWishlistProcessing(false);
    }
  };

  const handleEnrollClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login', { state: { returnTo: `/courses/${course._id}` } });
      return;
    }

    if (isEnrolled) {
      navigate(`/student/course/${course._id}/progress`);
      return;
    }

    setEnrolling(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('lms_auth_token') || getToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      if (course.price === 0) {
        const response = await fetch(`http://localhost:5000/api/courses/${course._id}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            courseId: course._id,
            paymentMethod: 'free'
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('Successfully enrolled in the free course!');
          if (onEnroll) onEnroll(course._id);
          window.location.reload();
        } else {
          throw new Error(result.message || 'Free enrollment failed');
        }
      } else {
        navigate(`/checkout/${course._id}`, {
          state: { course }
        });
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error.message || 'Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleCardClick = (e) => {
    const isClickingButton = e.target.closest('button') || 
                            e.target.closest('.course-actions') || 
                            e.target.closest('.wishlist-btn');
    
    if (isClickingButton) {
      return;
    }
    
    navigate(`/courses/${course._id}`);
  };

  const renderRating = () => {
    const rating = course.averageRating || 0;
    const reviewCount = course.totalReviews || 0;
    
    return (
      <div className="course-rating">
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= rating ? 'filled' : 'empty'}`}
            />
          ))}
        </div>
        <span className="rating-number">{rating.toFixed(1)}</span>
        <span className="review-count">({reviewCount})</span>
      </div>
    );
  };

  const renderPrice = () => {
    if (course.price === 0) {
      return <span className="price-free">Free</span>;
    }
    
    return (
      <div className="price-container">
        {course.discountPrice && course.discountPrice < course.price && (
          <span className="price-original">{formatCurrency(course.price)}</span>
        )}
        <span className="price-current">
          {formatCurrency(course.discountPrice && course.discountPrice < course.price ? course.discountPrice : course.price)}
        </span>
        {course.discountPrice && course.discountPrice < course.price && (
          <span className="discount-badge">
            {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
          </span>
        )}
      </div>
    );
  };

  const renderActions = () => {
    const isProcessing = enrolling || wishlistProcessing || (loadingAction && loadingAction.includes(course._id));

    return (
      <div className="course-actions" onClick={(e) => e.stopPropagation()}>
        {variant === 'catalog' && (
          <button
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
            onClick={handleWishlistClick}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            disabled={isProcessing}
            type="button"
          >
            <span className={`heart ${isInWishlist ? 'filled' : ''}`}>
              {wishlistProcessing ? '...' : '♡'}
            </span>
          </button>
        )}

        {isEnrolled ? (
          <Button 
            variant="primary" 
            size="small"
            onClick={(e) => { 
              e.stopPropagation();
              navigate(`/student/course/${course._id}/progress`);
            }}
            disabled={isProcessing}
          >
            Continue Learning
          </Button>
        ) : (
          <Button 
            variant="primary" 
            size="small"
            onClick={handleEnrollClick}
            disabled={isProcessing}
          >
            {enrolling ? 'Enrolling...' : (course.price === 0 ? 'Enroll Free' : 'Enroll Now')}
          </Button>
        )}

        {variant === 'wishlist' && (
          <Button
            variant="outline"
            size="small"
            onClick={handleWishlistClick}
            disabled={isProcessing}
          >
            {wishlistProcessing ? 'Removing...' : 'Remove'}
          </Button>
        )}
      </div>
    );
  };

  const renderCourseStats = () => (
    <div className="course-stats">
      <span className="stat">
        {course.totalStudents || course.totalEnrollments || 0} students
      </span>
      <span className="stat-divider">•</span>
      <span className="stat">
        {formatDuration(course.totalDuration)}
      </span>
      <span className="stat-divider">•</span>
      <span className="stat">
        {course.totalLessons || 0} lessons
      </span>
      <span className="stat-divider">•</span>
      <span className="stat">
        {course.level || 'Beginner'}
      </span>
    </div>
  );

  // FIXED: Get instructor name properly
  const getInstructorName = () => {
    // Handle different instructor data structures
    if (course.instructor) {
      if (typeof course.instructor === 'string') {
        return 'Instructor'; // Fallback when only ID is available
      } else if (course.instructor.name) {
        return course.instructor.name;
      } else if (course.instructor.firstName && course.instructor.lastName) {
        return `${course.instructor.firstName} ${course.instructor.lastName}`;
      } else if (course.instructor.email) {
        return course.instructor.email.split('@')[0]; // Use email prefix as fallback
      }
    }
    
    // Check for instructor name at course level
    if (course.instructorName) {
      return course.instructorName;
    }
    
    return 'Unknown Instructor';
  };

  return (
    <div 
      className={`course-card ${variant} ${actualTheme}`}
      onClick={handleCardClick}
    >
      <div className="course-thumbnail">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">
            <div className="loading-spinner"></div>
          </div>
        )}
        {imageError ? (
          <div className="image-fallback">
            <span>Course Image</span>
          </div>
        ) : (
          <img
            src={course.thumbnail?.url || course.thumbnail}
            alt={course.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        )}
        
        {course.featured && (
          <div className="featured-badge">Featured</div>
        )}
        
        {course.isNew && (
          <div className="new-badge">New</div>
        )}
        
        {showProgress && userProgress && (
          <div className="progress-overlay">
            <ProgressBar
              progress={userProgress.progress || 0}
              showPercentage={true}
              size="small"
            />
          </div>
        )}
      </div>
      
      <div className="course-content">
        <div className="course-header">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-instructor">
            {getInstructorName()}
          </p>
        </div>
        
        <p className="course-description">
          {course.shortDescription || 
           (course.description ? course.description.substring(0, 100) + '...' : '') ||
           'No description available'}
        </p>
        
        <div className="course-tags">
          {course.category?.name && (
            <span className="category-tag">{course.category.name}</span>
          )}
          {course.tags && course.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="skill-tag">{tag}</span>
          ))}
        </div>
        
        {renderRating()}
        {renderCourseStats()}
        
        {showProgress && userProgress && (
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-label">Your Progress</span>
              <span className="progress-percentage">
                {Math.round(userProgress.progress || 0)}%
              </span>
            </div>
            <ProgressBar
              progress={userProgress.progress || 0}
              showPercentage={false}
            />
            {userProgress.lastAccessed && (
              <p className="last-accessed">
                Last accessed: {new Date(userProgress.lastAccessed).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="course-footer">
        <div className="price-section">
          {renderPrice()}
        </div>
        {renderActions()}
      </div>
      
      {variant === 'enrolled' && userProgress?.completed && (
        <div className="completion-badge">
          <span>Completed</span>
        </div>
      )}
      
      {course.certificateEligible && variant === 'enrolled' && (
        <div className="certificate-eligible">
          <span>Certificate Available</span>
        </div>
      )}
    </div>
  );
};

export default CourseCard;