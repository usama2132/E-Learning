import React, { useState } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { validateCard, validateExpiry, validateCVC } from '../../utils/validators';
import '../styles/components/PaymentForm.css';
import '../../styles/components/PaymentForm.css';

const PaymentForm = ({ 
  amount, 
  courseId, 
  courseName,
  onSuccess, 
  onError,
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { processPayment } = usePayment();

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

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: formattedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Card number validation
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCard(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!validateExpiry(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid or expired date';
    }

    // CVC validation
    if (!formData.cvc) {
      newErrors.cvc = 'CVC is required';
    } else if (!validateCVC(formData.cvc)) {
      newErrors.cvc = 'Invalid CVC';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // Billing address validation
    if (!formData.billingAddress.street.trim()) {
      newErrors['billingAddress.street'] = 'Street address is required';
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors['billingAddress.city'] = 'City is required';
    }
    if (!formData.billingAddress.state.trim()) {
      newErrors['billingAddress.state'] = 'State is required';
    }
    if (!formData.billingAddress.zipCode.trim()) {
      newErrors['billingAddress.zipCode'] = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData = {
        ...formData,
        amount,
        courseId,
        courseName,
        cardNumber: formData.cardNumber.replace(/\s/g, '')
      };

      const result = await processPayment(paymentData);
      
      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.error || 'Payment failed');
      }
    } catch (error) {
      onError(error.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'discover';
    return 'unknown';
  };

  return (
    <div className="payment-form">
      <div className="payment-header">
        <h3>Payment Details</h3>
        <div className="order-summary">
          <p className="course-name">{courseName}</p>
          <p className="amount">${amount}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="payment-section">
          <h4>Card Information</h4>
          
          <div className="form-group">
            <label>Card Number</label>
            <div className={`input-with-icon ${errors.cardNumber ? 'error' : ''}`}>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              <div className={`card-icon ${getCardType(formData.cardNumber)}`}></div>
            </div>
            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                maxLength="5"
                className={errors.expiryDate ? 'error' : ''}
              />
              {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
            </div>

            <div className="form-group">
              <label>CVC</label>
              <input
                type="text"
                name="cvc"
                value={formData.cvc}
                onChange={handleInputChange}
                placeholder="123"
                maxLength="4"
                className={errors.cvc ? 'error' : ''}
              />
              {errors.cvc && <span className="error-message">{errors.cvc}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className={errors.cardholderName ? 'error' : ''}
            />
            {errors.cardholderName && <span className="error-message">{errors.cardholderName}</span>}
          </div>
        </div>

        <div className="payment-section">
          <h4>Billing Address</h4>
          
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="billingAddress.street"
              value={formData.billingAddress.street}
              onChange={handleInputChange}
              placeholder="123 Main Street"
              className={errors['billingAddress.street'] ? 'error' : ''}
            />
            {errors['billingAddress.street'] && (
              <span className="error-message">{errors['billingAddress.street']}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="billingAddress.city"
                value={formData.billingAddress.city}
                onChange={handleInputChange}
                placeholder="New York"
                className={errors['billingAddress.city'] ? 'error' : ''}
              />
              {errors['billingAddress.city'] && (
                <span className="error-message">{errors['billingAddress.city']}</span>
              )}
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="billingAddress.state"
                value={formData.billingAddress.state}
                onChange={handleInputChange}
                placeholder="NY"
                className={errors['billingAddress.state'] ? 'error' : ''}
              />
              {errors['billingAddress.state'] && (
                <span className="error-message">{errors['billingAddress.state']}</span>
              )}
            </div>

            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                name="billingAddress.zipCode"
                value={formData.billingAddress.zipCode}
                onChange={handleInputChange}
                placeholder="10001"
                className={errors['billingAddress.zipCode'] ? 'error' : ''}
              />
              {errors['billingAddress.zipCode'] && (
                <span className="error-message">{errors['billingAddress.zipCode']}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Country</label>
            <select
              name="billingAddress.country"
              value={formData.billingAddress.country}
              onChange={handleInputChange}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IN">India</option>
            </select>
          </div>
        </div>

        <div className="payment-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary payment-submit-btn"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="processing-spinner"></span>
                Processing...
              </>
            ) : (
              `Pay $${amount}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
