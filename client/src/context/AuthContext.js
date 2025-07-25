import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../utils/api';
import { getStoredAuth, setStoredAuth, removeStoredAuth } from '../utils/storage';

const AuthContext = createContext();
const authAPI = api.auth;

// Enhanced initial state with additional status fields
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isVerifying: false,
  error: null,
  lastAuthAction: null
};

// Enhanced reducer with more action types
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        isVerifying: action.payload?.isVerifying || false,
        error: null,
        lastAuthAction: 'start'
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isVerifying: false,
        error: null,
        lastAuthAction: 'success'
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isVerifying: false,
        error: action.payload,
        lastAuthAction: 'failure'
      };
    case 'LOGOUT':
      return {
        ...state,
        ...initialState,
        isLoading: false,
        lastAuthAction: 'logout'
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        lastAuthAction: 'update'
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'VERIFYING_TOKEN':
      return {
        ...state,
        isVerifying: true,
        isLoading: true
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage with enhanced error handling
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: 'VERIFYING_TOKEN' });
        const storedAuth = getStoredAuth();
        
        if (storedAuth?.token) {
          console.log('Found stored auth token, verifying...');
          const response = await authAPI.verifyToken(storedAuth.token);
          
          if (response.success) {
            console.log('Token verification successful');
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: response.user,
                token: storedAuth.token
              }
            });
          } else {
            console.warn('Token verification failed', response.message);
            removeStoredAuth();
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          console.log('No stored auth token found');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        removeStoredAuth();
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: 'Session initialization failed' 
        });
      }
    };

    initAuth();
  }, []);

  // Enhanced login function with better debugging
  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      console.log('Attempting login with email:', email);
      const response = await authAPI.login({ email, password });
      console.log('Login API response:', response);

      if (response.success) {
        const authData = {
          user: response.user,
          token: response.token
        };
        setStoredAuth(authData);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: authData
        });
        console.log('Login successful for user:', response.user.email);
        return { success: true, user: response.user };
      } else {
        console.warn('Login failed:', response.message);
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message || 'Login failed'
        });
        return { 
          success: false, 
          message: response.message,
          code: response.code 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'An error occurred during login';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      return { 
        success: false, 
        message: errorMessage,
        isNetworkError: !error.response 
      };
    }
  };

  // Enhanced register function
  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        const authData = {
          user: response.user,
          token: response.token
        };
        setStoredAuth(authData);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: authData
        });
        return { success: true, requiresVerification: response.requiresVerification };
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message || 'Registration failed'
        });
        return { 
          success: false, 
          message: response.message,
          errors: response.errors 
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during registration';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      return { 
        success: false, 
        message: errorMessage,
        isNetworkError: !error.response 
      };
    }
  };

  // Enhanced logout with callback support
  const logout = (options = {}) => {
    console.log('Logging out user');
    if (options.silent !== true) {
      // Perform any cleanup or API calls here if needed
    }
    removeStoredAuth();
    dispatch({ type: 'LOGOUT' });
  };

  // Enhanced updateUser with validation
  const updateUser = (userData) => {
    if (!state.user) {
      console.warn('Cannot update user - no user is currently authenticated');
      return;
    }
    
    const updatedAuth = {
      user: { ...state.user, ...userData },
      token: state.token
    };
    
    setStoredAuth(updatedAuth);
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  // Password reset functions
  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return { success: true, ...response };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to send reset email' 
      };
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const response = await authAPI.resetPassword(resetData);
      if (response.success && response.token) {
        // Auto-login if token is returned
        const authData = {
          user: response.user,
          token: response.token
        };
        setStoredAuth(authData);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: authData
        });
      }
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Enhanced context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    clearError,
    // Additional helpers
    hasRole: (role) => state.user?.role === role,
    hasPermission: (permission) => state.user?.permissions?.includes(permission)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Enhanced useAuth hook with validation
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;