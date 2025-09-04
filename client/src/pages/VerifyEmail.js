import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/pages/VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlMessage = searchParams.get('message');

    if (urlStatus && urlMessage) {
      setStatus(urlStatus);
      
      switch (urlMessage) {
        case 'verified':
          setMessage('Your email has been successfully verified! You can now sign in to your account.');
          break;
        case 'invalid_token':
          setMessage('The verification link is invalid or has expired. Please request a new verification email.');
          break;
        case 'server_error':
          setMessage('An error occurred during verification. Please try again later.');
          break;
        default:
          setMessage('Email verification status unknown.');
      }
    } else {
      setStatus('error');
      setMessage('Invalid verification request.');
    }
  }, [searchParams]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleResendVerification = () => {
    navigate('/resend-verification');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'loading';
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className={`status-icon ${getStatusClass()}`}>
          <span className="icon">{getStatusIcon()}</span>
        </div>
        
        <div className="content">
          <h1 className="title">
            {status === 'success' ? 'Email Verified!' : 'Verification Status'}
          </h1>
          
          <p className="message">{message}</p>
          
          <div className="actions">
            {status === 'success' && (
              <button 
                onClick={handleLoginRedirect}
                className="btn btn-primary"
              >
                Sign In Now
              </button>
            )}
            
            {status === 'error' && (
              <>
                <button 
                  onClick={handleResendVerification}
                  className="btn btn-primary"
                >
                  Resend Verification Email
                </button>
                <button 
                  onClick={handleLoginRedirect}
                  className="btn btn-secondary"
                >
                  Back to Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;