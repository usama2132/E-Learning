import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getStoredAuth, setStoredAuth, removeStoredAuth } from '../utils/storage';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isVerifying: false,
  error: null,
  lastAuthAction: null
};

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

// Enhanced token storage
const setTokenEverywhere = (token) => {
  if (!token) return;
  
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('lms_auth_token', token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('access_token', token);
    sessionStorage.setItem('token', token);
    console.log('🔒 Token stored in multiple locations');
  } catch (error) {
    console.error('❌ Error storing token:', error);
  }
};

const clearAllTokens = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('lms_auth_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('user_data');
    console.log('🗑️ All tokens cleared');
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
  }
};

const getTokenFromAnySource = () => {
  return localStorage.getItem('token') || 
         localStorage.getItem('lms_auth_token') ||
         localStorage.getItem('auth_token') ||
         localStorage.getItem('access_token') ||
         sessionStorage.getItem('token') ||
         null;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: 'VERIFYING_TOKEN' });
        
        const token = getTokenFromAnySource();
        const storedAuth = getStoredAuth();
        
        if (token || storedAuth?.token) {
          const authToken = token || storedAuth.token;
          console.log('🔍 Found stored auth token, verifying...');
          
          try {
            const response = await fetch('http://localhost:5000/api/auth/validate-token', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok && data.success && data.data?.valid) {
              console.log('✅ Token verification successful');
              
              const authData = {
                user: data.data.user,
                token: authToken
              };
              
              setTokenEverywhere(authToken);
              setStoredAuth(authData);
              
              dispatch({
  type: 'AUTH_SUCCESS',
  payload: {
    token: authData.token,
    user: {
      _id: authData.user._id || authData.user.id,
      email: authData.user.email,
      firstName: authData.user.firstName || '',
      lastName: authData.user.lastName || '',
      name: authData.user.name || `${authData.user.firstName || ''} ${authData.user.lastName || ''}`.trim(),
      role: authData.user.role || 'student',
      ...authData.user
    }
  }
});

            } else {
              console.warn('❌ Token verification failed:', data.message);
              clearAllTokens();
              removeStoredAuth();
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          } catch (verifyError) {
            console.warn('❌ Token verification error:', verifyError.message);
            clearAllTokens();
            removeStoredAuth();
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          console.log('ℹ️ No stored auth token found');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        clearAllTokens();
        removeStoredAuth();
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: 'Session initialization failed' 
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      console.log('🔐 Attempting login with email:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        const authData = {
          user: data.data.user,
          token: data.data.accessToken
        };
        
        setTokenEverywhere(data.data.accessToken);
        setStoredAuth(authData);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: authData
        });
        
        console.log('✅ Login successful');
        return { success: true, user: data.data.user };
      } else {
        console.warn('❌ Login failed:', data.message);
        dispatch({
          type: 'AUTH_FAILURE',
          payload: data.message || 'Login failed'
        });
        return { 
          success: false, 
          message: data.message 
        };
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      
      let errorMessage = 'Network error. Please check your connection and ensure the server is running on http://localhost:5000';
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
        
        console.log('✅ Registration successful');
        return { 
          success: true,
          requiresVerification: true,
          message: data.message || 'Registration successful! Please check your email.',
          user: data.data?.user
        };
      } else {
        const errorMessage = data.message || data.error || 'Registration failed';
        console.warn('❌ Registration failed:', errorMessage);
        
        dispatch({
          type: 'AUTH_FAILURE',
          payload: errorMessage
        });
        
        return { 
          success: false, 
          message: errorMessage,
          errors: data.errors 
        };
      }
    } catch (error) {
      console.error('💥 Registration error:', error);
      
      let errorMessage = 'Network error. Please check your connection';
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const logout = async (options = {}) => {
    console.log('🚪 Logging out user');
    
    try {
      const token = getTokenFromAnySource();
      if (token && !options.skipServerCall) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        console.log('✅ Server logout successful');
      }
    } catch (error) {
      console.warn('⚠️ Server logout failed:', error.message);
    } finally {
      clearAllTokens();
      removeStoredAuth();
      dispatch({ type: 'LOGOUT' });
      console.log('✅ Local logout completed');
      
      if (options.silent !== true && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  const updateUser = async (userData) => {
    if (!state.user) {
      console.warn('⚠️ Cannot update user - no user authenticated');
      return { success: false, message: 'No authenticated user' };
    }
    
    try {
      console.log('📝 Updating user profile...');
      
      const token = getTokenFromAnySource();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const updatedUser = data.data.user || { ...state.user, ...userData };
        
        const updatedAuth = {
          user: updatedUser,
          token: token
        };
        setStoredAuth(updatedAuth);
        
        dispatch({
          type: 'UPDATE_USER',
          payload: updatedUser
        });
        
        console.log('✅ User profile updated successfully');
        return { success: true, user: updatedUser };
      } else {
        console.warn('❌ User update failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('💥 User update error:', error);
      return { 
        success: false, 
        message: 'Failed to update profile' 
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      console.log('🔐 Requesting password reset for:', email);
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      console.log('✅ Password reset request successful');
      return { success: true, message: data.message };
    } catch (error) {
      console.error('💥 Forgot password error:', error);
      return { 
        success: false, 
        message: 'Failed to send reset email' 
      };
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      console.log('🔐 Resetting password...');
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password, confirmPassword })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Password reset successful');
        return { success: true, message: data.message };
      }
      return data;
    } catch (error) {
      console.error('💥 Reset password error:', error);
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshToken = async () => {
    const token = getTokenFromAnySource();
    if (!token) {
      console.log('❌ No token to refresh');
      return false;
    }

    try {
      console.log('🔄 Refreshing token...');
      const response = await fetch('http://localhost:5000/api/auth/validate-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.valid) {
        console.log('✅ Token refresh successful');
        
        const authData = {
          user: data.data.user,
          token: token
        };
        
        setTokenEverywhere(token);
        setStoredAuth(authData);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: authData
        });
        
        return true;
      } else {
        console.warn('❌ Token refresh failed');
        await logout({ silent: true });
        return false;
      }
    } catch (error) {
      console.error('💥 Token refresh error:', error);
      await logout({ silent: true });
      return false;
    }
  };

  useEffect(() => {
    if (!state.isAuthenticated || !state.token) return;

    const interval = setInterval(() => {
      console.log('⏰ Auto-refreshing token...');
      refreshToken();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token]);


  const updateProfile = async (profileData) => {
  if (!state.user) {
    console.warn('⚠️ Cannot update profile - no user authenticated');
    return { success: false, message: 'No authenticated user' };
  }
  
  try {
    console.log('📝 Updating user profile via updateProfile...');
    
    const token = getTokenFromAnySource();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const response = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const updatedUser = data.data.user || { ...state.user, ...profileData };
      
      const updatedAuth = {
        user: updatedUser,
        token: token
      };
      setStoredAuth(updatedAuth);
      
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      });
      
      console.log('✅ User profile updated successfully via updateProfile');
      return { success: true, user: updatedUser };
    } else {
      console.warn('❌ Profile update failed:', data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('💥 Profile update error:', error);
    return { 
      success: false, 
      message: 'Failed to update profile' 
    };
  }
};

  // FIXED: Export getToken function for API calls
  const getToken = () => getTokenFromAnySource();

  const value = {
    ...state,
    loading: state.isLoading,
    login,
    register,
    logout,
    updateUser,
    updateProfile, 
    forgotPassword,
    resetPassword,
    refreshToken,
    clearError,
    getToken, // CRITICAL: Export this for API calls
    hasRole: (role) => state.user?.role === role,
    hasPermission: (permission) => state.user?.permissions?.includes(permission),
    debugInfo: {
      isBackendConnected: !window.location.search.includes('mock=true'),
      tokenPresent: !!getTokenFromAnySource(),
      tokenSources: {
        localStorage_token: !!localStorage.getItem('token'),
        localStorage_lms: !!localStorage.getItem('lms_auth_token'),
        localStorage_auth: !!localStorage.getItem('auth_token'),
        localStorage_access: !!localStorage.getItem('access_token'),
        sessionStorage_token: !!sessionStorage.getItem('token')
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;