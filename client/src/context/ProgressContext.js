import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for progress tracking
const initialState = {
  courseProgress: {}, // { courseId: { completedLessons: [], totalLessons: 0, percentage: 0 } }
  lessonProgress: {}, // { lessonId: { watched: 0, duration: 0, completed: false } }
  userStats: {
    totalCoursesEnrolled: 0,
    totalCoursesCompleted: 0,
    totalHoursWatched: 0,
    currentStreak: 0,
    longestStreak: 0
  },
  certificates: [], // Array of earned certificates
  loading: false,
  error: null
};

// Action types
const PROGRESS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Course progress actions
  SET_COURSE_PROGRESS: 'SET_COURSE_PROGRESS',
  UPDATE_COURSE_PROGRESS: 'UPDATE_COURSE_PROGRESS',
  COMPLETE_COURSE: 'COMPLETE_COURSE',
  
  // Lesson progress actions
  SET_LESSON_PROGRESS: 'SET_LESSON_PROGRESS',
  UPDATE_LESSON_PROGRESS: 'UPDATE_LESSON_PROGRESS',
  COMPLETE_LESSON: 'COMPLETE_LESSON',
  
  // User stats actions
  UPDATE_USER_STATS: 'UPDATE_USER_STATS',
  INCREMENT_STREAK: 'INCREMENT_STREAK',
  RESET_STREAK: 'RESET_STREAK',
  
  // Certificates
  ADD_CERTIFICATE: 'ADD_CERTIFICATE',
  SET_CERTIFICATES: 'SET_CERTIFICATES',
  
  // Reset
  RESET_PROGRESS: 'RESET_PROGRESS'
};

// Progress reducer
const progressReducer = (state, action) => {
  switch (action.type) {
    case PROGRESS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case PROGRESS_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case PROGRESS_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case PROGRESS_ACTIONS.SET_COURSE_PROGRESS:
      return {
        ...state,
        courseProgress: {
          ...state.courseProgress,
          [action.payload.courseId]: action.payload.progress
        }
      };

    case PROGRESS_ACTIONS.UPDATE_COURSE_PROGRESS:
      const { courseId, lessonId } = action.payload;
      const currentCourseProgress = state.courseProgress[courseId] || {
        completedLessons: [],
        totalLessons: 0,
        percentage: 0
      };

      const updatedCompletedLessons = currentCourseProgress.completedLessons.includes(lessonId)
        ? currentCourseProgress.completedLessons
        : [...currentCourseProgress.completedLessons, lessonId];

      const newPercentage = currentCourseProgress.totalLessons > 0
        ? Math.round((updatedCompletedLessons.length / currentCourseProgress.totalLessons) * 100)
        : 0;

      return {
        ...state,
        courseProgress: {
          ...state.courseProgress,
          [courseId]: {
            ...currentCourseProgress,
            completedLessons: updatedCompletedLessons,
            percentage: newPercentage
          }
        }
      };

    case PROGRESS_ACTIONS.COMPLETE_COURSE:
      return {
        ...state,
        courseProgress: {
          ...state.courseProgress,
          [action.payload.courseId]: {
            ...state.courseProgress[action.payload.courseId],
            percentage: 100,
            completedAt: new Date().toISOString()
          }
        },
        userStats: {
          ...state.userStats,
          totalCoursesCompleted: state.userStats.totalCoursesCompleted + 1
        }
      };

    case PROGRESS_ACTIONS.SET_LESSON_PROGRESS:
      return {
        ...state,
        lessonProgress: {
          ...state.lessonProgress,
          [action.payload.lessonId]: action.payload.progress
        }
      };

    case PROGRESS_ACTIONS.UPDATE_LESSON_PROGRESS:
      const lessonData = action.payload;
      return {
        ...state,
        lessonProgress: {
          ...state.lessonProgress,
          [lessonData.lessonId]: {
            ...state.lessonProgress[lessonData.lessonId],
            ...lessonData.progress
          }
        }
      };

    case PROGRESS_ACTIONS.COMPLETE_LESSON:
      return {
        ...state,
        lessonProgress: {
          ...state.lessonProgress,
          [action.payload.lessonId]: {
            ...state.lessonProgress[action.payload.lessonId],
            completed: true,
            completedAt: new Date().toISOString()
          }
        }
      };

    case PROGRESS_ACTIONS.UPDATE_USER_STATS:
      return {
        ...state,
        userStats: {
          ...state.userStats,
          ...action.payload
        }
      };

    case PROGRESS_ACTIONS.INCREMENT_STREAK:
      const newStreak = state.userStats.currentStreak + 1;
      return {
        ...state,
        userStats: {
          ...state.userStats,
          currentStreak: newStreak,
          longestStreak: Math.max(state.userStats.longestStreak, newStreak)
        }
      };

    case PROGRESS_ACTIONS.RESET_STREAK:
      return {
        ...state,
        userStats: {
          ...state.userStats,
          currentStreak: 0
        }
      };

    case PROGRESS_ACTIONS.ADD_CERTIFICATE:
      return {
        ...state,
        certificates: [...state.certificates, action.payload]
      };

    case PROGRESS_ACTIONS.SET_CERTIFICATES:
      return {
        ...state,
        certificates: action.payload
      };

    case PROGRESS_ACTIONS.RESET_PROGRESS:
      return initialState;

    default:
      return state;
  }
};

// Create context
const ProgressContext = createContext();

// Progress provider component
export const ProgressProvider = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        dispatch({ type: PROGRESS_ACTIONS.SET_COURSE_PROGRESS, payload: parsedProgress.courseProgress || {} });
        dispatch({ type: PROGRESS_ACTIONS.SET_LESSON_PROGRESS, payload: parsedProgress.lessonProgress || {} });
        dispatch({ type: PROGRESS_ACTIONS.UPDATE_USER_STATS, payload: parsedProgress.userStats || {} });
        dispatch({ type: PROGRESS_ACTIONS.SET_CERTIFICATES, payload: parsedProgress.certificates || [] });
      } catch (error) {
        console.error('Error loading progress from localStorage:', error);
      }
    }
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    const progressData = {
      courseProgress: state.courseProgress,
      lessonProgress: state.lessonProgress,
      userStats: state.userStats,
      certificates: state.certificates
    };
    localStorage.setItem('userProgress', JSON.stringify(progressData));
  }, [state.courseProgress, state.lessonProgress, state.userStats, state.certificates]);

  // Helper functions
  const getCourseProgress = (courseId) => {
    return state.courseProgress[courseId] || { completedLessons: [], totalLessons: 0, percentage: 0 };
  };

  const getLessonProgress = (lessonId) => {
    return state.lessonProgress[lessonId] || { watched: 0, duration: 0, completed: false };
  };

  const updateLessonProgress = (lessonId, progress) => {
    dispatch({
      type: PROGRESS_ACTIONS.UPDATE_LESSON_PROGRESS,
      payload: { lessonId, progress }
    });
  };

  const completeLesson = (lessonId, courseId) => {
    dispatch({ type: PROGRESS_ACTIONS.COMPLETE_LESSON, payload: { lessonId } });
    dispatch({ type: PROGRESS_ACTIONS.UPDATE_COURSE_PROGRESS, payload: { courseId, lessonId } });
  };

  const setCourseStructure = (courseId, totalLessons) => {
    const currentProgress = getCourseProgress(courseId);
    dispatch({
      type: PROGRESS_ACTIONS.SET_COURSE_PROGRESS,
      payload: {
        courseId,
        progress: {
          ...currentProgress,
          totalLessons
        }
      }
    });
  };

  const completeCourse = (courseId) => {
    dispatch({ type: PROGRESS_ACTIONS.COMPLETE_COURSE, payload: { courseId } });
  };

  const addCertificate = (certificate) => {
    dispatch({ type: PROGRESS_ACTIONS.ADD_CERTIFICATE, payload: certificate });
  };

  const updateUserStats = (stats) => {
    dispatch({ type: PROGRESS_ACTIONS.UPDATE_USER_STATS, payload: stats });
  };

  const incrementStreak = () => {
    dispatch({ type: PROGRESS_ACTIONS.INCREMENT_STREAK });
  };

  const resetStreak = () => {
    dispatch({ type: PROGRESS_ACTIONS.RESET_STREAK });
  };

  const resetProgress = () => {
    dispatch({ type: PROGRESS_ACTIONS.RESET_PROGRESS });
    localStorage.removeItem('userProgress');
  };

  const isLessonCompleted = (lessonId) => {
    return state.lessonProgress[lessonId]?.completed || false;
  };

  const isCourseCompleted = (courseId) => {
    const progress = getCourseProgress(courseId);
    return progress.percentage === 100;
  };

  const getTotalWatchTime = () => {
    return Object.values(state.lessonProgress).reduce((total, lesson) => {
      return total + (lesson.watched || 0);
    }, 0);
  };

  const getCompletionRate = () => {
    const totalCourses = state.userStats.totalCoursesEnrolled;
    const completedCourses = state.userStats.totalCoursesCompleted;
    return totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  };

  const value = {
    ...state,
    // Helper functions
    getCourseProgress,
    getLessonProgress,
    updateLessonProgress,
    completeLesson,
    setCourseStructure,
    completeCourse,
    addCertificate,
    updateUserStats,
    incrementStreak,
    resetStreak,
    resetProgress,
    isLessonCompleted,
    isCourseCompleted,
    getTotalWatchTime,
    getCompletionRate,
    // Dispatch for custom actions
    dispatch
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

// Custom hook to use progress context
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

// ADD THIS LINE - export the ProgressContext
export { ProgressContext };

export default ProgressContext;