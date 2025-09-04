import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, Maximize } from 'lucide-react';
import Loading from '../common/Loading';
import ProgressBar from './ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/dashboards/VideoLecture.css';

const VideoLecture = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    // Get data from navigation state or fetch from API
    if (location.state && location.state.lesson && location.state.course) {
      setLesson(location.state.lesson);
      setCourse(location.state.course);
      setLoading(false);
    } else {
      fetchLessonData();
    }
  }, [courseId, lessonId, location.state]);

  const fetchLessonData = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch course data first
      const courseResponse = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course data');
      }

      const courseData = await courseResponse.json();
      const courseInfo = courseData.data.course || courseData.data;
      setCourse(courseInfo);

      // Find the specific lesson
      let foundLesson = null;
      if (courseInfo.sections) {
        for (const section of courseInfo.sections) {
          for (const lessonItem of section.lessons || []) {
            if ((lessonItem._id || lessonItem.id) === lessonId) {
              foundLesson = lessonItem;
              break;
            }
          }
          if (foundLesson) break;
        }
      }

      if (foundLesson) {
        // Process lesson for video playback
        const lessonVideo = foundLesson.videos && foundLesson.videos.length > 0 ? foundLesson.videos[0] : null;
        
        const processedLesson = {
          id: foundLesson._id || foundLesson.id,
          title: foundLesson.title,
          description: foundLesson.description || foundLesson.content,
          videoUrl: lessonVideo ? lessonVideo.url : foundLesson.videoUrl,
          duration: foundLesson.duration || (lessonVideo ? lessonVideo.duration : 0),
          thumbnail: lessonVideo?.thumbnail?.url || foundLesson.thumbnail || courseInfo.thumbnail?.url
        };

        setLesson(processedLesson);
      } else {
        throw new Error('Lesson not found');
      }

    } catch (error) {
      console.error('Error fetching lesson data:', error);
      navigate(`/student/course/${courseId}/progress`);
    } finally {
      setLoading(false);
    }
  };

  // Update progress every 5 seconds while playing
  useEffect(() => {
    let interval;
    if (isPlaying && duration > 0) {
      interval = setInterval(() => {
        updateVideoProgress();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const updateVideoProgress = async () => {
    if (!lesson || !course || duration === 0) return;

    try {
      const token = getToken();
      if (!token) return;

      const watchPercentage = Math.round((currentTime / duration) * 100);
      setVideoProgress(watchPercentage);

      // Update backend progress
      await fetch(`http://localhost:5000/api/student/courses/${courseId}/videos/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          watchTime: Math.round(currentTime),
          completed: watchPercentage >= 90
        })
      });

    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  const handleTimeUpdate = (e) => {
    const video = e.target;
    setCurrentTime(video.currentTime);
    setDuration(video.duration);
    
    const percentage = (video.currentTime / video.duration) * 100;
    setWatchedPercentage(percentage);
  };

  const handlePlayPause = () => {
    const video = document.querySelector('.video-player video');
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time) => {
    const video = document.querySelector('.video-player video');
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume) => {
    const video = document.querySelector('.video-player video');
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goBackToCourse = () => {
    navigate(`/student/course/${courseId}/progress`);
  };

  if (loading) {
    return <Loading message="Loading video..." />;
  }

  if (!lesson || !lesson.videoUrl) {
    return (
      <div className="video-error">
        <div className="error-content">
          <h2>Video Not Available</h2>
          <p>This lesson doesn't have a video or the video is not accessible.</p>
          <button onClick={goBackToCourse} className="btn-primary">
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-lecture-container">
      {/* Video Player */}
      <div className="video-section">
        <div className="video-player">
          <video
            src={lesson.videoUrl}
            poster={lesson.thumbnail}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={(e) => {
              setDuration(e.target.duration);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              updateVideoProgress();
            }}
            controls={showControls}
            width="100%"
            height="100%"
          />
          
          {!showControls && (
            <div className="custom-controls">
              <div className="progress-bar">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => handleSeek(e.target.value)}
                  className="seek-bar"
                />
              </div>
              
              <div className="control-buttons">
                <div className="left-controls">
                  <button onClick={handlePlayPause}>
                    {isPlaying ? <Pause /> : <Play />}
                  </button>
                  <button onClick={() => handleSeek(currentTime - 10)}>
                    <SkipBack />
                  </button>
                  <button onClick={() => handleSeek(currentTime + 10)}>
                    <SkipForward />
                  </button>
                  <div className="volume-control">
                    <Volume2 />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(e.target.value)}
                    />
                  </div>
                  <span className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="right-controls">
                  <button>
                    <Settings />
                  </button>
                  <button>
                    <Maximize />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Video Info */}
        <div className="video-info">
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          
          <div className="video-meta">
            Course: {course?.title} •
            Duration: {formatTime(lesson.duration)} •
            Progress: {Math.round(watchedPercentage)}%
          </div>
          
          {/* Navigation */}
          <div className="lesson-navigation">
            <button 
              onClick={goBackToCourse}
              className="nav-button secondary"
            >
              ← Back to Course
            </button>
            
            <div className="progress-indicator">
              <ProgressBar 
                current={videoProgress} 
                total={100}
                showPercentage={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Sidebar */}
      <div className="lesson-sidebar">
        <div className="course-navigation">
          <h3>Course Content</h3>
          
          {course && course.sections && course.sections.map((section, sectionIndex) => (
            <div key={section.id || sectionIndex} className="sidebar-section">
              <h4 className="section-title">{section.title}</h4>
              
              <div className="section-lessons">
                {section.lessons.map((sidebarLesson, lessonIndex) => (
                  <div
                    key={sidebarLesson.id || lessonIndex}
                    className={`sidebar-lesson ${sidebarLesson.id === lessonId ? 'active' : ''} ${sidebarLesson.videoUrl ? 'clickable' : 'disabled'}`}
                    onClick={() => {
                      if (sidebarLesson.videoUrl && sidebarLesson.id !== lessonId) {
                        navigate(`/student/course/${courseId}/lesson/${sidebarLesson.id}`, {
                          state: { course, lesson: sidebarLesson }
                        });
                      }
                    }}
                  >
                    <div className="lesson-icon">
                      {sidebarLesson.videoUrl ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="lesson-details">
                      <span className="lesson-title">{sidebarLesson.title}</span>
                      <span className="lesson-duration">{formatTime(sidebarLesson.duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoLecture;