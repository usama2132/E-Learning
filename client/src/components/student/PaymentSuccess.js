import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import usePayment from '../../hooks/usePayment';
import '../../styles/dashboards/PaymentSuccess.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { confirmPayment } = usePayment();
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const sessionId = urlParams.get('session_id');
        const courseId = urlParams.get('courseId');

        if (!sessionId) {
          setError('Invalid payment session');
          setLoading(false);
          return;
        }

        // Confirm payment with backend
        const result = await confirmPayment(sessionId);
        setTransactionDetails(result.transaction);
        setCourseDetails(result.course);
        setLoading(false);

        // Send confirmation email (handled by backend)
        // Analytics tracking
        if (window.gtag) {
          window.gtag('event', 'purchase', {
            transaction_id: result.transaction.id,
            value: result.transaction.amount,
            currency: result.transaction.currency,
            items: [{
              item_id: result.course.id,
              item_name: result.course.title,
              category: 'Course',
              price: result.transaction.amount
            }]
          });
        }

      } catch (error) {
        console.error('Error confirming payment:', error);
        setError('Failed to confirm payment. Please contact support.');
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [location, confirmPayment]);

  const getSuccessIcon = () => {
    return (
      <div className="success-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
          <path d="m9 12 2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  };

  const handleStartLearning = () => {
    if (courseDetails) {
      navigate(`/course-progress/${courseDetails.id}`);
    }
  };

  if (loading) {
    return (
      <div className="payment-success loading">
        <div className="spinner"></div>
        <p>Confirming your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success error">
        <h1>Payment Confirmation Error</h1>
        <p>{error}</p>
        <Link to="/contact" className="btn btn-primary">
          Contact Support
        </Link>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="payment-success-container">
        <div className="payment-success-content">
          {getSuccessIcon()}
          
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Congratulations! You have successfully enrolled in the course.
          </p>
          
          {courseDetails && (
            <div className="course-summary">
              <div className="course-card">
                <img src={courseDetails.thumbnail} alt={courseDetails.title} />
                <div className="course-info">
                  <h3>{courseDetails.title}</h3>
                  <p className="instructor">By {courseDetails.instructor?.name}</p>
                  <div className="course-stats">
                    <span>{courseDetails.lessons?.length} lessons</span>
                    <span>{courseDetails.duration} hours</span>
                    <span>{courseDetails.level}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {transactionDetails && (
            <div className="transaction-details">
              <h3>Transaction Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Transaction ID:</label>
                  <span>{transactionDetails.id}</span>
                </div>
                <div className="detail-item">
                  <label>Amount:</label>
                  <span>${transactionDetails.amount}</span>
                </div>
                <div className="detail-item">
                  <label>Date:</label>
                  <span>{new Date(transactionDetails.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Payment Method:</label>
                  <span>{transactionDetails.paymentMethod}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="success-actions">
            <button 
              className="btn btn-primary start-learning-btn"
              onClick={handleStartLearning}
            >
              Start Learning Now
            </button>
            
            <Link to="/my-learning" className="btn btn-secondary">
              Go to My Learning
            </Link>
            
            <Link to="/courses" className="btn btn-outline">
              Browse More Courses
            </Link>
          </div>
          
          <div className="next-steps">
            <h3>What's Next?</h3>
            <div className="steps-grid">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Start Learning</h4>
                  <p>Begin your course immediately and learn at your own pace</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Track Progress</h4>
                  <p>Monitor your learning progress and complete assignments</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Get Certificate</h4>
                  <p>Earn your certificate upon successful course completion</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="receipt-section">
            <h4>Receipt & Support</h4>
            <p>A confirmation email has been sent to {user?.email}</p>
            <div className="receipt-options">
              <button className="receipt-link" onClick={() => window.print()}>
                Print Receipt
              </button>
              <Link to="/profile/orders" className="receipt-link">
                View Order History
              </Link>
              <Link to="/contact" className="receipt-link">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
        
        <div className="success-sidebar">
          <div className="learning-tips">
            <h3>Learning Tips</h3>
            <ul>
              <li>Set a regular study schedule</li>
              <li>Take notes while watching videos</li>
              <li>Practice what you learn</li>
              <li>Join the course community</li>
              <li>Don't hesitate to ask questions</li>
            </ul>
          </div>
          
          <div className="support-info">
            <h4>Need Help?</h4>
            <p>Our support team is here to help you succeed in your learning journey.</p>
            <Link to="/help" className="support-link">
              Visit Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
