import { useState, useEffect, useCallback, useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext'; 

const useProgress = (courseId = null) => {
  const {
    courseProgress,
    setCourseProgress,
    loading,
    setLoading,
    error,
    setError
  } = useContext(ProgressContext);

  const [currentProgress, setCurrentProgress] = useState(null);

  // Get progress for specific course
  useEffect(() => {
    if (courseId && courseProgress[courseId]) {
      setCurrentProgress(courseProgress[courseId]);
    }
  }, [courseId, courseProgress]);

  // Fetch course progress
  const fetchCourseProgress = useCallback(async (targetCourseId = courseId) => {
    if (!targetCourseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/progress/course/${targetCourseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      
      setCourseProgress(prev => ({
        ...prev,
        [targetCourseId]: data.progress
      }));

      if (targetCourseId === courseId) {
        setCurrentProgress(data.progress);
      }

      return data.progress;

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, setCourseProgress, setLoading, setError]);

  // Fetch all user progress
  const fetchAllProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/progress/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      
      // Transform array to object for easier access
      const progressMap = {};
      data.progress.forEach(progress => {
        progressMap[progress.courseId] = progress;
      });

      setCourseProgress(progressMap);

      return data.progress;

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setCourseProgress, setLoading, setError]);

  // Update lesson progress
  const updateLessonProgress = useCallback(async (targetCourseId, lessonId, progress = {}) => {
    setError(null);

    try {
      const response = await fetch(`/api/progress/lesson/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: targetCourseId,
          ...progress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const data = await response.json();

      // Update course progress in state
      setCourseProgress(prev => ({
        ...prev,
        [targetCourseId]: data.courseProgress
      }));

      if (targetCourseId === courseId) {
        setCurrentProgress(data.courseProgress);
      }

      return data;

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [courseId, setCourseProgress, setError]);

  // Mark lesson as completed
  const markLessonCompleted = useCallback(async (targetCourseId, lessonId) => {
    return updateLessonProgress(targetCourseId, lessonId, {
      completed: true,
      completedAt: new Date().toISOString(),
      watchTime: 100 // Assuming 100% watched
    });
  }, [updateLessonProgress]);

  // Update video watch time
  const updateWatchTime = useCallback(async (targetCourseId, lessonId, watchTime, duration) => {
    const progressPercentage = Math.min(100, Math.round((watchTime / duration) * 100));
    
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
      const response = await fetch(`/api/progress/quiz/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: targetCourseId,
          score,
          totalQuestions,
          completedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz score');
      }

      const data = await response.json();

      // Update course progress
      setCourseProgress(prev => ({
        ...prev,
        [targetCourseId]: data.courseProgress
      }));

      if (targetCourseId === courseId) {
        setCurrentProgress(data.courseProgress);
      }

      return data;

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [courseId, setCourseProgress, setError]);

  // Calculate overall progress percentage
  const calculateProgressPercentage = useCallback((progress) => {
    if (!progress || !progress.lessons || progress.lessons.length === 0) {
      return 0;
    }

    const completedLessons = progress.lessons.filter(lesson => lesson.completed).length;
    return Math.round((completedLessons / progress.lessons.length) * 100);
  }, []);

  // Get lesson progress by ID
  const getLessonProgress = useCallback((lessonId) => {
    if (!currentProgress || !currentProgress.lessons) return null;
    return currentProgress.lessons.find(lesson => lesson.lessonId === lessonId);
  }, [currentProgress]);

  // Check if lesson is completed
  const isLessonCompleted = useCallback((lessonId) => {
    const lessonProgress = getLessonProgress(lessonId);
    return lessonProgress ? lessonProgress.completed : false;
  }, [getLessonProgress]);

  // Get next incomplete lesson
  const getNextLesson = useCallback(() => {
    if (!currentProgress || !currentProgress.lessons) return null;
    
    return currentProgress.lessons.find(lesson => !lesson.completed);
  }, [currentProgress]);

  // Get course completion status
  const isCourseCompleted = useCallback(() => {
    if (!currentProgress || !currentProgress.lessons) return false;
    
    return currentProgress.lessons.every(lesson => lesson.completed);
  }, [currentProgress]);

  // Reset course progress
  const resetCourseProgress = useCallback(async (targetCourseId = courseId) => {
    if (!targetCourseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/progress/reset/${targetCourseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reset progress');
      }

      const data = await response.json();

      // Update state
      setCourseProgress(prev => ({
        ...prev,
        [targetCourseId]: data.progress
      }));

      if (targetCourseId === courseId) {
        setCurrentProgress(data.progress);
      }

      return data.progress;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [courseId, setCourseProgress, setLoading, setError]);

  // Get progress statistics
  const getProgressStats = useCallback(() => {
    if (!currentProgress) return null;

    const totalLessons = currentProgress.lessons?.length || 0;
    const completedLessons = currentProgress.lessons?.filter(l => l.completed).length || 0;
    const totalWatchTime = currentProgress.lessons?.reduce((acc, lesson) => acc + (lesson.watchTime || 0), 0) || 0;
    const averageScore = currentProgress.quizScores?.length > 0
      ? currentProgress.quizScores.reduce((acc, quiz) => acc + quiz.score, 0) / currentProgress.quizScores.length
      : 0;

    return {
      totalLessons,
      completedLessons,
      remainingLessons: totalLessons - completedLessons,
      progressPercentage: calculateProgressPercentage(currentProgress),
      totalWatchTime,
      averageWatchTime: totalLessons > 0 ? totalWatchTime / totalLessons : 0,
      averageScore: Math.round(averageScore),
      isCompleted: isCourseCompleted(),
      startedAt: currentProgress.startedAt,
      lastAccessedAt: currentProgress.lastAccessedAt
    };
  }, [currentProgress, calculateProgressPercentage, isCourseCompleted]);

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
    clearError: () => setError(null)
  };
};

export default useProgress;