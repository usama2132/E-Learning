import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import '../styles/pages/ResetPassword.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, validateResetToken } = useAuth();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrors({ token: 'Invalid or missing reset token' });
        setIsValidating(false);
        return;
      }

      try {
        await validateResetToken(token);
        setIsValidToken(true);
      } catch (error) {
        setErrors({ 
          token: error.message || 'Invalid or expired reset token' 
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, validateResetToken]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await resetPassword(token, formData.password);
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful. Please log in with your new password.' }
        });
      }, 3000);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to reset password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (isValidating) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <Loading />
          <p>Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (errors.token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h1>Invalid Reset Link</h1>
            <p className="error-message">{errors.token}</p>
            <div className="error-actions">
              <Link to="/forgot-password">
                <Button variant="primary">Request New Reset Link</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Back to Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h1>Password Reset Successful!</h1>
            <p>
              Your password has been reset successfully. 
              You will be redirected to the login page in a few seconds.
            </p>
            <Link to="/login">
              <Button variant="primary">Go to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Set New Password</h1>
          <p>Please enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <div className="password-input-container">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={formData.password.length >= 8 ? 'valid' : ''}>
                  At least 8 characters
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'valid' : ''}>
                  One lowercase letter
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'valid' : ''}>
                  One uppercase letter
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'valid' : ''}>
                  One number
                </li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <div className="password-input-container">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            className="reset-password-button"
            disabled={isLoading}
          >
            {isLoading ? <Loading size="small" /> : 'Reset Password'}
          </Button>
        </form>

        <div className="reset-password-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="login-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;