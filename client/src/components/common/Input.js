import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Search } from 'lucide-react';

// Enhanced Input Component with improved styling and password toggle
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  size = 'medium',
  variant = 'outlined',
  id,
  name,
  maxLength,
  minLength,
  min,
  max,
  step,
  pattern,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState(type);
  
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Handle password toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    setInputType(showPassword ? 'password' : 'text');
  };

  // Determine if we should show the password toggle
  const shouldShowPasswordToggle = showPasswordToggle && type === 'password';
  
  // Adjust icon position if password toggle is shown
  const effectiveIconPosition = shouldShowPasswordToggle && iconPosition === 'right' ? 'left' : iconPosition;
  const effectiveIcon = shouldShowPasswordToggle && iconPosition === 'right' ? icon : icon;

  const inputClasses = [
    'input',
    `input--${variant}`,
    `input--${size}`,
    fullWidth && 'input--full-width',
    error && 'input--error',
    disabled && 'input--disabled',
    effectiveIcon && `input--has-icon-${effectiveIconPosition}`,
    shouldShowPasswordToggle && 'input--has-icon-right',
    className
  ].filter(Boolean).join(' ');

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          autoFocus={autoFocus}
          readOnly={readOnly}
          rows={4}
          {...props}
        />
      );
    }

    return (
      <input
        ref={ref}
        type={shouldShowPasswordToggle ? inputType : type}
        id={inputId}
        name={name}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        readOnly={readOnly}
        {...props}
      />
    );
  };

  return (
    <div className="input-field">
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
          {required && <span className="input-field__required">*</span>}
        </label>
      )}
      
      <div className="input-field__wrapper">
        {effectiveIcon && effectiveIconPosition === 'left' && (
          <span className="input-field__icon input-field__icon--left">
            {effectiveIcon}
          </span>
        )}
        
        {renderInput()}
        
        {effectiveIcon && effectiveIconPosition === 'right' && !shouldShowPasswordToggle && (
          <span className="input-field__icon input-field__icon--right">
            {effectiveIcon}
          </span>
        )}
        
        {shouldShowPasswordToggle && (
          <span 
            className="input-field__icon input-field__icon--right"
            onClick={togglePasswordVisibility}
            style={{ cursor: 'pointer' }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="input-field__helper">
          {error ? (
            <span className="input-field__error">{error}</span>
          ) : (
            <span className="input-field__helper-text">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Demo Component to showcase the enhanced inputs
const InputDemo = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    search: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Form submitted successfully!');
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#1f2937', 
            marginBottom: '10px',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            Create Your Account
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Join thousands of learners advancing their skills
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={errors.firstName}
              required
              icon={<User size={18} />}
              iconPosition="left"
              variant="outlined"
              size="medium"
            />
            
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              icon={<User size={18} />}
              iconPosition="left"
              variant="outlined"
              size="medium"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            required
            icon={<Mail size={18} />}
            iconPosition="left"
            variant="outlined"
            size="medium"
            fullWidth
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
            icon={<Lock size={18} />}
            iconPosition="left"
            showPasswordToggle={true}
            variant="outlined"
            size="medium"
            fullWidth
            helperText="Must be at least 6 characters long"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
            required
            icon={<Lock size={18} />}
            iconPosition="left"
            showPasswordToggle={true}
            variant="outlined"
            size="medium"
            fullWidth
          />

          <Input
            label="Search Interests"
            placeholder="What would you like to learn?"
            value={formData.search}
            onChange={handleInputChange('search')}
            icon={<Search size={18} />}
            iconPosition="left"
            variant="filled"
            size="medium"
            fullWidth
            helperText="Optional: Help us recommend courses for you"
          />

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '20px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            Create Account
          </button>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '20px' }}>Input Variations</h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <Input
              label="Small Input"
              placeholder="Small size input"
              size="small"
              variant="outlined"
            />
            
            <Input
              label="Large Input"
              placeholder="Large size input"
              size="large"
              variant="filled"
            />
            
            <Input
              label="Disabled Input"
              placeholder="This input is disabled"
              disabled
              value="Disabled value"
            />
            
            <Input
              label="Error State"
              placeholder="Input with error"
              error="This field has an error"
              value="Invalid input"
            />
            
            <Input
              label="Textarea Example"
              type="textarea"
              placeholder="Enter a longer message here..."
              helperText="This is a textarea input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Input;