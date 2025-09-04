import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Loading from '../common/Loading';
import { formatCurrency } from '../../utils/formatters';
import '../../styles/dashboards/CheckoutForm.css';

const CheckoutForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const authContext = useAuth();
  const { isDarkMode } = useTheme();
  
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const getToken = authContext?.getToken || (() => null);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/checkout/${courseId}` } });
      return;
    }
  }, [isAuthenticated, navigate, courseId]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        const token = getToken();
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }

        const data = await response.json();
        if (data.success && data.data && data.data.course) {
          setCourse(data.data.course);
        } else {
          throw new Error('Course not found');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, getToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('billing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter date in MM/YY format';
    }
    
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    const requiredBillingFields = ['street', 'city', 'state', 'zipCode', 'country'];
    requiredBillingFields.forEach(field => {
      const value = formData.billingAddress[field];
      if (!value || !value.trim()) {
        newErrors[`billing.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setProcessing(true);
    setError('');

    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');

      // Step 1: Create payment intent with proper data structure
      const paymentData = {
        courseId: course._id,
        amount: course.price,
        currency: 'usd',
        userId: user._id,
        userEmail: formData.email,
        userName: `${formData.firstName} ${formData.lastName}`,
        billingDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: {
            line1: formData.billingAddress.street,
            city: formData.billingAddress.city,
            state: formData.billingAddress.state,
            postal_code: formData.billingAddress.zipCode,
            country: formData.billingAddress.country,
          },
        },
        paymentMethodDetails: {
          type: 'card',
          last4: formData.cardNumber.replace(/\s/g, '').slice(-4),
          brand: getCardBrand(formData.cardNumber),
        }
      };

      console.log('Creating payment intent with data:', paymentData);

      const intentResponse = await fetch('http://localhost:5000/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });

    const intentData = await intentResponse.json();
console.log('🔍 Full Response Structure:', JSON.stringify(intentData, null, 2));
console.log('🔍 intentData.data:', intentData.data);
console.log('🔍 intentData.message:', intentData.message);

// Add full debug logging here
console.log('💡 Debug Info:');
console.log('User:', user);
console.log('Course:', course);
console.log('FormData:', formData);
console.log('Payment Intent Data:', intentData);

      if (!intentResponse.ok || !intentData.success) {
        console.error('Intent creation failed:', intentData);
        throw new Error(intentData.message || 'Failed to create payment intent');
      }

      // Check if we have the required data
      if (!intentData.data) {
        throw new Error('Invalid payment intent response');
      }

     // ✅ Read IDs from intentData.message instead of intentData.data
// ✅ Read IDs from intentData.message instead of intentData.data
// ✅ Read IDs from intentData.data (correct structure now)
const transactionId = intentData?.data?.transactionId;
const paymentIntentId = intentData?.data?.paymentIntentId;

// Check if we have the required data
if (!transactionId || !paymentIntentId) {
  throw new Error('Invalid payment intent response - missing transaction or payment intent ID');
}

console.log('Payment intent created successfully with transaction ID:', transactionId);


      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: Confirm the payment
      const confirmData = {
  transactionId,
  paymentIntentId,
  courseId,
  paymentDetails: {
    amount: course.price,
    currency: 'usd',
    status: 'succeeded'
  }
};


      console.log('Confirming payment:', confirmData);

      const confirmResponse = await fetch('http://localhost:5000/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(confirmData)
      });

      const confirmResult = await confirmResponse.json();
      console.log('Payment confirmation response:', confirmResult);

      if (!confirmResponse.ok || !confirmResult.success) {
        console.error('Student Already Enrolled in this Course:', confirmResult);
        throw new Error(confirmResult.message || 'Payment confirmation failed');
      }

      console.log('Payment confirmed successfully');
      
      navigate('/payment/success', { 
        state: { 
          course,
          transactionId: confirmResult.data?.transaction?.transactionId || transactionId,
          enrollment: confirmResult.data?.enrollment
        }
      });
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setError(error.message || 'Payment processing failed. Please try again.');
      
      if (error.message.includes('declined') || error.message.includes('insufficient funds')) {
        navigate('/payment/failure', { 
          state: { 
            course,
            error: error.message
          }
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const getCardBrand = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'discover';
    return 'unknown';
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (loading) {
    return <Loading message="Loading checkout..." />;
  }

  if (error && !course) {
    return (
      <div className="checkout-page-wrapper">
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Checkout Error</h2>
            <p className="error-message">{error}</p>
            <Button onClick={() => navigate('/courses')} variant="primary" className="error-button">
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return <Loading message="Loading course details..." />;
  }

  return (
    <div className={`checkout-page-wrapper ${isDarkMode ? 'dark' : ''}`}>
      <div className="checkout-container">
        <div className="checkout-card">
          <div className="checkout-content">
            <div className="checkout-header">
              <div className="header-content">
                <div className="progress-indicator">
                  <div className="progress-step active">
                    <div className="step-number">1</div>
                    <span>Payment Details</span>
                  </div>
                  <div className="progress-line"></div>
                  <div className="progress-step">
                    <div className="step-number">2</div>
                    <span>Confirmation</span>
                  </div>
                </div>
                <h1 className="checkout-title">Complete Your Purchase</h1>
              </div>

              <div className="course-summary-card">
                <div className="course-image-container">
                  <img 
                    src={course.thumbnail?.url || course.thumbnail} 
                    alt={course.title} 
                    className="course-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-course.png';
                    }}
                  />
                  <div className="image-overlay">
                    <div className="play-icon">▶</div>
                  </div>
                </div>
                <div className="course-details">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-instructor">By {course.instructor?.name || 'Unknown'}</p>
                  <div className="course-meta">
                    <span className="course-rating">⭐ {course.rating || '4.5'}</span>
                    <span className="course-students">👥 {course.studentsEnrolled || '1,234'} students</span>
                  </div>
                  <div className="price-container">
                    <span className="current-price">{formatCurrency(course.price)}</span>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="original-price">{formatCurrency(course.originalPrice)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="error-alert">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <p className="alert-message">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">👤</div>
                  <h3 className="section-title">Contact Information</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <Input
                      type="email"
                      name="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      required
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      type="text"
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={errors.firstName}
                      required
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      type="text"
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={errors.lastName}
                      required
                      className="modern-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">💳</div>
                  <h3 className="section-title">Payment Information</h3>
                  <div className="card-icons">
                    <div className="card-icon visa">VISA</div>
                    <div className="card-icon mastercard">MC</div>
                    <div className="card-icon amex">AMEX</div>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <Input
                      type="text"
                      name="cardNumber"
                      label="Card Number"
                      value={formatCardNumber(formData.cardNumber)}
                      onChange={(e) => handleInputChange({
                        target: { name: 'cardNumber', value: e.target.value }
                      })}
                      error={errors.cardNumber}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      className="modern-input card-input"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      type="text"
                      name="expiryDate"
                      label="Expiry Date"
                      value={formatExpiryDate(formData.expiryDate)}
                      onChange={(e) => handleInputChange({
                        target: { name: 'expiryDate', value: e.target.value }
                      })}
                      error={errors.expiryDate}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      type="text"
                      name="cvv"
                      label="CVV"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      error={errors.cvv}
                      placeholder="123"
                      maxLength={4}
                      required
                      className="modern-input cvv-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">🏠</div>
                  <h3 className="section-title">Billing Address</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <Input
                      type="text"
                      name="billing.street"
                      label="Street Address"
                      value={formData.billingAddress.street}
                      onChange={handleInputChange}
                      error={errors['billing.street']}
                      required
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      type="text"
                      name="billing.city"
                      label="City"
                      value={formData.billingAddress.city}
                      onChange={handleInputChange}
                      error={errors['billing.city']}
                      required
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      type="text"
                      name="billing.state"
                      label="State"
                      value={formData.billingAddress.state}
                      onChange={handleInputChange}
                      error={errors['billing.state']}
                      required
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      type="text"
                      name="billing.zipCode"
                      label="ZIP Code"
                      value={formData.billingAddress.zipCode}
                      onChange={handleInputChange}
                      error={errors['billing.zipCode']}
                      required
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <select
                      name="billing.country"
                      value={formData.billingAddress.country}
                      onChange={handleInputChange}
                      className="modern-input"
                      required
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IN">India</option>
                      <option value="PK">Pakistan</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="checkout-footer">
                <div className="total-section">
                  <div className="total-breakdown">
                    <div className="breakdown-row">
                      <span>Course Price:</span>
                      <span>{formatCurrency(course.price)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Platform Fee:</span>
                      <span>$0.00</span>
                    </div>
                    <div className="breakdown-divider"></div>
                    <div className="breakdown-row total">
                      <span>Total:</span>
                      <span>{formatCurrency(course.price)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="payment-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={processing}
                    className={`payment-button ${processing ? 'processing' : ''}`}
                  >
                    {processing ? (
                      <span className="processing-content">
                        <div className="spinner"></div>
                        Processing Payment...
                      </span>
                    ) : (
                      <span className="payment-content">
                        <div className="payment-icon">🔒</div>
                        Pay {formatCurrency(course.price)}
                      </span>
                    )}
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${courseId}`)}
                    className="back-button"
                    disabled={processing}
                  >
                    ← Back to Course Details
                  </button>
                </div>
              </div>
            </form>
            
            <div className="security-section">
              <div className="security-notice">
                <div className="security-icon">🔐</div>
                <div className="security-content">
                  <h4>Secure Payment</h4>
                  <p>Your payment information is protected with 256-bit SSL encryption and industry-standard security measures.</p>
                </div>
              </div>
              
              <div className="guarantee-badges">
                <div className="badge">
                  <div className="badge-icon">💰</div>
                  <span>30-Day Money Back</span>
                </div>
                <div className="badge">
                  <div className="badge-icon">🎓</div>
                  <span>Lifetime Access</span>
                </div>
                <div className="badge">
                  <div className="badge-icon">📱</div>
                  <span>Mobile Friendly</span>
                </div>
                <div className="badge">
                  <div className="badge-icon">🏆</div>
                  <span>Certificate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;