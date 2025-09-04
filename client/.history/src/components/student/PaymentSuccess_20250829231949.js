import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import '../../styles/dashboards/PaymentSuccess.css';

// Custom Button Component
const CustomButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  className = '',
  disabled = false,
  ...props 
}) => {
  const buttonClass = `custom-btn custom-btn-${variant} custom-btn-${size} ${className}`;
  
  return (
    <button 
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  
  const course = location.state?.course;
  const transactionId = location.state?.transactionId;

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Set enrollment details from location state or defaults
      setEnrollmentDetails({
        course: course || {
          title: 'Advanced React Development Masterclass',
          instructor: { name: 'John Smith' },
          price: 99.99,
          thumbnail: '/placeholder-course.png'
        },
        transactionId: transactionId || 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        enrollmentDate: new Date(),
        accessInfo: {
          lifetimeAccess: true,
          certificateEligible: true,
          downloadableResources: true,
          mobileAccess: true
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [course, transactionId]);

  const handleStartLearning = () => {
    if (course && course._id) {
      navigate(`/student/course/${course._id}/progress`);
    } else {
      navigate('/student/learning');
    }
  };

  const handleViewAllCourses = () => {
    navigate('/student/learning');
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    const receiptData = {
      transactionId: enrollmentDetails.transactionId,
      course: enrollmentDetails.course.title,
      amount: enrollmentDetails.course.price,
      date: enrollmentDetails.enrollmentDate.toLocaleDateString()
    };
    
    // Simulate PDF generation
    console.log('Generating PDF receipt:', receiptData);
    
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'receipt-notification';
    notification.textContent = '📄 Receipt downloaded successfully!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="payment-success-container loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Processing your enrollment...</p>
          <div className="loading-progress">
            <div className="loading-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!enrollmentDetails) {
    return (
      <div className="payment-success-container error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Payment Information Missing</h2>
          <p className="error-message">We couldn't find your payment details.</p>
          <CustomButton onClick={() => navigate('/courses')} variant="primary">
            Browse Courses
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      {/* Theme Toggle Button */}
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {isDarkMode() ? '☀️' : '🌙'}
      </button>

      <div className="payment-success-content">
        <div className="success-wrapper">
          
          {/* Success Header */}
          <div className="success-header">
            <div className="success-icon-wrapper">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="success-ripple"></div>
            </div>
            <h1 className="success-title">Payment Successful! 🎉</h1>
            <p className="success-subtitle">
              Congratulations! You're now enrolled in the course and ready to start your learning journey.
            </p>
          </div>

          {/* Course Information Card */}
          <div className="info-card course-card">
            <div className="course-info">
              <div className="course-thumbnail">
                <img
                  src={enrollmentDetails.course.thumbnail?.url || enrollmentDetails.course.thumbnail}
                  alt={enrollmentDetails.course.title}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTI1IDEwMEgxMTJWMTI1SDg4VjEwMEg3NUwxMDAgNzVaIiBmaWxsPSIjOUM5Qzk3Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUM5Qzk3IiBmb250LXNpemU9IjE0cHgiPkNvdXJzZSBJbWFnZTwvdGV4dD4KPC9zdmc+';
                  }}
                />
                <div className="course-badge">NEW</div>
              </div>
              <div className="course-details">
                <h3 className="course-title">{enrollmentDetails.course.title}</h3>
                <p className="course-instructor">
                  By {enrollmentDetails.course.instructor?.name || 'Unknown Instructor'}
                </p>
                <div className="course-meta">
                  <span className="meta-item">
                    <span className="meta-icon">💰</span>
                    <span>{formatCurrency(enrollmentDetails.course.price || 0)}</span>
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span>{enrollmentDetails.enrollmentDate.toLocaleDateString()}</span>
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">⭐</span>
                    <span>4.9 Rating</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="info-card transaction-card">
            <h3 className="card-title">
              <span className="title-icon">📋</span>
              Transaction Details
            </h3>
            <div className="transaction-grid">
              <div className="transaction-item">
                <p className="item-label">Transaction ID</p>
                <p className="item-value">{enrollmentDetails.transactionId}</p>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(enrollmentDetails.transactionId)}>
                  📋
                </button>
              </div>
              <div className="transaction-item">
                <p className="item-label">Payment Date</p>
                <p className="item-value">
                  {enrollmentDetails.enrollmentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="transaction-item">
                <p className="item-label">Payment Method</p>
                <p className="item-value">
                  <span className="payment-method">
                    💳 Credit Card (**** 4242)
                  </span>
                </p>
              </div>
              <div className="transaction-item">
                <p className="item-label">Amount Paid</p>
                <p className="item-value amount">
                  {formatCurrency(enrollmentDetails.course.price || 0)}
                </p>
              </div>
            </div>
            
            <div className="transaction-footer">
              <CustomButton
                onClick={handleDownloadReceipt}
                variant="outline"
                size="small"
              >
                📄 Download Receipt
              </CustomButton>
            </div>
          </div>

          {/* Course Access Information */}
          <div className="info-card access-card">
            <h3 className="card-title">
              <span className="title-icon">🎁</span>
              What You Get
            </h3>
            <div className="access-features">
              {enrollmentDetails.accessInfo.lifetimeAccess && (
                <div className="feature-item">
                  <span className="feature-icon">♾️</span>
                  <span className="feature-text">Lifetime access to course content</span>
                </div>
              )}
              {enrollmentDetails.accessInfo.certificateEligible && (
                <div className="feature-item">
                  <span className="feature-icon">🏆</span>
                  <span className="feature-text">Certificate of completion</span>
                </div>
              )}
              {enrollmentDetails.accessInfo.downloadableResources && (
                <div className="feature-item">
                  <span className="feature-icon">📁</span>
                  <span className="feature-text">Downloadable resources & materials</span>
                </div>
              )}
              {enrollmentDetails.accessInfo.mobileAccess && (
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span className="feature-text">Mobile and desktop access</span>
                </div>
              )}
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span className="feature-text">30-day money-back guarantee</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span className="feature-text">Access to student community</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <CustomButton
              onClick={handleStartLearning}
              variant="primary"
              size="large"
              className="start-learning-btn"
            >
              🚀 Start Learning Now
            </CustomButton>
            <CustomButton
              onClick={handleViewAllCourses}
              variant="outline"
              size="large"
              className="view-courses-btn"
            >
              📚 View My Courses
            </CustomButton>
          </div>

          {/* Getting Started Tips */}
          <div className="info-card tips-card">
            <div className="tips-header">
              <span className="tips-icon">💡</span>
              <h4 className="tips-title">Getting Started Tips</h4>
            </div>
            <div className="tips-list">
              <div className="tip-item">
                <span className="tip-number">1</span>
                <span className="tip-text">Access your course anytime from the "My Learning" section</span>
              </div>
              <div className="tip-item">
                <span className="tip-number">2</span>
                <span className="tip-text">Take notes and bookmarks to track your progress</span>
              </div>
              <div className="tip-item">
                <span className="tip-number">3</span>
                <span className="tip-text">Complete all lessons to earn your certificate</span>
              </div>
              <div className="tip-item">
                <span className="tip-number">4</span>
                <span className="tip-text">Join course discussions to connect with other students</span>
              </div>
            </div>
          </div>

          {/* Support Information */}
          <div className="support-info">
            <p className="support-text">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@yourplatform.com" className="support-link">
                support@yourplatform.com
              </a>
            </p>
            <div className="social-links">
              <a href="#" className="social-link">📧</a>
              <a href="#" className="social-link">💬</a>
              <a href="#" className="social-link">📞</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;