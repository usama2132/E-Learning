/**
 * Stripe payment utilities for the e-learning platform
 */


import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Payment methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer'
};

// Currency codes
export const CURRENCY_CODES = {
  USD: 'usd',
  EUR: 'eur',
  GBP: 'gbp',
  JPY: 'jpy',
  CAD: 'cad',
  AUD: 'aud',
  INR: 'inr',
  PKR: 'pkr'
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
  REQUIRES_ACTION: 'requires_action',
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method'
};

// Stripe utilities
export const stripeUtils = {
  // Get Stripe instance
  getStripe,

  // Create payment intent
  createPaymentIntent: async (amount, currency = CURRENCY_CODES.USD, metadata = {}) => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Confirm payment
  confirmPayment: async (stripe, clientSecret, paymentMethod, billing_details = {}) => {
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: paymentMethod,
          billing_details
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  // Handle payment with setup for future use
  confirmPaymentWithSetup: async (stripe, clientSecret, paymentMethod, customerId, billing_details = {}) => {
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: paymentMethod,
          billing_details
        },
        setup_future_usage: 'off_session'
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (error) {
      console.error('Error confirming payment with setup:', error);
      throw error;
    }
  },

  // Create subscription
  createSubscription: async (customerId, priceId, paymentMethodId = null) => {
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId,
          paymentMethodId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      return data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, updates) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }

      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Get payment methods for customer
  getPaymentMethods: async (customerId) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/payment-methods`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get payment methods');
      }

      return data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  },

  // Delete payment method
  deletePaymentMethod: async (paymentMethodId) => {
    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment method');
      }

      return data;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }
};

// Payment form validation
export const validatePaymentForm = (formData) => {
  const errors = {};

  // Validate card number (basic check)
  if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
    errors.cardNumber = 'Please enter a valid card number';
  }

  // Validate expiry date
  if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
    errors.expiryDate = 'Please enter expiry date in MM/YY format';
  } else {
    const [month, year] = formData.expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      errors.expiryDate = 'Invalid month';
    } else if (parseInt(year) < currentYear || 
               (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      errors.expiryDate = 'Card has expired';
    }
  }

  // Validate CVC
  if (!formData.cvc || formData.cvc.length < 3) {
    errors.cvc = 'Please enter a valid CVC';
  }

  // Validate billing details
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Please enter cardholder name';
  }

  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format card number with spaces
export const formatCardNumber = (value) => {
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

// Format expiry date
export const formatExpiryDate = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  
  return v;
};

// Get card type from number
export const getCardType = (number) => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3[0689]/,
    jcb: /^(?:2131|1800|35\d{3})\d{11}$/
  };

  const cleanNumber = number.replace(/\s/g, '');
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }
  
  return 'unknown';
};

// Calculate processing fees
export const calculateProcessingFee = (amount, currency = CURRENCY_CODES.USD) => {
  // Stripe standard rates (approximate)
  const rates = {
    [CURRENCY_CODES.USD]: { fixed: 0.30, percentage: 0.029 },
    [CURRENCY_CODES.EUR]: { fixed: 0.25, percentage: 0.014 },
    [CURRENCY_CODES.GBP]: { fixed: 0.20, percentage: 0.014 },
    [CURRENCY_CODES.CAD]: { fixed: 0.30, percentage: 0.029 },
    [CURRENCY_CODES.AUD]: { fixed: 0.30, percentage: 0.029 }
  };

  const rate = rates[currency] || rates[CURRENCY_CODES.USD];
  const fee = (amount * rate.percentage) + rate.fixed;
  
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

// Convert amount to display format
export const formatAmount = (amount, currency = CURRENCY_CODES.USD) => {
  const currencySymbols = {
    [CURRENCY_CODES.USD]: '$',
    [CURRENCY_CODES.EUR]: '€',
    [CURRENCY_CODES.GBP]: '£',
    [CURRENCY_CODES.JPY]: '¥',
    [CURRENCY_CODES.CAD]: 'C',
    [CURRENCY_CODES.AUD]: 'A',
    [CURRENCY_CODES.INR]: '₹',
    [CURRENCY_CODES.PKR]: 'Rs.'
  };

  const symbol = currencySymbols[currency] || currency.toUpperCase();
  const formattedAmount = (amount / 100).toFixed(2);
  
  return `${symbol}${formattedAmount}`;
};

// Handle Stripe errors
export const handleStripeError = (error) => {
  const errorMessages = {
    card_declined: 'Your card was declined. Please try a different payment method.',
    expired_card: 'Your card has expired. Please use a different card.',
    insufficient_funds: 'Your card has insufficient funds.',
    incorrect_cvc: 'Your card\'s security code is incorrect.',
    processing_error: 'An error occurred while processing your card.',
    rate_limit: 'Too many requests. Please try again later.',
    invalid_request_error: 'Invalid request. Please check your information.',
    api_error: 'A server error occurred. Please try again.',
    authentication_error: 'Authentication failed. Please try again.',
    connection_error: 'Network error. Please check your connection.'
  };

  return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
};



// Webhook event types
export const WEBHOOK_EVENTS = {
  PAYMENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_FAILED: 'payment_intent.payment_failed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.payment_succeeded',
  INVOICE_FAILED: 'invoice.payment_failed'
};

export { loadStripe };
