import { useState, useEffect, useCallback, useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';
import { useAuth } from '../hooks/useAuth';

const useProgress = (courseId = null) => {
  const {
    courseProgress,
    setCourseProgress,
    loading,
    setLoading,
    error,
    setError
  } = useContext(ProgressContext);

  const { getToken, user } = useAuth();
  const [currentProgress, setCurrentProgress] = useState(null);

  // Get progress for specific course
  useEffect(() => {
    if (courseId && courseProgress[courseId]) {
      setCurrentProgress(courseProgress[courseId]);
    }
  }, [courseId, courseProgress]);

  // Enhanced API request helper with better token handling
  const makeAPIRequest = async (endpoint, options = {}) => {
    const token = getToken && typeof getToken === 'function' ? getToken() : 
                  localStorage.getItem('token') || 
                  localStorage.getItem('lms_auth_token') ||
                  sessionStorage.getItem('token');
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:5000/api${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Use default error message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  // Fetch course progress using direct API call
  const fetchCourseProgress = useCallback(async (targetCourseId = courseId) => {
    if (!targetCourseId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching progress for course:', targetCourseId);
      const response = await makeAPIRequest(`/progress/course/${targetCourseId}`, {
        method: 'GET'
      });

      if (response.success) {
        setCourseProgress(prev => ({
          ...prev,
          [targetCourseId]: response.data.progress
        }));

        if (targetCourseId === courseId) {
          setCurrentProgress(response.data.progress);
        }

        return response.data.progress;
      } else {
        throw new Error(response.message || 'Failed to fetch progress');
      }

    } catch (err) {
      console.error('Progress fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, setCourseProgress, setLoading, setError, getToken]);

  // Fetch all user progress using direct API call
  const fetchAllProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching all user progress');
      const response = await makeAPIRequest('/progress/user', {
        method: 'GET'
      });

      if (response.success) {
        // Transform array to object for easier access
        const progressMap = {};
        if (response.data.progress && Array.isArray(response.data.progress)) {
          response.data.progress.forEach(progress => {
            progressMap[progress.courseId] = progress;
          });
        }

        setCourseProgress(progressMap);
        return response.data.progress;
      } else {
        throw new Error(response.message || 'Failed to fetch progress');
      }

    } catch (err) {
      console.error('All progress fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setCourseProgress, setLoading, setError, getToken]);

  // Update lesson progress using direct API call
  const updateLessonProgress = useCallback(async (targetCourseId, lessonId, progressData = {}) => {
    setError(null);

    try {
      console.log('Updating lesson progress:', { targetCourseId, lessonId, progressData });
      
      const response = await makeAPIRequest(`/progress/course/${targetCourseId}/lesson/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...progressData,
          lastAccessed: new Date().toISOString()
        })
      });

      if (response.success) {
        // Update course progress in state
        setCourseProgress(prev => ({
          ...prev,
          [targetCourseId]: response.data.progress
        }));

        if (targetCourseId === courseId) {
          setCurrentProgress(response.data.progress);
        }

        return response;
      } else {
        throw new Error(response.message || 'Failed to update progress');
      }

    } catch (err) {
      console.error('Progress update error:', err);
      setError(err.message);
      throw err;
    }
  }, [courseId, setCourseProgress, setError, getToken]);

  // Mark lesson as completed
  const markLessonCompleted = useCallback(async (targetCourseId, lessonId) => {
    console.log('Marking lesson as completed:', { targetCourseId, lessonId });
    return updateLessonProgress(targetCourseId, lessonId, {
      completed: true,
      completedAt: new Date().toISOString(),
      watchTime: 100 // Assuming 100% watched
    });
  }, [updateLessonProgress]);

  // Update video watch time
  const updateWatchTime = useCallback(async (targetCourseId, lessonId, watchTime, duration) => {
    const progressPercentage = Math.min(100, Math.round((watchTime / duration) * 100));
    console.log('Updating watch time:', { targetCourseId, lessonId, progressPercentage });
    
    return updateLessonProgress(targetCourseId, lessonId, {
      watchTime: progressPercentage,
      lastWatchedAt: new Date().toISOString(),
      completed: progressPercentage >= 90 // Auto-complete at 90%
    });
  }, [updateLessonProgress]);

  // Submit quiz/assignment score
  const submitQuizScore = useCallback(async (targetCourseId, lessonId, score, totalQuestions) => {
    setError(null);

    try {
      console.log('Submitting quiz score:', { targetCourseId, lessonId, score, totalQuestions });
      
      const response = await updateLessonProgress(targetCourseId, lessonId, {
        quizScore: score,
        quizTotal: totalQuestions,
        quizCompleted: true,
        completedAt: new Date().toISOString()
      });

      return response;

    } catch (err) {
      console.error('Quiz submission error:', err);
      setError(err.message);
      throw err;
    }
  }, [updateLessonProgress, setError]);

  // Calculate overall progress percentage
  const calculateProgressPercentage = useCallback((progress) => {
    if (!progress || !progress.completedLessons || progress.totalLessons === 0) {
      return 0;
    }

    return Math.round((progress.completedLessons / progress.totalLessons) * 100);
  }, []);

  // Get lesson progress by ID
  const getLessonProgress = useCallback((lessonId) => {
    if (!currentProgress || !currentProgress.lessons) return null;
    
    // Check if lesson is in completed lessons array
    const isCompleted = currentProgress.completedLessons && 
                       currentProgress.completedLessons.includes(lessonId);
    
    return {
      lessonId,
      completed: isCompleted,
      progressPercentage: currentProgress.progressPercentage || 0
    };
  }, [currentProgress]);

  // Check if lesson is completed
  const isLessonCompleted = useCallback((lessonId) => {
    if (!currentProgress || !currentProgress.completedLessons) return false;
    return currentProgress.completedLessons.includes(lessonId);
  }, [currentProgress]);

  // Get next incomplete lesson
  const getNextLesson = useCallback(() => {
    if (!currentProgress || !currentProgress.lessons) return null;
    
    return currentProgress.lessons.find(lesson => 
      !currentProgress.completedLessons?.includes(lesson.id)
    );
  }, [currentProgress]);

  // Get course completion status
  const isCourseCompleted = useCallback(() => {
    if (!currentProgress) return false;
    return currentProgress.progressPercentage === 100;
  }, [currentProgress]);

  // Get user courses (for dashboard) using direct API call
  const getUserCourses = useCallback(async (userId) => {
    try {
      console.log('Fetching user enrolled courses');
      const response = await makeAPIRequest('/student/courses', {
        method: 'GET'
      });
      
      if (response.success) {
        return response.data.courses || [];
      } else {
        throw new Error(response.message || 'Failed to fetch user courses');
      }
    } catch (err) {
      console.error('User courses fetch error:', err);
      setError(err.message);
      return [];
    }
  }, [setError, getToken]);

  // Get progress statistics
  const getProgressStats = useCallback(() => {
    if (!currentProgress) return null;

    const completedLessons = currentProgress.completedLessons || 0;
    const totalLessons = currentProgress.totalLessons || 0;
    const progressPercentage = currentProgress.progressPercentage || 0;

    return {
      totalLessons,
      completedLessons,
      remainingLessons: totalLessons - completedLessons,
      progressPercentage,
      totalWatchTime: currentProgress.timeSpent || 0,
      averageWatchTime: totalLessons > 0 ? (currentProgress.timeSpent || 0) / totalLessons : 0,
      isCompleted: progressPercentage === 100,
      startedAt: currentProgress.startedAt,
      lastAccessedAt: currentProgress.lastAccessed || currentProgress.updatedAt
    };
  }, [currentProgress]);

  // Reset course progress
  const resetCourseProgress = useCallback(async (targetCourseId = courseId) => {
    if (!targetCourseId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Resetting course progress:', targetCourseId);
      
      // Reset by updating progress to 0
      const response = await makeAPIRequest(`/progress/course/${targetCourseId}/reset`, {
        method: 'POST'
      });

      if (response.success) {
        // Update state
        setCourseProgress(prev => ({
          ...prev,
          [targetCourseId]: response.data.progress
        }));

        if (targetCourseId === courseId) {
          setCurrentProgress(response.data.progress);
        }

        return response.data.progress;
      } else {
        throw new Error(response.message || 'Failed to reset progress');
      }

    } catch (err) {
      console.error('Progress reset error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [courseId, setCourseProgress, setLoading, setError, getToken]);

  return {
    currentProgress,
    courseProgress,
    loading,
    error,
    fetchCourseProgress,
    fetchAllProgress,
    updateLessonProgress,
    markLessonCompleted,
    updateWatchTime,
    submitQuizScore,
    calculateProgressPercentage,
    getLessonProgress,
    isLessonCompleted,
    getNextLesson,
    isCourseCompleted,
    resetCourseProgress,
    getProgressStats,
    getUserCourses, // Added for dashboard
    clearError: () => setError(null)
  };
};

export default useProgress;