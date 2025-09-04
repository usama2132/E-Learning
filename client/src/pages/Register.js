import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register, user, loading, error } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Handle auth error from context - FIXED: Convert object to string
  useEffect(() => {
    if (error) {
      let errorMessage = 'An error occurred';
      
      // Handle different error types
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = error.message || error.error || JSON.stringify(error);
      }
      
      setErrors({ submit: errorMessage });
    }
  }, [error]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing/changing
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
    setErrors({});
    
    try {
      // Send only the fields backend expects - ensure exact field names
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role
      };

      console.log('📤 Sending registration data:', userData);

      const result = await register(userData);
      
      if (result.success) {
        if (result.requiresVerification) {
          setRegistrationSuccess(true);
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // FIXED: Handle error message properly
        let errorMessage = 'Registration failed. Please try again.';
        
        if (result.message) {
          if (typeof result.message === 'string') {
            errorMessage = result.message;
          } else if (result.message && typeof result.message === 'object') {
            errorMessage = result.message.message || result.message.error || 'Registration failed';
          }
        }
        
        setErrors({
          submit: errorMessage
        });
      }
    } catch (error) {
      // FIXED: Handle caught error properly
      let errorMessage = 'Registration failed. Please try again.';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && error.message) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        errorMessage = error.error || 'Registration failed';
      }
      
      setErrors({
        submit: errorMessage
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

  if (loading) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-header">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-header">
            <div className="register-logo">
              EP
            </div>
            <h1 className="register-title">Check Your Email</h1>
            <p className="register-subtitle">
              We've sent a verification link to <strong>{formData.email}</strong>
            </p>
          </div>

          <div className="verification-message">
            <p>Please click the verification link in your email to activate your account.</p>
            <p>Didn't receive the email? Check your spam folder or contact support.</p>
          </div>

          <div className="register-footer">
            <p>
              <Link to="/login" className="login-link">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="register-logo">
            EP
          </div>
          <h1 className="register-title">Create Your Account</h1>
          <p className="register-subtitle">Join thousands of learners advancing their skills</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {errors.submit && (
            <div className="error-message">
              {/* FIXED: Ensure we always render a string */}
              {typeof errors.submit === 'string' ? errors.submit : 'An error occurred during registration'}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                required
                autoComplete="given-name"
                disabled={isLoading || loading}
              />
              {errors.firstName && (
                <div className="field-error">{errors.firstName}</div>
              )}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                required
                autoComplete="family-name"
                disabled={isLoading || loading}
              />
              {errors.lastName && (
                <div className="field-error">{errors.lastName}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              required
              autoComplete="email"
              disabled={isLoading || loading}
            />
            {errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              required
              autoComplete="username"
              disabled={isLoading || loading}
            />
            {errors.username && (
              <div className="field-error">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <div className="role-selection">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleInputChange}
                  disabled={isLoading || loading}
                />
                <span>Learn and grow your skills</span>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="instructor"
                  checked={formData.role === 'instructor'}
                  onChange={handleInputChange}
                  disabled={isLoading || loading}
                />
                <span>Teach and share knowledge</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                required
                autoComplete="new-password"
                disabled={isLoading || loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading || loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                required
                autoComplete="new-password"
                disabled={isLoading || loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading || loading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>

          <div className="terms-checkbox">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              disabled={isLoading || loading}
            />
            <span>
              I agree to the{' '}
              <Link to="/terms-of-service" className="terms-link" target="_blank">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy-policy" className="terms-link" target="_blank">Privacy Policy</Link>
            </span>
          </div>
          {errors.agreeToTerms && (
            <div className="field-error">{errors.agreeToTerms}</div>
          )}

          <div className="terms-checkbox">
            <input
              type="checkbox"
              name="subscribeNewsletter"
              checked={formData.subscribeNewsletter}
              onChange={handleInputChange}
              disabled={isLoading || loading}
            />
            <span>Subscribe to our newsletter for course updates and learning tips</span>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isLoading || loading}
          >
            {(isLoading || loading) && <span className="loading-spinner"></span>}
            {(isLoading || loading) ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-divider">
          or sign up with
        </div>

        <div className="social-register">
          <button 
            className="social-button google" 
            disabled={isLoading || loading}
            onClick={() => console.log('Google signup not implemented')}
          >
            Google
          </button>
          <button 
            className="social-button facebook" 
            disabled={isLoading || loading}
            onClick={() => console.log('Facebook signup not implemented')}
          >
            Facebook
          </button>
        </div>

        <div className="register-footer">
          <p>
            Already have an account?
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;