import { useState, useEffect, useCallback, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useApiRequest } from './useApi';

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
  const { post } = useApiRequest();

  const loginUser = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await post('/auth/login', credentials);
      await login(response.user, response.token);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, post]);

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
  const { login } = useAuth();
  const { post } = useApiRequest();

  const registerUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await post('/auth/register', userData);
      
      // Auto-login after registration
      if (response.user && response.token) {
        await login(response.user, response.token);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, post]);

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
  const { post } = useApiRequest();

  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post]);

  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      await post('/auth/reset-password', { token, password: newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post]);

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
  const { get, put, patch } = useApiRequest();

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await get('/auth/profile');
      updateUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [get, updateUser]);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await put('/auth/profile', profileData);
      updateUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [put, updateUser]);

  const changePassword = useCallback(async (passwordData) => {
    setLoading(true);
    setError(null);

    try {
      await patch('/auth/change-password', passwordData);
    } catch (err) {
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [patch]);

  const uploadAvatar = useCallback(async (avatarFile) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      updateUser({ ...user, avatar: data.avatar });
      return data.avatar;
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, updateUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    loading,
    error,
    clearError,
  };
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { user, token, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!(user && token));
    setIsAdmin(user?.role === 'admin');
    setIsInstructor(user?.role === 'instructor');
    setIsStudent(user?.role === 'student');
  }, [user, token]);

  return {
    isAuthenticated,
    isAdmin,
    isInstructor,
    isStudent,
    user,
    loading,
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
    // This would typically refresh the token
    // Implementation depends on your backend
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update token in auth context
        return data.token;
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  }, [token]);

  return {
    sessionExpired,
    isTokenExpired: isTokenExpired(),
    extendSession,
  };
};

export default useAuth;