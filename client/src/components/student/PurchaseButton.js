import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import usePayment from '../../hooks/usePayment';
import Button from '../common/Button';
import Modal from '../common/Modal';
import '../../styles/dashboards/PurchaseButton.css';

const PurchaseButton = ({ 
  course, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  showPriceInButton = false
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createCheckoutSession, isProcessing } = usePayment();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  const isEnrolled = user?.enrolledCourses?.includes(course.id);
  const isOwner = user?.id === course.instructorId;
  const isFree = course.price === 0;

  const handlePurchaseClick = async () => {
    setPurchaseError('');

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Check if user already owns the course
    if (isEnrolled) {
      navigate(`/course-progress/${course.id}`);
      return;
    }

    // Check if user is the instructor
    if (isOwner) {
      navigate(`/instructor/courses/${course.id}`);
      return;
    }

    try {
      if (isFree) {
        // Handle free course enrollment
        await enrollInFreeCourse(course.id);
        navigate(`/course-progress/${course.id}`);
      } else {
        // Redirect to checkout for paid courses
        navigate(`/checkout/${course.id}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError(error.message || 'Failed to process purchase');
    }
  };

  const enrollInFreeCourse = async (courseId) => {
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleQuickPurchase = async () => {
    setPurchaseError('');

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      const session = await createCheckoutSession(course.id);
      window.location.href = session.url;
    } catch (error) {
      console.error('Quick purchase error:', error);
      setPurchaseError(error.message || 'Failed to start checkout');
    }
  };

  const getButtonText = () => {
    if (isOwner) return 'Manage Course';
    if (isEnrolled) return 'Continue Learning';
    if (isFree) return 'Enroll for Free';
    
    const baseText = 'Purchase Course';
    if (showPriceInButton) {
      return `${baseText} - $${course.price}`;
    }
    return baseText;
  };

  const getButtonVariant = () => {
    if (isOwner) return 'secondary';
    if (isEnrolled) return 'primary';
    if (isFree) return 'success';
    return variant;
  };

  return (
    <>
      <div className={`purchase-button-container ${className}`}>
        <Button
          onClick={handlePurchaseClick}
          variant={getButtonVariant()}
          size={size}
          fullWidth={fullWidth}
          disabled={isProcessing}
          className="purchase-button"
        >
          {isProcessing ? 'Processing...' : getButtonText()}
        </Button>

        {!isFree && !isEnrolled && !isOwner && (
          <div className="purchase-options">
            <button
              className="quick-purchase-link"
              onClick={handleQuickPurchase}
              disabled={isProcessing}
            >
              Quick Purchase (1-click)
            </button>
          </div>
        )}

        {purchaseError && (
          <div className="purchase-error">
            <p className="error-message">{purchaseError}</p>
            <button 
              className="retry-button"
              onClick={handlePurchaseClick}
            >
              Try Again
            </button>
          </div>
        )}

        {!isFree && (
          <div className="purchase-info">
            <div className="price-info">
              <span className="price">${course.price}</span>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="original-price">${course.originalPrice}</span>
              )}
            </div>
            
            <div className="purchase-features">
              <ul>
                <li>✓ Lifetime access</li>
                <li>✓ Certificate of completion</li>
                <li>✓ 30-day money-back guarantee</li>
                <li>✓ Mobile and desktop access</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
        size="small"
      >
        <div className="login-modal-content">
          <p>Please log in to purchase this course.</p>
          <div className="modal-actions">
            <Button
              onClick={() => {
                navigate('/login', { 
                  state: { returnTo: `/courses/${course.id}` }
                });
              }}
              variant="primary"
              fullWidth
            >
              Login
            </Button>
            <Button
              onClick={() => {
                navigate('/register', { 
                  state: { returnTo: `/courses/${course.id}` }
                });
              }}
              variant="secondary"
              fullWidth
            >
              Create Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Compact version for course cards
export const CompactPurchaseButton = ({ course }) => {
  return (
    <PurchaseButton
      course={course}
      size="small"
      fullWidth
      showPriceInButton
      className="compact-purchase"
    />
  );
};

// Premium version with additional features
export const PremiumPurchaseButton = ({ course }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="premium-purchase-button">
      <PurchaseButton
        course={course}
        variant="primary"
        size="large"
        fullWidth
      />
      
      <div className="premium-features">
        <button
          className="toggle-details"
          onClick={() => setShowDetails(!showDetails)}
        >
          What's included? {showDetails ? '▲' : '▼'}
        </button>
        
        {showDetails && (
          <div className="feature-details">
            <div className="feature-grid">
              <div className="feature">
                <span className="feature-icon">🎥</span>
                <span>{course.lessons?.length || 0} video lessons</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📄</span>
                <span>Downloadable resources</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📱</span>
                <span>Mobile & desktop access</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🏆</span>
                <span>Certificate of completion</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💬</span>
                <span>Community access</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔄</span>
                <span>Lifetime updates</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseButton;
