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

  // Enhanced API request helper with proper validation-compliant structure
  const makeAPIRequest = async (endpoint, options = {}) => {
    try {
      const token = getToken && typeof getToken === 'function' ? getToken() : 
                    localStorage.getItem('token') || 
                    localStorage.getItem('lms_auth_token') ||
                    sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };

      const response = await fetch(`http://localhost:5000/api${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
      });

      // Handle authentication errors
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      }

      // Handle validation errors specifically
      if (response.status === 400) {
        let errorMessage = 'Validation error';
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.details) {
            // Handle detailed validation errors
            const validationErrors = errorData.error.details.map(detail => detail.message).join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          } else {
            errorMessage = errorData.message || errorData.error?.message || errorMessage;
          }
        } catch (parseError) {
          errorMessage = 'Request validation failed';
        }
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error?.message || errorMessage;
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

  // FIXED: Fetch course progress using the correct backend endpoint
  const fetchCourseProgress = useCallback(async (targetCourseId = courseId) => {
    if (!targetCourseId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching progress for course:', targetCourseId);
      // Use the correct endpoint that exists in your progressController.js
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
      return null;
    } finally {
      setLoading(false);
    }
  }, [courseId, setCourseProgress, setLoading, setError]);

  // FIXED: Fetch all user progress with the correct endpoint
  const fetchAllProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching all user progress');
      // Use the endpoint that exists in your backend
      const response = await makeAPIRequest('/progress/overall', {
        method: 'GET'
      });

      if (response.success) {
        // Transform array to object for easier access
        const progressMap = {};
        if (response.data.progress && response.data.progress.courses) {
          response.data.progress.courses.forEach(courseData => {
            const courseId = courseData.course._id || courseData.course.id;
            if (courseId) {
              progressMap[courseId] = courseData.progress;
            }
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
      return [];
    } finally {
      setLoading(false);
    }
  }, [setCourseProgress, setLoading, setError]);

  // FIXED: Update video progress using the correct endpoint
  const updateVideoProgress = useCallback(async (targetCourseId, videoId, watchTime, totalDuration) => {
    setError(null);

    try {
      console.log('Updating video progress:', { targetCourseId, videoId, watchTime });
      
      const requestBody = {
        watchTime: watchTime, // percentage
        totalDuration: totalDuration,
        completed: watchTime >= 90,
        lastWatchedPosition: (watchTime / 100) * totalDuration
      };

      // FIXED: Use the correct backend endpoint from your progressController.js
      const response = await makeAPIRequest(`/progress/courses/${targetCourseId}/videos/${videoId}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      });

      if (response.success) {
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
      console.error('Video progress update error:', err);
      setError(err.message);
      throw err;
    }
  }, [courseId, setCourseProgress, setError]);

  // FIXED: Update lesson progress using the correct endpoint
  const updateLessonProgress = useCallback(async (targetCourseId, lessonId, progressData = {}) => {
    setError(null);

    try {
      console.log('Updating lesson progress:', { targetCourseId, lessonId, progressData });
      
      const requestBody = {
        lessonId: lessonId,
        completed: progressData.completed || false,
        timeSpent: progressData.timeSpent || 0,
        watchedPercentage: progressData.watchedPercentage || 0,
        notes: progressData.notes || ''
      };

      // Use the correct endpoint from your progressController.js
      const response = await makeAPIRequest(`/progress/courses/${targetCourseId}/lessons`, {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      });

      if (response.success) {
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
      console.error('Lesson progress update error:', err);
      setError(err.message);
      throw err;
    }
  }, [courseId, setCourseProgress, setError]);

  // Mark lesson as completed
  const markLessonCompleted = useCallback(async (targetCourseId, lessonId) => {
    console.log('Marking lesson as completed:', { targetCourseId, lessonId });
    return updateLessonProgress(targetCourseId, lessonId, {
      completed: true,
      completedAt: new Date().toISOString(),
      watchedPercentage: 100
    });
  }, [updateLessonProgress]);

  // Update video watch time
  const updateWatchTime = useCallback(async (targetCourseId, lessonId, watchTime, duration) => {
    const progressPercentage = Math.min(100, Math.round((watchTime / duration) * 100));
    console.log('Updating watch time:', { targetCourseId, lessonId, progressPercentage });
    
    return updateVideoProgress(targetCourseId, lessonId, progressPercentage, duration);
  }, [updateVideoProgress]);

  // Submit quiz/assignment score
  const submitQuizScore = useCallback(async (targetCourseId, lessonId, score, totalQuestions) => {
    setError(null);

    try {
      console.log('Submitting quiz score:', { targetCourseId, lessonId, score, totalQuestions });
      
      const response = await updateLessonProgress(targetCourseId, lessonId, {
        quizScore: score,
        quizTotal: totalQuestions,
        quizCompleted: true,
        completed: score >= (totalQuestions * 0.7), // 70% passing
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

    const completedCount = Array.isArray(progress.completedLessons) ? 
                          progress.completedLessons.length : 
                          progress.completedLessons;
    
    return Math.round((completedCount / progress.totalLessons) * 100);
  }, []);

  // Get lesson progress by ID
  const getLessonProgress = useCallback((lessonId) => {
    if (!currentProgress || !currentProgress.lessons) return null;
    
    // Check if lesson is in completed lessons array
    const isCompleted = currentProgress.completedLessons && 
                       (Array.isArray(currentProgress.completedLessons) ? 
                        currentProgress.completedLessons.includes(lessonId) :
                        currentProgress.completedLessons === lessonId);
    
    return {
      lessonId,
      completed: isCompleted,
      progressPercentage: currentProgress.progressPercentage || 0
    };
  }, [currentProgress]);

  // Check if lesson is completed
  const isLessonCompleted = useCallback((lessonId) => {
    if (!currentProgress || !currentProgress.completedLessons) return false;
    
    return Array.isArray(currentProgress.completedLessons) ?
           currentProgress.completedLessons.includes(lessonId) :
           currentProgress.completedLessons === lessonId;
  }, [currentProgress]);

  // Get next incomplete lesson
  const getNextLesson = useCallback(() => {
    if (!currentProgress || !currentProgress.lessons) return null;
    
    return currentProgress.lessons.find(lesson => 
      !isLessonCompleted(lesson.id || lesson._id)
    );
  }, [currentProgress, isLessonCompleted]);

  // Get course completion status
  const isCourseCompleted = useCallback(() => {
    if (!currentProgress) return false;
    return calculateProgressPercentage(currentProgress) === 100;
  }, [currentProgress, calculateProgressPercentage]);

  // FIXED: Get user courses with proper endpoint
  const getUserCourses = useCallback(async (userId) => {
    try {
      const response = await makeAPIRequest('/student/enrolled-courses', {
        method: 'GET'
      });
      
      if (response.success && response.data) {
        return response.data.courses || response.courses || [];
      } else {
        return [];
      }
    } catch (err) {
      console.error('User courses fetch error:', err);
      return [];
    }
  }, []);

  // Get progress statistics
  const getProgressStats = useCallback(() => {
    if (!currentProgress) return null;

    const completedLessons = Array.isArray(currentProgress.completedLessons) ?
                            currentProgress.completedLessons.length :
                            (currentProgress.completedLessons || 0);
    const totalLessons = currentProgress.totalLessons || 0;
    const progressPercentage = calculateProgressPercentage(currentProgress);

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
  }, [currentProgress, calculateProgressPercentage]);

  // Reset course progress
  const resetCourseProgress = useCallback(async (targetCourseId = courseId) => {
    if (!targetCourseId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Resetting course progress:', targetCourseId);
      
      const response = await makeAPIRequest(`/progress/course/${targetCourseId}/reset`, {
        method: 'POST',
        body: JSON.stringify({
          courseId: targetCourseId,
          resetAll: true
        })
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
  }, [courseId, setCourseProgress, setLoading, setError]);

  return {
    currentProgress,
    courseProgress,
    loading,
    error,
    fetchCourseProgress,
    fetchAllProgress,
    updateLessonProgress,
    updateVideoProgress,
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
    getUserCourses,
    clearError: () => setError(null)
  };
};

export default useProgress;