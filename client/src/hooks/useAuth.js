import { useState, useEffect, useCallback, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { api } from '../utils/api'; // Use your configured API

// Custom hook for authentication
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Hook for login functionality
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const loginUser = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Attempting login with backend API');
      const response = await api.auth.login(credentials);
      
      if (response.success) {
        console.log('✅ Login successful, updating auth context');
        const result = await login(response.user.email, credentials.password);
        return result;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [login]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loginUser,
    loading,
    error,
    clearError,
  };
};

// Hook for registration functionality
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();

  const registerUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📝 Attempting registration with backend API');
      const response = await api.auth.register(userData);
      
      if (response.success) {
        console.log('✅ Registration successful');
        const result = await register(userData);
        return result;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [register]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    registerUser,
    loading,
    error,
    clearError,
  };
};

// Hook for password reset functionality
export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('📧 Requesting password reset');
      const response = await api.auth.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        return response;
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('❌ Password reset request error:', err);
      const errorMessage = err.message || 'Failed to send reset email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Resetting password');
      const response = await api.auth.resetPassword(token, newPassword);
      
      if (response.success) {
        setSuccess(true);
        return response;
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('❌ Password reset error:', err);
      const errorMessage = err.message || 'Failed to reset password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    requestPasswordReset,
    resetPassword,
    loading,
    error,
    success,
    clearMessages,
  };
};

// Hook for profile management
export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, updateUser } = useAuth();

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('👤 Fetching user profile');
      const response = await api.users.getProfile();
      
      if (response.success) {
        updateUser(response.user);
        return response.user;
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('❌ Profile fetch error:', err);
      const errorMessage = err.message || 'Failed to fetch profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📝 Updating user profile');
      const response = await api.users.updateProfile(profileData);
      
      if (response.success) {
        updateUser(response.user);
        return response.user;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('❌ Profile update error:', err);
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  const uploadAvatar = useCallback(async (avatarFile) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📸 Uploading avatar');
      const response = await api.uploads.uploadImage(avatarFile);
      
      if (response.success) {
        // Update user profile with new avatar URL
        const updatedUser = await updateProfile({ avatar: response.url });
        return updatedUser;
      } else {
        throw new Error(response.message || 'Failed to upload avatar');
      }
    } catch (err) {
      console.error('❌ Avatar upload error:', err);
      const errorMessage = err.message || 'Failed to upload avatar';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    getProfile,
    updateProfile,
    uploadAvatar,
    loading,
    error,
    clearError,
  };
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
    setIsInstructor(user?.role === 'instructor');
    setIsStudent(user?.role === 'student');
  }, [user]);

  return {
    isAuthenticated,
    isAdmin,
    isInstructor,
    isStudent,
    user,
    loading: isLoading,
  };
};

// Hook for role-based access control
export const useRolePermissions = () => {
  const { user } = useAuth();

  const hasPermission = useCallback((permission) => {
    if (!user) return false;

    const rolePermissions = {
      admin: [
        'manage_users',
        'manage_courses',
        'manage_payments',
        'view_analytics',
        'manage_settings',
        'approve_courses',
        'manage_categories',
      ],
      instructor: [
        'create_courses',
        'edit_own_courses',
        'view_own_analytics',
        'manage_students',
        'upload_content',
      ],
      student: [
        'view_courses',
        'enroll_courses',
        'view_progress',
        'leave_reviews',
      ],
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  }, [user]);

  const canAccess = useCallback((resource, action = 'view') => {
    if (!user) return false;

    const accessRules = {
      dashboard: {
        view: ['admin', 'instructor', 'student'],
      },
      courses: {
        create: ['admin', 'instructor'],
        edit: ['admin', 'instructor'],
        delete: ['admin'],
        view: ['admin', 'instructor', 'student'],
      },
      users: {
        manage: ['admin'],
        view: ['admin'],
      },
      analytics: {
        view: ['admin', 'instructor'],
      },
      settings: {
        manage: ['admin'],
      },
    };

    return accessRules[resource]?.[action]?.includes(user.role) || false;
  }, [user]);

  return {
    hasPermission,
    canAccess,
  };
};

// Hook for session management
export const useSession = () => {
  const { user, token, logout } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!token) return true;

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return tokenPayload.exp < currentTime;
    } catch {
      return true;
    }
  }, [token]);

  // Auto-logout on token expiration
  useEffect(() => {
    const checkSession = () => {
      if (user && isTokenExpired()) {
        console.log('⏰ Session expired, logging out');
        setSessionExpired(true);
        logout();
      }
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    
    // Initial check
    checkSession();

    return () => clearInterval(interval);
  }, [user, isTokenExpired, logout]);

  const extendSession = useCallback(async () => {
    try {
      console.log('🔄 Extending session');
      const response = await api.auth.refresh();
      
      if (response.success) {
        return response.token;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('❌ Failed to extend session:', error);
      return null;
    }
  }, []);

  return {
    sessionExpired,
    isTokenExpired: isTokenExpired(),
    extendSession,
  };
};

export default useAuth;