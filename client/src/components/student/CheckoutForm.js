import React, { useState, useContext } from 'react';
import { PaymentContext } from '../../context/PaymentContext';
import { useAuth } from '../../context/AuthContext'; // ✅
import usePayment from '../../hooks/usePayment'; // ✅
import Button from '../common/Button';
import Input from '../common/Input';
import Loading from '../common/Loading';
import { validators } from '../../utils/validators'; // ✅
import { validateField } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatters';
import '../../styles/dashboards/CheckoutForm.css';

const CheckoutForm = ({ course, onSuccess, onError }) => {
  const { user } = useContext(useAuth);
  const { processPayment, loading } = usePayment();
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
      country: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!validators(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateField('email', formData.email)) {
  newErrors.email = 'Please enter a valid email';
}
    
    if (!validators(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!validators(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!validators(formData.cardNumber)) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!validators(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter date in MM/YY format';
    }
    
    if (!validators(formData.cvv)) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    // Billing address validation
   const requiredBillingFields = ['street', 'city', 'state', 'zipCode', 'country'];

requiredBillingFields.forEach(field => {
  const value = formData.billingAddress[field];
  if (!validateField(field, value)) {
    newErrors[`billing.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
  }
});
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setProcessing(true);
    
    try {
      const paymentData = {
        courseId: course._id,
        amount: course.price,
        currency: 'USD',
        paymentMethod: {
          card: {
            number: formData.cardNumber.replace(/\s/g, ''),
            exp_month: formData.expiryDate.split('/')[0],
            exp_year: `20${formData.expiryDate.split('/')[1]}`,
            cvc: formData.cvv
          },
          billing_details: {
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            address: formData.billingAddress
          }
        }
      };
      
      const result = await processPayment(paymentData);
      
      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.error);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
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
    return <Loading message="Initializing checkout..." />;
  }

  return (
    <div className="checkout-form">
      <div className="checkout-header">
        <h2>Complete Your Purchase</h2>
        <div className="course-summary">
          <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
          <div className="course-details">
            <h3>{course.title}</h3>
            <p className="instructor">By {course.instructor.name}</p>
            <p className="price">{formatCurrency(course.price)}</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />
          </div>
          <div className="form-row">
            <Input
              type="text"
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              required
            />
            <Input
              type="text"
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Payment Information</h3>
          <div className="form-row">
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
            />
          </div>
          <div className="form-row">
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
            />
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
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Billing Address</h3>
          <div className="form-row">
            <Input
              type="text"
              name="billing.street"
              label="Street Address"
              value={formData.billingAddress.street}
              onChange={handleInputChange}
              error={errors['billing.street']}
              required
            />
          </div>
          <div className="form-row">
            <Input
              type="text"
              name="billing.city"
              label="City"
              value={formData.billingAddress.city}
              onChange={handleInputChange}
              error={errors['billing.city']}
              required
            />
            <Input
              type="text"
              name="billing.state"
              label="State"
              value={formData.billingAddress.state}
              onChange={handleInputChange}
              error={errors['billing.state']}
              required
            />
          </div>
          <div className="form-row">
            <Input
              type="text"
              name="billing.zipCode"
              label="ZIP Code"
              value={formData.billingAddress.zipCode}
              onChange={handleInputChange}
              error={errors['billing.zipCode']}
              required
            />
            <Input
              type="text"
              name="billing.country"
              label="Country"
              value={formData.billingAddress.country}
              onChange={handleInputChange}
              error={errors['billing.country']}
              required
            />
          </div>
        </div>
        
        <div className="checkout-footer">
          <div className="total">
            <strong>Total: {formatCurrency(course.price)}</strong>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={processing}
            loading={processing}
            fullWidth
          >
            {processing ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </div>
      </form>
      
      <div className="security-notice">
        <p>🔒 Your payment information is secure and encrypted</p>
      </div>
    </div>
  );
};

export default CheckoutForm;
