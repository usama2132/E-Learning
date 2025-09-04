import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import VideoPlayer from '../common/VideoPlayer';
import Loading from '../common/Loading';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize } from 'lucide-react';
import '../../styles/dashboards/VideoLecture.css';

const VideoLecture = () => {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lecture, setLecture] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  
  useEffect(() => {
    fetchVideoData();
  }, [videoId, courseId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        
        setCurrentTime(current);
        setDuration(total);
        
        const percentage = (current / total) * 100;
        setWatchedPercentage(percentage);
        
        // Update progress every 10 seconds
        if (current % 10 === 0) {
          updateVideoProgress(current, total);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const fetchVideoData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Try to get from navigation state first
      if (location.state?.lesson && location.state?.course) {
        setLecture(location.state.lesson);
        setCourse(location.state.course);
        setLoading(false);
        return;
      }

      // Fetch course data
      const courseResponse = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course');
      }

      const courseData = await courseResponse.json();
      if (!courseData.success) {
        throw new Error('Course not found');
      }

      const courseInfo = courseData.data.course || courseData.data;
      setCourse(courseInfo);

      // Find the specific video/lesson
      let foundLecture = null;
      
      // Search through sections and lessons
      if (courseInfo.sections) {
        for (const section of courseInfo.sections) {
          if (section.lessons) {
            foundLecture = section.lessons.find(lesson => lesson.id === videoId || lesson._id === videoId);
            if (foundLecture) break;
          }
        }
      }

      // Search through direct videos array if exists
      if (!foundLecture && courseInfo.videos) {
        foundLecture = courseInfo.videos.find(video => video.id === videoId || video._id === videoId);
      }

      if (!foundLecture) {
        throw new Error('Video not found');
      }

      setLecture(foundLecture);

    } catch (error) {
      console.error('Error fetching video data:', error);
      setError(error.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const updateVideoProgress = async (currentTime, duration) => {
    try {
      const token = getToken();
      if (!token) return;

      const percentage = (currentTime / duration) * 100;
      
      await fetch(`http://localhost:5000/api/student/courses/${courseId}/videos/${videoId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          watchTime: currentTime,
          totalTime: duration,
          completed: percentage >= 90
        })
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleFullscreen = () => {
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
      }
    }
  };

  const formatTime = (seconds) => {
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

  if (error || !lecture) {
    return (
      <div className="video-error">
        <div className="error-content">
          <h2>Unable to Load Video</h2>
          <p>{error || 'Video not found'}</p>
          <button onClick={goBackToCourse} className="btn-primary">
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-lecture">
      {/* Back Navigation */}
      <div className="video-header">
        <button onClick={goBackToCourse} className="back-button">
          ← Back to Course
        </button>
        <div className="video-title">
          <h1>{lecture.title}</h1>
          <p>{course?.title}</p>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="video-section">
        <div className="video-container">
          {lecture.videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={lecture.videoUrl}
                poster={lecture.thumbnail || course?.thumbnail}
                onLoadedMetadata={() => {
                  setDuration(videoRef.current.duration);
                  if (currentTime > 0) {
                    videoRef.current.currentTime = currentTime;
                  }
                }}
                onTimeUpdate={() => {
                  setCurrentTime(videoRef.current.currentTime);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="video-player"
              />
              
              {/* Custom Video Controls */}
              <div className="video-controls">
                <div className="progress-container">
                  <div 
                    className="progress-bar"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => handleSeek(e.target.value)}
                    className="seek-bar"
                  />
                </div>
                
                <div className="controls-row">
                  <div className="left-controls">
                    <button onClick={handlePlayPause} className="control-button">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={() => handleSeek(Math.max(0, currentTime - 10))} className="control-button">
                      <SkipBack size={20} />
                    </button>
                    <button onClick={() => handleSeek(Math.min(duration, currentTime + 10))} className="control-button">
                      <SkipForward size={20} />
                    </button>
                    <div className="volume-control">
                      <Volume2 size={20} />
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
                    <select 
                      value={playbackSpeed} 
                      onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                      className="speed-selector"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                    <button onClick={handleFullscreen} className="control-button">
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-video">
              <div className="no-video-content">
                <h3>No Video Available</h3>
                <p>This lesson doesn't have a video yet.</p>
                <button onClick={goBackToCourse} className="btn-primary">
                  Back to Course
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Lecture Info */}
        <div className="lecture-info">
          <h2>{lecture.title}</h2>
          {lecture.description && (
            <p className="lecture-description">{lecture.description}</p>
          )}
          
          <div className="lecture-meta">
            <span>Course: {course?.title}</span>
            <span>Duration: {formatTime(lecture.duration || 0)}</span>
          </div>
          
          {/* Progress Display */}
          <div className="lecture-progress">
            <div className="progress-header">
              <span>Progress: {Math.round(watchedPercentage)}%</span>
            </div>
            <div className="progress-bar-thin">
              <div 
                className="progress-fill" 
                style={{ width: `${watchedPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Navigation */}
          <div className="lecture-actions">
            <button onClick={goBackToCourse} className="btn-secondary">
              Back to Course
            </button>
          </div>
        </div>
      </div>
      
      {/* Course Context */}
      <div className="course-context">
        <h3>About this course</h3>
        <div className="context-info">
          <div className="course-thumbnail">
            {course?.thumbnail && (
              <img 
                src={typeof course.thumbnail === 'string' ? course.thumbnail : course.thumbnail.url} 
                alt={course.title}
                onError={(e) => {
                  e.target.src = '/placeholder-course.png';
                }}
              />
            )}
          </div>
          <div className="course-details">
            <h4>{course?.title}</h4>
            <p>by {course?.instructor?.name || 'Unknown Instructor'}</p>
            {course?.description && (
              <p className="course-description">{course.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLecture;