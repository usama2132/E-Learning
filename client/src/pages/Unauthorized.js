import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <div className="unauthorized-page">
      <div className="container">
        <div className="unauthorized-content">
          <div className="error-icon">
            <svg 
              width="120" 
              height="120" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="#ef4444" 
                strokeWidth="2" 
                fill="none"
              />
              <path 
                d="M15 9l-6 6M9 9l6 6" 
                stroke="#ef4444" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="error-content">
            <h1 className="error-title">Access Denied</h1>
            <h2 className="error-subtitle">401 - Unauthorized</h2>
            
            <div className="error-message">
              <p>
                Sorry, you don't have permission to access this page. 
                This could be because:
              </p>
              <ul className="error-reasons">
                <li>You're not logged in to your account</li>
                <li>Your session has expired</li>
                <li>You don't have the required permissions for this resource</li>
                <li>Your account status doesn't allow access to this feature</li>
              </ul>
            </div>

            {user ? (
              <div className="user-info">
                <p className="current-user">
                  Currently logged in as: <strong>{user.name || user.email}</strong>
                </p>
                <p className="user-role">
                  Role: <span className="role-badge">{user.role || 'Student'}</span>
                </p>
              </div>
            ) : (
              <div className="guest-info">
                <p>You are not currently logged in.</p>
              </div>
            )}

            <div className="action-buttons">
              {!user ? (
                <>
                  <button 
                    onClick={handleLogin}
                    className="btn btn-primary"
                  >
                    Login to Your Account
                  </button>
                  <Link 
                    to="/register"
                    className="btn btn-secondary"
                  >
                    Create New Account
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-primary"
                  >
                    Switch Account
                  </button>
                  <Link 
                    to="/dashboard"
                    className="btn btn-secondary"
                  >
                    Go to Dashboard
                  </Link>
                </>
              )}
              
              <div className="navigation-buttons">
                <button 
                  onClick={handleGoBack}
                  className="btn btn-outline"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleGoHome}
                  className="btn btn-outline"
                >
                  Go Home
                </button>
              </div>
            </div>

            <div className="help-section">
              <h3>Need Help?</h3>
              <p>
                If you believe this is an error, please contact our support team:
              </p>
              <div className="contact-options">
                <Link to="/contact" className="contact-link">
                  📧 Contact Support
                </Link>
                <a href="mailto:support@learningplatform.com" className="contact-link">
                  ✉️ Email Us
                </a>
              </div>
            </div>

            <div className="additional-info">
              <details className="troubleshooting">
                <summary>Troubleshooting Tips</summary>
                <div className="troubleshooting-content">
                  <ul>
                    <li>
                      <strong>Clear your browser cache:</strong> Sometimes cached data can cause access issues
                    </li>
                    <li>
                      <strong>Check your internet connection:</strong> Ensure you have a stable connection
                    </li>
                    <li>
                      <strong>Try refreshing the page:</strong> Sometimes a simple refresh can resolve the issue
                    </li>
                    <li>
                      <strong>Verify your account status:</strong> Make sure your account is active and in good standing
                    </li>
                    <li>
                      <strong>Check for system maintenance:</strong> We may be performing scheduled maintenance
                    </li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="unauthorized-footer">
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/about">About Us</Link>
          </div>
          <div className="footer-text">
            <p>&copy; 2024 Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;