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

  // Fixed API base URL to match backend
  const API_BASE_URL = 'http://localhost:5000/api';

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
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const endpoint = isInWishlist ? 
        `${API_BASE_URL}/student/wishlist/${course._id}` :
        `${API_BASE_URL}/student/wishlist/${course._id}`;
      
      const method = isInWishlist ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const action = isInWishlist ? 'removed from' : 'added to';
        alert(`Course ${action} wishlist successfully!`);
        
        // Call parent callback if provided
        if (isInWishlist && onRemoveFromWishlist) {
          onRemoveFromWishlist(course._id);
        } else if (!isInWishlist && onAddToWishlist) {
          onAddToWishlist(course._id);
        }
      } else {
        throw new Error(result.message || 'Failed to update wishlist');
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
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      console.log('Enrolling in course:', course._id, 'Price:', course.price);

      if (course.price === 0) {
        // Free course enrollment - use correct backend endpoint
        const response = await fetch(`${API_BASE_URL}/courses/${course._id}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            paymentMethod: 'free'
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('Successfully enrolled in the free course!');
          if (onEnroll) onEnroll(course._id);
          // Refresh page to update enrollment status
          window.location.reload();
        } else {
          throw new Error(result.message || 'Free enrollment failed');
        }
      } else {
        // Paid course - redirect to checkout
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
    const rating = course.averageRating || course.rating || 0;
    const reviewCount = course.totalReviews || course.reviewCount || 0;
    
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
        {course.totalStudents || course.totalEnrollments || course.enrolledCount || 0} students
      </span>
      <span className="stat-divider">•</span>
      <span className="stat">
        {formatDuration(course.totalDuration || course.duration || 0)}
      </span>
      <span className="stat-divider">•</span>
      <span className="stat">
        {course.totalLessons || course.lessonCount || 0} lessons
      </span>
      <span className="stat-divider">•</span>
      <span className="stat">
        {course.level || 'Beginner'}
      </span>
    </div>
  );

  // Fixed instructor name handling to match backend data structure
  const getInstructorName = () => {
    if (course.instructor) {
      if (typeof course.instructor === 'string') {
        return 'Instructor'; 
      } else if (course.instructor.name) {
        return course.instructor.name;
      } else if (course.instructor.firstName && course.instructor.lastName) {
        return `${course.instructor.firstName} ${course.instructor.lastName}`;
      } else if (course.instructor.email) {
        return course.instructor.email.split('@')[0];
      }
    }
    
    if (course.instructorName) {
      return course.instructorName;
    }
    
    return 'Unknown Instructor';
  };

  // Fixed thumbnail handling to match backend structure
  const getThumbnailUrl = () => {
    if (course.thumbnail) {
      if (typeof course.thumbnail === 'string') {
        return course.thumbnail;
      } else if (course.thumbnail.url) {
        return course.thumbnail.url;
      }
    }
    return null;
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
            src={getThumbnailUrl() || '/default-course-image.jpg'}
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
          {course.category && (
            <span className="category-tag">
              {typeof course.category === 'string' ? course.category : course.category.name}
            </span>
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