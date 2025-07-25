import { useState, useCallback, useContext } from 'react';
import { PaymentContext } from '../context/PaymentContext';

const usePayment = () => {
  const {
    paymentHistory,
    setPaymentHistory,
    loading,
    setLoading,
    error,
    setError
  } = useContext(PaymentContext);
  
  const [processingPayment, setProcessingPayment] = useState(false);

  // Create payment intent for Stripe
  const createPaymentIntent = useCallback(async (amount, currency = 'usd', metadata = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Process course purchase
  const purchaseCourse = useCallback(async (courseId, paymentMethodId) => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments/purchase-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId,
          paymentMethodId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }

      const data = await response.json();
      
      // Add to payment history
      setPaymentHistory(prev => [data.payment, ...prev]);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessingPayment(false);
    }
  }, [setPaymentHistory, setError]);

  // Confirm payment
  const confirmPayment = useCallback(async (paymentIntentId) => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentIntentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment confirmation failed');
      }

      const data = await response.json();
      
      // Update payment history if payment is confirmed
      if (data.payment) {
        setPaymentHistory(prev => {
          const existingIndex = prev.findIndex(p => p.paymentIntentId === paymentIntentId);
          if (existingIndex >= 0) {
            // Update existing payment
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...data.payment };
            return updated;
          } else {
            // Add new payment
            return [data.payment, ...prev];
          }
        });
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessingPayment(false);
    }
  }, [setPaymentHistory, setError]);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/payments/history?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const data = await response.json();
      
      if (page === 1) {
        setPaymentHistory(data.payments);
      } else {
        setPaymentHistory(prev => [...prev, ...data.payments]);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPaymentHistory]);

  // Get payment details
  const getPaymentDetails = useCallback(async (paymentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }

      const data = await response.json();
      return data.payment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Request refund
  const requestRefund = useCallback(async (paymentId, reason = '') => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentId,
          reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Refund request failed');
      }

      const data = await response.json();
      
      // Update payment history
      setPaymentHistory(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: 'refund_requested', refund: data.refund }
            : payment
        )
      );
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessingPayment(false);
    }
  }, [setPaymentHistory, setError]);

  // Validate payment method
  const validatePaymentMethod = useCallback(async (paymentMethodId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments/validate-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentMethodId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment method validation failed');
      }

      const data = await response.json();
      return data.isValid;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Calculate taxes and fees
  const calculatePaymentAmount = useCallback(async (courseId, country = 'US') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId,
          country
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate payment amount');
      }

      const data = await response.json();
      return {
        subtotal: data.subtotal,
        tax: data.tax,
        fees: data.fees,
        total: data.total,
        currency: data.currency
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Clear payment errors
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Check if user has purchased a course
  const hasPurchasedCourse = useCallback((courseId) => {
    return paymentHistory.some(
      payment => payment.courseId === courseId && 
      payment.status === 'succeeded'
    );
  }, [paymentHistory]);

  return {
    // State
    paymentHistory,
    loading,
    error,
    processingPayment,
    
    // Actions
    createPaymentIntent,
    purchaseCourse,
    confirmPayment,
    fetchPaymentHistory,
    getPaymentDetails,
    requestRefund,
    validatePaymentMethod,
    calculatePaymentAmount,
    clearError,
    
    // Helpers
    hasPurchasedCourse
  };
};

export default usePayment;