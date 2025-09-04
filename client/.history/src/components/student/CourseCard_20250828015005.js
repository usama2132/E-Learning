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

  // FIXED: Simplified wishlist handler
  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login', { state: { returnTo: `/courses/${course._id}` } });
      return;
    }
    
    setWishlistProcessing(true);
    
    try {
      // For now, just call the parent handlers if they exist
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

  // CRITICAL FIX: Simple enrollment handler that works with backend
  const handleEnrollClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login', { state: { returnTo: `/courses/${course._id}` } });
      return;
    }

    if (isEnrolled) {
      // Already enrolled, go to course
      navigate(`/student/course/${course._id}/progress`);
      return;
    }

    setEnrolling(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('lms_auth_token') || getToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      console.log('Enrolling in course:', course._id, 'Price:', course.price);

      if (course.price === 0) {
        // FREE COURSE ENROLLMENT
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
        console.log('Enrollment response:', result);

        if (response.ok && result.success) {
          alert('Successfully enrolled in the free course!');
          if (onEnroll) onEnroll(course._id);
          window.location.reload(); // Refresh to update UI
        } else {
          throw new Error(result.message || 'Free enrollment failed');
        }
      } else {
        // PAID COURSE - Navigate to checkout
        console.log('Redirecting to checkout for paid course');
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

  // FIXED: Card click handler 
  const handleCardClick = (e) => {
    // Prevent navigation if clicking buttons or interactive elements
    const isClickingButton = e.target.closest('button') || 
                            e.target.closest('.course-actions') || 
                            e.target.closest('.wishlist-btn');
    
    if (isClickingButton) {
      console.log('Clicked button, preventing card navigation');
      return;
    }
    
    console.log('Card clicked, navigating to course details:', course._id);
    navigate(`/courses/${course._id}`);
  };

  const renderRating = () => {
    const rating = course.averageRating || 0;
    const reviewCount = course.totalReviews || 0;
    
    return (
      <div className="course-rating">
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= rating ? 'filled' : 'empty'}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="rating-number">{rating.toFixed(1)}</span>
        <span className="review-count">({reviewCount} reviews)</span>
      </div>
    );
  };

  const renderPrice = () => {
    if (course.price === 0) {
      return <span className="price free">Free</span>;
    }
    
    return (
      <div className="price-container">
        {course.discountPrice && course.discountPrice < course.price && (
          <span className="original-price">{formatCurrency(course.price)}</span>
        )}
        <span className="current-price">
          {formatCurrency(course.discountPrice && course.discountPrice < course.price ? course.discountPrice : course.price)}
        </span>
        {course.discountPrice && course.discountPrice < course.price && (
          <span className="discount">
            {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% off
          </span>
        )}
      </div>
    );
  };

  const renderActions = () => {
    const isProcessing = enrolling || wishlistProcessing || (loadingAction && loadingAction.includes(course._id));

    return (
      <div className="course-actions" onClick={(e) => e.stopPropagation()}>
        {/* Wishlist Button - Only show in catalog view */}
        {variant === 'catalog' && (
          <button
            className={`wishlist-btn ${isInWishlist ? 'active' : ''} ${isDarkMode() ? 'dark' : 'light'}`}
            onClick={handleWishlistClick}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            disabled={isProcessing}
            type="button"
          >
            <span className="heart-icon">
              {wishlistProcessing ? '⏳' : (isInWishlist ? '❤️' : '🤍')}
            </span>
          </button>
        )}

        {/* Main Action Button */}
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

        {/* Remove from Wishlist (wishlist variant) */}
        {variant === 'wishlist' && (
          <Button
            variant="outline"
            size="small"
            onClick={handleWishlistClick}
            disabled={isProcessing}
          >
            {wishlistProcessing ? 'Removing...' : 'Remove from Wishlist'}
          </Button>
        )}
      </div>
    );
  };

  const renderCourseStats = () => (
    <div className="course-stats">
      <span className="stat">
        <span className="stat-icon">👥</span>
        {course.totalStudents || course.totalEnrollments || 0} students
      </span>
      <span className="stat">
        <span className="stat-icon">⏱️</span>
        {formatDuration(course.totalDuration)}
      </span>
      <span className="stat">
        <span className="stat-icon">📚</span>
        {course.totalLessons || 0} lessons
      </span>
      <span className="stat">
        <span className="stat-icon">📊</span>
        {course.level || 'Beginner'}
      </span>
    </div>
  );

  return (
    <div 
      className={`course-card ${variant} ${actualTheme} ${isDarkMode() ? 'dark-mode' : 'light-mode'}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="course-thumbnail">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">
            <div className="loading-spinner"></div>
          </div>
        )}
        {imageError ? (
          <div className="image-fallback">
            <span>📚</span>
            <p>Course Image</p>
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
            By {course.instructor?.name || 'Unknown Instructor'}
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
          <span className="completion-icon">🏆</span>
          <span>Completed</span>
        </div>
      )}
      
      {course.certificateEligible && variant === 'enrolled' && (
        <div className="certificate-eligible">
          <span className="certificate-icon">📜</span>
          <span>Certificate Available</span>
        </div>
      )}
    </div>
  );
};

export default CourseCard;