import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { validateEmail } from '../utils/validators';
import '../styles/pages/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      setErrors({});
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to send reset email. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    
    try {
      await forgotPassword(email);
      setErrors({});
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to resend email. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-card">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1>Check Your Email</h1>
            <p>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="instructions">
              Click the link in the email to reset your password. 
              The link will expire in 24 hours.
            </p>

            <div className="action-buttons">
              <Button
                onClick={handleResendEmail}
                loading={loading}
                variant="outline"
              >
                Resend Email
              </Button>
              
              <Link to="/login" className="back-to-login">
                Back to Login
              </Link>
            </div>

            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}

            <div className="help-text">
              <p>Didn't receive the email?</p>
              <ul>
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Try resending the email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1>Reset Your Password</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />

            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!email || loading}
              className="submit-btn"
            >
              Send Reset Link
            </Button>
          </form>

          <div className="forgot-password-footer">
            <p>
              Remember your password? 
              <Link to="/login" className="login-link">
                Back to Login
              </Link>
            </p>
            
            <p>
              Don't have an account? 
              <Link to="/register" className="register-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {loading && <Loading overlay />}
    </div>
  );
};

export default ForgotPassword;
