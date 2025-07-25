import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import usePayment from '../../hooks/usePayment';
import '../../styles/dashboards/PaymentFailure.css';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { retryPayment } = usePayment();
  const [failureReason, setFailureReason] = useState('');
  const [courseDetails, setCourseDetails] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Extract failure reason and course details from URL params or state
    const urlParams = new URLSearchParams(location.search);
    const reason = urlParams.get('reason') || 'Payment processing failed';
    const courseId = urlParams.get('courseId');
    
    setFailureReason(reason);
    
    // Get course details from location state if available
    if (location.state?.courseDetails) {
      setCourseDetails(location.state.courseDetails);
    } else if (courseId) {
      // Fetch course details if not in state
      fetchCourseDetails(courseId);
    }
  }, [location]);

  const fetchCourseDetails = async (courseId) => {
    try {
      // This would typically fetch from your API
      const response = await fetch(`/api/courses/${courseId}`);
      const course = await response.json();
      setCourseDetails(course);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleRetryPayment = async () => {
    if (!courseDetails) return;
    
    setIsRetrying(true);
    try {
      await retryPayment(courseDetails.id);
      // Redirect to checkout or payment page
      navigate(`/checkout/${courseDetails.id}`);
    } catch (error) {
      console.error('Error retrying payment:', error);
      setIsRetrying(false);
    }
  };

  const getFailureIcon = () => {
    return (
      <div className="failure-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2"/>
        </svg>
      </div>
    );
  };

  const getFailureMessage = () => {
    switch (failureReason.toLowerCase()) {
      case 'insufficient_funds':
        return 'Your payment method has insufficient funds. Please try a different payment method.';
      case 'card_declined':
        return 'Your card was declined. Please check your card details or try a different payment method.';
      case 'expired_card':
        return 'Your card has expired. Please update your payment method.';
      case 'network_error':
        return 'There was a network error during payment processing. Please try again.';
      case 'authentication_failed':
        return 'Payment authentication failed. Please verify your payment details.';
      default:
        return 'We encountered an issue processing your payment. Please try again.';
    }
  };

  return (
    <div className="payment-failure">
      <div className="payment-failure-container">
        <div className="payment-failure-content">
          {getFailureIcon()}
          
          <h1>Payment Failed</h1>
          <p className="failure-message">{getFailureMessage()}</p>
          
          {courseDetails && (
            <div className="course-summary">
              <h3>Course Details:</h3>
              <div className="course-info">
                <img src={courseDetails.thumbnail} alt={courseDetails.title} />
                <div>
                  <h4>{courseDetails.title}</h4>
                  <p>By {courseDetails.instructor?.name}</p>
                  <p className="price">${courseDetails.price}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="failure-actions">
            {courseDetails && (
              <button 
                className="btn btn-primary retry-btn"
                onClick={handleRetryPayment}
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Retry Payment'}
              </button>
            )}
            
            <Link to="/courses" className="btn btn-secondary">
              Browse Other Courses
            </Link>
            
            <Link to="/profile" className="btn btn-outline">
              Update Payment Method
            </Link>
          </div>
          
          <div className="help-section">
            <h4>Need Help?</h4>
            <p>If you continue to experience issues, please contact our support team.</p>
            <div className="help-options">
              <Link to="/contact" className="help-link">
                Contact Support
              </Link>
              <a href="mailto:support@example.com" className="help-link">
                Email Us
              </a>
            </div>
          </div>
          
          <div className="failure-details">
            <details>
              <summary>Technical Details</summary>
              <div className="tech-details">
                <p><strong>Error Code:</strong> {failureReason}</p>
                <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                <p><strong>Reference ID:</strong> {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </details>
          </div>
        </div>
        
        <div className="payment-failure-tips">
          <h3>Common Solutions:</h3>
          <ul>
            <li>Check that your card details are correct</li>
            <li>Ensure your card has sufficient funds</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if the issue persists</li>
            <li>Clear your browser cache and try again</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
