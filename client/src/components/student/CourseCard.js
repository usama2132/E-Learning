import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDuration } from '../../utils/formatters';
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
  isInWishlist = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      onRemoveFromWishlist?.(course._id);
    } else {
      onAddToWishlist?.(course._id);
    }
  };

  const handleEnrollClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEnroll?.(course._id);
  };

  const renderRating = () => {
    const rating = course.averageRating || 0;
    const reviewCount = course.reviewCount || 0;
    
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
        {course.originalPrice && course.originalPrice > course.price && (
          <span className="original-price">{formatCurrency(course.originalPrice)}</span>
        )}
        <span className="current-price">{formatCurrency(course.price)}</span>
        {course.originalPrice && course.originalPrice > course.price && (
          <span className="discount">
            {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% off
          </span>
        )}
      </div>
    );
  };

  const renderActions = () => {
    switch (variant) {
      case 'enrolled':
        return (
          <div className="course-actions">
            <Link to={`/course/${course._id}/learn`}>
              <Button variant="primary" fullWidth>
                {userProgress?.completed ? 'Review Course' : 'Continue Learning'}
              </Button>
            </Link>
          </div>
        );
        
      case 'wishlist':
        return (
          <div className="course-actions">
            <Button
              variant="outline"
              onClick={handleWishlistClick}
              className="wishlist-btn"
            >
              Remove from Wishlist
            </Button>
            {!isEnrolled && (
              <Button variant="primary" onClick={handleEnrollClick}>
                {course.price === 0 ? 'Enroll Free' : 'Buy Now'}
              </Button>
            )}
          </div>
        );
        
      default: // catalog
        return (
          <div className="course-actions">
            <button
              className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
              onClick={handleWishlistClick}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <span className="heart-icon">
                {isInWishlist ? '❤️' : '🤍'}
              </span>
            </button>
            {isEnrolled ? (
              <Link to={`/course/${course._id}/learn`}>
                <Button variant="primary" size="small">
                  Go to Course
                </Button>
              </Link>
            ) : (
              <Button 
                variant="primary" 
                size="small"
                onClick={handleEnrollClick}
              >
                {course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
              </Button>
            )}
          </div>
        );
    }
  };

  const renderCourseStats = () => (
    <div className="course-stats">
      <span className="stat">
        <span className="stat-icon">👥</span>
        {course.enrolledCount || 0} students
      </span>
      <span className="stat">
        <span className="stat-icon">⏱️</span>
        {formatDuration(course.totalDuration)}
      </span>
      <span className="stat">
        <span className="stat-icon">📚</span>
        {course.lessons?.length || 0} lessons
      </span>
      <span className="stat">
        <span className="stat-icon">📊</span>
        {course.level || 'Beginner'}
      </span>
    </div>
  );

  return (
    <div className={`course-card ${variant}`}>
      <Link to={`/course/${course._id}`} className="course-link">
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
              src={course.thumbnail}
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
            <p className="course-instructor">By {course.instructor?.name || 'Unknown'}</p>
          </div>
          
          <p className="course-description">
            {course.shortDescription || course.description?.substring(0, 100) + '...'}
          </p>
          
          <div className="course-tags">
            {course.category && (
              <span className="category-tag">{course.category}</span>
            )}
            {course.tags?.slice(0, 2).map((tag, index) => (
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
      </Link>
      
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
