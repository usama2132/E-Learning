import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import '../../styles/dashboards/PurchaseButton.css';

const PurchaseButton = ({ 
  course, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  showPriceInButton = false
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, getToken } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!isAuthenticated || !user) {
        setLoadingEnrollment(false);
        return;
      }

      try {
        const token = getToken();
        if (!token) {
          setLoadingEnrollment(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/student/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const courses = data.data.recentEnrollments || [];
            setEnrolledCourses(courses);
          }
        }
      } catch (error) {
        console.log('Could not fetch enrolled courses:', error.message);
      } finally {
        setLoadingEnrollment(false);
      }
    };

    fetchEnrolledCourses();
  }, [isAuthenticated, user, getToken]);

  const isEnrolled = enrolledCourses.some(enrollment => 
    enrollment.course?._id === course._id || 
    enrollment.course === course._id ||
    enrollment._id === course._id
  );
  
  const isOwner = user && course.instructor && (
    user._id === course.instructor._id || 
    user._id === course.instructor ||
    user.id === course.instructor._id ||
    user.id === course.instructor
  );
  
  const isFree = course.price === 0;

  const handlePurchaseClick = async () => {
    setPurchaseError('');

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (isEnrolled) {
      navigate(`/student/course/${course._id}/progress`);
      return;
    }

    if (isOwner) {
      navigate(`/instructor/courses`);
      return;
    }

    setIsProcessing(true);

    try {
      if (isFree) {
        await enrollInFreeCourse(course._id);
        alert('Successfully enrolled in the course!');
        window.location.reload();
      } else {
        // Navigate directly to checkout without creating intent here
        navigate(`/checkout/${course._id}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError(error.message || 'Failed to process purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const enrollInFreeCourse = async (courseId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:5000/api/payments/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: courseId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Enrollment failed');
      }

      return result.data;
    } catch (error) {
      console.error('Free enrollment error:', error);
      throw error;
    }
  };

  const getButtonText = () => {
    if (loadingEnrollment) return 'Loading...';
    if (isOwner) return 'Manage Course';
    if (isEnrolled) return 'Continue Learning';
    if (isFree) return 'Enroll for Free';
    
    const baseText = 'Purchase Course';
    if (showPriceInButton && course.price) {
      return `${baseText} - ${formatCurrency(course.price)}`;
    }
    return baseText;
  };

  const getButtonVariant = () => {
    if (isOwner) return 'secondary';
    if (isEnrolled) return 'success';
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
          disabled={isProcessing || loadingEnrollment}
          className="purchase-button"
        >
          {isProcessing ? 'Processing...' : getButtonText()}
        </Button>

        {purchaseError && (
          <div className="purchase-error mt-3">
            <p className="error-message text-red-600 text-sm">{purchaseError}</p>
            <button 
              className="retry-button text-blue-600 text-sm underline mt-1"
              onClick={handlePurchaseClick}
            >
              Try Again
            </button>
          </div>
        )}

        {!isFree && !isEnrolled && !isOwner && (
          <div className="purchase-info mt-4">
            <div className="price-info text-center mb-3">
              <span className="price text-2xl font-bold text-gray-900">
                {formatCurrency(course.discountPrice && course.discountPrice < course.price ? course.discountPrice : course.price)}
              </span>
              {course.discountPrice && course.discountPrice < course.price && (
                <span className="original-price text-lg text-gray-500 line-through ml-2">
                  {formatCurrency(course.price)}
                </span>
              )}
            </div>
            
            <div className="purchase-features">
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Lifetime access</li>
                <li>✓ Certificate of completion</li>
                <li>✓ 30-day money-back guarantee</li>
                <li>✓ Mobile and desktop access</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {showLoginModal && (
        <Modal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Login Required"
          size="small"
        >
          <div className="login-modal-content">
            <p className="mb-4">Please log in to purchase this course.</p>
            <div className="modal-actions space-y-2">
              <Button
                onClick={() => {
                  navigate('/login', { 
                    state: { returnTo: `/courses/${course._id}` }
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
                    state: { returnTo: `/courses/${course._id}` }
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
      )}
    </>
  );
};

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
      
      <div className="premium-features mt-4">
        <button
          className="toggle-details text-blue-600 text-sm underline"
          onClick={() => setShowDetails(!showDetails)}
        >
          What's included? {showDetails ? '▲' : '▼'}
        </button>
        
        {showDetails && (
          <div className="feature-details mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="feature-grid grid grid-cols-2 gap-2 text-sm">
              <div className="feature flex items-center space-x-2">
                <span className="feature-icon">🎥</span>
                <span>{course.totalLessons || 0} video lessons</span>
              </div>
              <div className="feature flex items-center space-x-2">
                <span className="feature-icon">📄</span>
                <span>Downloadable resources</span>
              </div>
              <div className="feature flex items-center space-x-2">
                <span className="feature-icon">📱</span>
                <span>Mobile & desktop access</span>
              </div>
              <div className="feature flex items-center space-x-2">
                <span className="feature-icon">🏆</span>
                <span>Certificate of completion</span>
              </div>
              <div className="feature flex items-center space-x-2">
                <span className="feature-icon">💬</span>
                <span>Community access</span>
              </div>
              <div className="feature flex items-center space-x-2">
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