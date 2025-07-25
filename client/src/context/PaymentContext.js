import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { api } from '../utils/api';
import { loadStripe } from '../utils/stripe';

const PaymentContext = createContext();
const paymentAPI = api.payments; 
const initialState = {
  paymentMethods: [],
  transactions: [],
  currentTransaction: null,
  paymentIntent: null,
  clientSecret: null,
  isLoading: false,
  error: null,
  processingPayment: false,
  stripeInstance: null,
  wallet: {
    balance: 0,
    pendingEarnings: 0,
    totalEarnings: 0,
    withdrawableAmount: 0
  },
  subscriptions: [],
  refunds: []
};

const paymentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_PROCESSING':
      return {
        ...state,
        processingPayment: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        processingPayment: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_STRIPE_INSTANCE':
      return {
        ...state,
        stripeInstance: action.payload
      };
    case 'SET_PAYMENT_METHODS':
      return {
        ...state,
        paymentMethods: action.payload,
        isLoading: false,
        error: null
      };
    case 'ADD_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: [...state.paymentMethods, action.payload]
      };
    case 'REMOVE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter(
          method => method.id !== action.payload
        )
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        isLoading: false,
        error: null
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction._id === action.payload._id ? action.payload : transaction
        ),
        currentTransaction: state.currentTransaction?._id === action.payload._id 
          ? action.payload 
          : state.currentTransaction
      };
    case 'SET_CURRENT_TRANSACTION':
      return {
        ...state,
        currentTransaction: action.payload
      };
    case 'SET_PAYMENT_INTENT':
      return {
        ...state,
        paymentIntent: action.payload.paymentIntent,
        clientSecret: action.payload.clientSecret
      };
    case 'CLEAR_PAYMENT_INTENT':
      return {
        ...state,
        paymentIntent: null,
        clientSecret: null
      };
    case 'SET_WALLET':
      return {
        ...state,
        wallet: { ...state.wallet, ...action.payload }
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        wallet: {
          ...state.wallet,
          balance: action.payload
        }
      };
    case 'SET_SUBSCRIPTIONS':
      return {
        ...state,
        subscriptions: action.payload
      };
    case 'ADD_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: [...state.subscriptions, action.payload]
      };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(sub =>
          sub._id === action.payload._id ? action.payload : sub
        )
      };
    case 'CANCEL_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(sub =>
          sub._id === action.payload 
            ? { ...sub, status: 'cancelled', cancelledAt: new Date() }
            : sub
        )
      };
    case 'SET_REFUNDS':
      return {
        ...state,
        refunds: action.payload
      };
    case 'ADD_REFUND':
      return {
        ...state,
        refunds: [action.payload, ...state.refunds]
      };
    default:
      return state;
  }
};

export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  // Initialize Stripe
  const initializeStripe = useCallback(async () => {
    try {
      const stripe = await loadStripe();
      dispatch({ type: 'SET_STRIPE_INSTANCE', payload: stripe });
      return stripe;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize Stripe' });
      return null;
    }
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setProcessing = useCallback((processing) => {
    dispatch({ type: 'SET_PROCESSING', payload: processing });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Create payment intent for course purchase
  const createPaymentIntent = useCallback(async (courseId, paymentMethodId = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await paymentAPI.createPaymentIntent({
        courseId,
        paymentMethodId
      });
      
      if (response.success) {
        dispatch({
          type: 'SET_PAYMENT_INTENT',
          payload: {
            paymentIntent: response.paymentIntent,
            clientSecret: response.clientSecret
          }
        });
        return { success: true, clientSecret: response.clientSecret };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Confirm payment
  const confirmPayment = useCallback(async (paymentMethodId, billingDetails = {}) => {
    if (!state.stripeInstance || !state.clientSecret) {
      return { success: false, message: 'Payment not initialized' };
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    try {
      const { error, paymentIntent } = await state.stripeInstance.confirmCardPayment(
        state.clientSecret,
        {
          payment_method: paymentMethodId,
          billing_details: billingDetails
        }
      );

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, message: error.message };
      }

      if (paymentIntent.status === 'succeeded') {
        // Update backend about successful payment
        const response = await paymentAPI.confirmPayment(paymentIntent.id);
        if (response.success) {
          dispatch({ type: 'ADD_TRANSACTION', payload: response.transaction });
          dispatch({ type: 'CLEAR_PAYMENT_INTENT' });
          return { success: true, paymentIntent };
        }
      }

      return { success: true, paymentIntent };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.stripeInstance, state.clientSecret]);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await paymentAPI.getPaymentMethods();
      if (response.success) {
        dispatch({ type: 'SET_PAYMENT_METHODS', payload: response.paymentMethods });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Add payment method
  const addPaymentMethod = useCallback(async (paymentMethodData) => {
    try {
      const response = await paymentAPI.addPaymentMethod(paymentMethodData);
      if (response.success) {
        dispatch({ type: 'ADD_PAYMENT_METHOD', payload: response.paymentMethod });
        return { success: true, paymentMethod: response.paymentMethod };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId) => {
    try {
      const response = await paymentAPI.removePaymentMethod(paymentMethodId);
      if (response.success) {
        dispatch({ type: 'REMOVE_PAYMENT_METHOD', payload: paymentMethodId });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await paymentAPI.getTransactions();
      if (response.success) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: response.transactions });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Fetch wallet info
  const fetchWallet = useCallback(async () => {
    try {
      const response = await paymentAPI.getWallet();
      if (response.success) {
        dispatch({ type: 'SET_WALLET', payload: response.wallet });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Withdraw earnings
  const withdrawEarnings = useCallback(async (amount, bankAccountId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await paymentAPI.withdrawEarnings({ amount, bankAccountId });
      if (response.success) {
        dispatch({ type: 'UPDATE_BALANCE', payload: response.newBalance });
        dispatch({ type: 'ADD_TRANSACTION', payload: response.transaction });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Process refund
  const processRefund = useCallback(async (transactionId, amount, reason) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await paymentAPI.processRefund({
        transactionId,
        amount,
        reason
      });
      
      if (response.success) {
        dispatch({ type: 'ADD_REFUND', payload: response.refund });
        dispatch({ type: 'UPDATE_TRANSACTION', payload: response.transaction });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Create subscription
  const createSubscription = useCallback(async (planId, paymentMethodId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await paymentAPI.createSubscription({
        planId,
        paymentMethodId
      });
      
      if (response.success) {
        dispatch({ type: 'ADD_SUBSCRIPTION', payload: response.subscription });
        return { success: true, subscription: response.subscription };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async (subscriptionId) => {
    try {
      const response = await paymentAPI.cancelSubscription(subscriptionId);
      if (response.success) {
        dispatch({ type: 'CANCEL_SUBSCRIPTION', payload: subscriptionId });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Get transaction by ID
  const getTransaction = useCallback(async (transactionId) => {
    try {
      const response = await paymentAPI.getTransaction(transactionId);
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_TRANSACTION', payload: response.transaction });
        return response.transaction;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  }, []);

  const value = {
    ...state,
    initializeStripe,
    setLoading,
    setProcessing,
    setError,
    clearError,
    createPaymentIntent,
    confirmPayment,
    fetchPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    fetchTransactions,
    fetchWallet,
    withdrawEarnings,
    processRefund,
    createSubscription,
    cancelSubscription,
    getTransaction
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// ADD THIS LINE - export the PaymentContext
export { PaymentContext };

export default PaymentContext;