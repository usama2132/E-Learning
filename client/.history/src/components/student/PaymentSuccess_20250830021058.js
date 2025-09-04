import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useApiRequest } from '../../hooks/useApi';
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
  const { user, getToken } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { get } = useApiRequest();
  
  const [loading, setLoading] = useState(true);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [error, setError] = useState(null);
  
  // Get data from location state or URL params
  const course = location.state?.course;
  const transactionId = location.state?.transactionId;
  const courseId = location.state?.courseId || new URLSearchParams(location.search).get('courseId');
  const paymentIntentId = location.state?.paymentIntentId || new URLSearchParams(location.search).get('payment_intent');

  useEffect(() => {
    const processSuccessfulPayment = async () => {
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Processing payment success for user:', user.id);
        
        // If we have course data from state, use it directly
        if (course && course._id) {
          console.log('Using course data from location state');
          setEnrollmentDetails({
            course: course,
            transactionId: transactionId || `TXN_${Date.now()}`,
            enrollmentDate: new Date(),
            accessInfo: {
              lifetimeAccess: true,
              certificateEligible: true,
              downloadableResources: true,
              mobileAccess: true
            }
          });
        } else if (courseId) {
          // Fetch course details from backend
          console.log('Fetching course details for:', courseId);
          
          try {
            const courseResponse = await get(`/courses/${courseId}`);
            
            if (courseResponse.success && courseResponse.data) {
              console.log('Course details fetched successfully');
              
              setEnrollmentDetails({
                course: courseResponse.data.course,
                transactionId: transactionId || paymentIntentId || `TXN_${Date.now()}`,
                enrollmentDate: new Date(),
                accessInfo: {
                  lifetimeAccess: true,
                  certificateEligible: true,
                  downloadableResources: true,
                  mobileAccess: true
                }
              });
            } else {
              throw new Error('Course details not found');
            }
          } catch (courseError) {
            console.error('Error fetching course details:', courseError);
            
            // Fallback with minimal course info
            setEnrollmentDetails({
              course: {
                _id: courseId,
                title: 'Course Purchased Successfully',
                instructor: { name: 'Unknown Instructor' },
                price: 99.99,
                thumbnail: '/placeholder-course.png'
              },
              transactionId: transactionId || paymentIntentId || `TXN_${Date.now()}`,
              enrollmentDate: new Date(),
              accessInfo: {
                lifetimeAccess: true,
                certificateEligible: true,
                downloadableResources: true,
                mobileAccess: true
              }
            });
          }
        } else {
          // No course information available - redirect to my learning
          console.log('No course information available, redirecting to my learning');
          navigate('/student/learning');
          return;
        }

      } catch (error) {
        console.error('Error processing payment success:', error);
        setError('Unable to load course information');
        
        // Set fallback data
        setEnrollmentDetails({
          course: {
            title: 'Course Purchase Successful',
            instructor: { name: 'Unknown Instructor' },
            price: 99.99,
            thumbnail: '/placeholder-course.png'
          },
          transactionId: transactionId || `TXN_${Date.now()}`,
          enrollmentDate: new Date(),
          accessInfo: {
            lifetimeAccess: true,
            certificateEligible: true,
            downloadableResources: true,
            mobileAccess: true
          }
        });
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay for better UX
    const timer = setTimeout(() => {
      processSuccessfulPayment();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, course, courseId, transactionId, paymentIntentId, navigate, get]);

  const handleStartLearning = async () => {
    console.log('Start learning clicked');
    
    const targetCourseId = enrollmentDetails?.course?._id || courseId;
    
    if (targetCourseId) {
      try {
        // Check if user is enrolled by trying to fetch enrolled courses
        console.log('Checking enrollment status...');
        const enrolledResponse = await get('/student/courses');
        
        if (enrolledResponse.success && enrolledResponse.data) {
          const enrolledCourses = enrolledResponse.data.courses || [];
          const isEnrolled = enrolledCourses.some(c => c._id === targetCourseId || c.id === targetCourseId);
          
          if (isEnrolled) {
            // Navigate to course content
            navigate(`/student/course/${targetCourseId}/progress`);
          } else {
            // Redirect to course details to try enrollment
            navigate(`/courses/${targetCourseId}`);
          }
        } else {
          // Fallback: redirect to my learning page
          navigate('/student/learning');
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
        // Fallback navigation
        navigate('/student/learning');
      }
    } else {
      // No course ID available, go to my learning
      navigate('/student/learning');
    }
  };

  const handleViewAllCourses = () => {
    console.log('View my courses clicked');
    navigate('/student/learning');
  };

  const handleDownloadReceipt = () => {
    // Generate a simple receipt text file
    const receiptData = {
      transactionId: enrollmentDetails?.transactionId || 'Unknown',
      course: enrollmentDetails?.course?.title || 'Unknown Course',
      amount: enrollmentDetails?.course?.price || 0,
      date: enrollmentDetails?.enrollmentDate?.toLocaleDateString() || new Date().toLocaleDateString(),
      student: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || user?.email
    };
    
    const receiptText = `
COURSE PURCHASE RECEIPT
========================

Transaction ID: ${receiptData.transactionId}
Date: ${receiptData.date}
Student: ${receiptData.student}

Course Details:
- Title: ${receiptData.course}
- Amount: ${formatCurrency(receiptData.amount)}

Payment Status: Completed
Payment Method: Credit Card

Thank you for your purchase!
    `;
    
    // Create and download text file
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receiptData.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success message
    console.log('Receipt downloaded successfully');
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

  if (error && !enrollmentDetails) {
    return (
      <div className="payment-success-container error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Payment Successful</h2>
          <p className="error-message">{error}</p>
          <p className="error-subtitle">Your payment was processed successfully, but we encountered an issue loading course details.</p>
          <div className="error-actions">
            <CustomButton onClick={() => navigate('/student/learning')} variant="primary">
              View My Courses
            </CustomButton>
            <CustomButton onClick={() => navigate('/courses')} variant="outline">
              Browse Courses
            </CustomButton>
          </div>
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
          {enrollmentDetails && (
            <div className="info-card course-card">
              <div className="course-info">
                <div className="course-thumbnail">
                  <img
                    src={enrollmentDetails.course.thumbnail?.url || enrollmentDetails.course.thumbnail || '/placeholder-course.png'}
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
                    By {enrollmentDetails.course.instructor?.name || enrollmentDetails.course.instructor?.firstName || 'Unknown Instructor'}
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
          )}

          {/* Transaction Details */}
          {enrollmentDetails && (
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
          )}

          {/* Course Access Information */}
          {enrollmentDetails && (
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
          )}

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