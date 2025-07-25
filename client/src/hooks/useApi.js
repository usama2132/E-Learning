import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

// Create axios instance with base configuration
const createApiInstance = (baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api') => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
};

// Custom hook for API calls
export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  const {
    method = 'GET',
    body = null,
    headers = {},
    dependencies = [],
    immediate = true,
    retries = 3,
    retryDelay = 1000,
  } = options;

  const api = createApiInstance();

  // Setup request interceptor for auth
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup response interceptor for error handling
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token, logout, api]);

  // Execute API call with retry logic
  const execute = useCallback(async (customConfig = {}) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    const config = {
      method,
      url,
      data: body,
      headers: { ...headers, ...customConfig.headers },
      ...customConfig,
    };

    let attempt = 0;
    
    while (attempt < retries) {
      try {
        const response = await api(config);
        setData(response.data);
        setLoading(false);
        return response.data;
      } catch (err) {
        attempt++;
        
        if (attempt >= retries) {
          const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
          setError({
            message: errorMessage,
            status: err.response?.status,
            data: err.response?.data,
          });
          setLoading(false);
          throw err;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }, [url, method, body, headers, retries, retryDelay, api]);

  // Auto-execute on mount and dependency changes
  useEffect(() => {
    if (immediate && url) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  // Manual refetch function
  const refetch = useCallback((config = {}) => {
    return execute(config);
  }, [execute]);

  // Reset function
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
  };
};

// Hook for making requests with different HTTP methods
export const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  const api = createApiInstance();

  // Setup interceptors
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token, logout, api]);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api(config);
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError({
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
      });
      setLoading(false);
      throw err;
    }
  }, [api]);

  const get = useCallback((url, config = {}) => {
    return request({ method: 'GET', url, ...config });
  }, [request]);

  const post = useCallback((url, data, config = {}) => {
    return request({ method: 'POST', url, data, ...config });
  }, [request]);

  const put = useCallback((url, data, config = {}) => {
    return request({ method: 'PUT', url, data, ...config });
  }, [request]);

  const patch = useCallback((url, data, config = {}) => {
    return request({ method: 'PATCH', url, data, ...config });
  }, [request]);

  const del = useCallback((url, config = {}) => {
    return request({ method: 'DELETE', url, ...config });
  }, [request]);

  const upload = useCallback((url, formData, config = {}) => {
    return request({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  }, [request]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    clearError,
  };
};

// Hook for handling paginated API calls
export const usePaginatedApi = (url, options = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { initialPage = 1, initialLimit = 10 } = options;
  const { get } = useApiRequest();

  const fetchPage = useCallback(async (page = pagination.page, limit = pagination.limit, filters = {}) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await get(`${url}?${queryParams}`);
      
      setData(response.data || []);
      setPagination({
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / limit),
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, get, pagination.page, pagination.limit]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, fetchPage]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      fetchPage(pagination.page - 1);
    }
  }, [pagination.page, fetchPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchPage(page);
    }
  }, [pagination.totalPages, fetchPage]);

  const changeLimit = useCallback((newLimit) => {
    fetchPage(1, newLimit);
  }, [fetchPage]);

  useEffect(() => {
    fetchPage(initialPage, initialLimit);
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refetch: () => fetchPage(pagination.page, pagination.limit),
  };
};

export default useApi;