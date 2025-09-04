import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ProgressContext } from '../../context/ProgressContext';
import AuthContext from '../../context/AuthContext';
import NotificationContext from '../../context/NotificationContext';
import VideoPlayer from '../common/VideoPlayer';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ProgressBar from './ProgressBar';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, Maximize, FileText, MessageSquare, BookOpen, Star } from 'lucide-react';
import '../../styles/dashboards/VideoLecture.css';

const VideoLecture = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { updateProgress, getProgress } = useContext(ProgressContext);
  const { addNotification } = useContext(NotificationContext);
  
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  
  // Sidebar states
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [resources, setResources] = useState([]);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    // Get data from location state (passed from CourseProgress)
    if (location.state) {
      console.log('Using data from navigation state');
      setLesson(location.state.lesson);
      setCourse(location.state.course);
      setIsLoading(false);
    } else {
      // Fallback: fetch data from API
      fetchLessonData();
      fetchCourseData();
    }
    
    fetchUserProgress();
    fetchComments();
    fetchResources();
    fetchUserNotes();
  }, [lessonId, courseId, location.state]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        
        setCurrentTime(current);
        setDuration(total);
        
        const percentage = total > 0 ? (current / total) * 100 : 0;
        setWatchedPercentage(percentage);
        
        // Update progress every 10 seconds
        if (current > 0 && current % 10 < 1) {
          updateVideoProgress(current, total);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const fetchLessonData = async () => {
    try {
      console.log('Fetching lesson data for:', lessonId);
      
      // FIXED: Get lesson data from course sections
      const token = localStorage.getItem('token') || localStorage.getItem('lms_auth_token');
      
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const courseData = await response.json();
        const courseInfo = courseData.data.course || courseData.data;
        
        // Find the lesson in the course sections
        let foundLesson = null;
        if (courseInfo.sections) {
          for (const section of courseInfo.sections) {
            if (section.lessons) {
              foundLesson = section.lessons.find(l => (l.id === lessonId || l._id === lessonId));
              if (foundLesson) break;
            }
          }
        }
        
        if (foundLesson) {
          console.log('Found lesson:', foundLesson.title);
          setLesson(foundLesson);
        } else {
          console.error('Lesson not found in course');
          addNotification('Lesson not found', 'error');
          navigate(`/student/course/${courseId}/progress`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch lesson data:', error);
      addNotification('Failed to load lesson', 'error');
    }
  };

  const fetchCourseData = async () => {
    try {
      if (location.state?.course) {
        setCourse(location.state.course);
        return;
      }
      
      const token = localStorage.getItem('token') || localStorage.getItem('lms_auth_token');
      
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const courseData = await response.json();
        const courseInfo = courseData.data.course || courseData.data;
        setCourse(courseInfo);
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      if (getProgress) {
        const progress = await getProgress(courseId, lessonId);
        if (progress) {
          setCurrentTime(progress.lastWatchedTime || 0);
          setWatchedPercentage(progress.watchedPercentage || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const fetchComments = async () => {
    try {
      // Mock comments data - implement with real API later
      
        
      
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchResources = async () => {
    try {
      // Use lesson resources if available
      if (lesson?.resources && lesson.resources.length > 0) {
        setResources(lesson.resources);
      } else {
        // Fallback resources
        setResources([
          {
            id: 1,
            title: "Lesson Notes",
            type: "pdf",
            url: "#",
            size: "2.5 MB"
          },
          {
            id: 2,
            title: "Code Examples",
            type: "zip", 
            url: "#",
            size: "1.2 MB"
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const fetchUserNotes = async () => {
    try {
      // Mock user notes - implement with real API later
      setSavedNotes([
        {
          id: 1,
          timestamp: 300,
          note: "Important: Key concept explained here",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          timestamp: 600,
          note: "Remember this for the quiz",
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const updateVideoProgress = async (currentTime, duration) => {
    try {
      const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      if (updateProgress) {
        await updateProgress(courseId, lessonId, {
          lastWatchedTime: currentTime,
          watchedPercentage: percentage,
          completed: percentage >= 90
        });
      }
      
      // FIXED: Also update backend progress
      const token = localStorage.getItem('token') || localStorage.getItem('lms_auth_token');
      
      fetch(`http://localhost:5000/api/progress/courses/${courseId}/videos/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          watchTime: percentage,
          totalDuration: duration,
          completed: percentage >= 90,
          lastWatchedPosition: currentTime
        })
      }).catch(error => {
        console.error('Failed to update backend progress:', error);
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
    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSaveNote = () => {
    if (notes.trim()) {
      const newNote = {
        id: Date.now(),
        timestamp: currentTime,
        note: notes,
        createdAt: new Date().toISOString()
      };
      setSavedNotes([...savedNotes, newNote]);
      setNotes('');
      addNotification('Note saved successfully!', 'success');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: user?.name || 'Anonymous',
        avatar: user?.avatar || '/default-avatar.png',
        text: newComment,
        timestamp: new Date().toISOString(),
        replies: []
      };
      setComments([...comments, comment]);
      setNewComment('');
      addNotification('Comment added!', 'success');
    }
  };

  const handleRating = (newRating) => {
    setRating(newRating);
    setHasRated(true);
    addNotification('Rating submitted!', 'success');
  };

  const goToNextLesson = () => {
    // Find next lesson in course structure
    if (course && course.sections) {
      let found = false;
      let nextLesson = null;
      
      for (const section of course.sections) {
        for (let i = 0; i < section.lessons.length; i++) {
          if (found && section.lessons[i].videoUrl) {
            nextLesson = section.lessons[i];
            break;
          }
          if (section.lessons[i].id === lessonId) {
            found = true;
          }
        }
        if (nextLesson) break;
      }
      
      if (nextLesson) {
        navigate(`/student/course/${courseId}/lesson/${nextLesson.id}`, {
          state: { course, lesson: nextLesson, courseId }
        });
      } else {
        addNotification('This is the last lesson!', 'info');
      }
    }
  };

  const goToPrevLesson = () => {
    // Find previous lesson in course structure
    if (course && course.sections) {
      let prevLesson = null;
      
      for (const section of course.sections) {
        for (let i = 0; i < section.lessons.length; i++) {
          if (section.lessons[i].id === lessonId) {
            // Found current lesson, previous lesson should be prevLesson
            break;
          }
          if (section.lessons[i].videoUrl) {
            prevLesson = section.lessons[i];
          }
        }
      }
      
      if (prevLesson) {
        navigate(`/student/course/${courseId}/lesson/${prevLesson.id}`, {
          state: { course, lesson: prevLesson, courseId }
        });
      } else {
        addNotification('This is the first lesson!', 'info');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!lesson || !lesson.videoUrl) {
    return (
      <div className="video-lecture-error">
        <div className="error-content">
          <h2>Video Not Available</h2>
          <p>This lesson video is not available or is still being processed.</p>
          <Button 
            onClick={() => navigate(`/student/course/${courseId}/progress`)}
            className="primary"
          >
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-lecture">
      <div className="video-section">
        <div className="video-container">
          <video
            ref={videoRef}
            src={lesson.videoUrl}
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
          />
          
          {showControls && (
            <div className="video-controls">
              <div className="progress-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => handleSeek(e.target.value)}
                  className="seek-bar"
                />
              </div>
              
              <div className="controls-row">
                <div className="left-controls">
                  <button onClick={handlePlayPause}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button onClick={() => handleSeek(Math.max(0, currentTime - 10))}>
                    <SkipBack size={20} />
                  </button>
                  <button onClick={() => handleSeek(Math.min(duration, currentTime + 10))}>
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
                    onChange={(e) => handleSpeedChange(e.target.value)}
                    className="speed-selector"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                  <button onClick={handleFullscreen}>
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="lecture-info">
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <div className="lecture-meta">
            <span>Course: {course?.title}</span>
            <span>Instructor: {course?.instructor?.name}</span>
            <span>Duration: {formatTime(lesson.duration || duration)}</span>
          </div>
          
          <div className="lecture-actions">
            <Button 
              onClick={goToPrevLesson} 
              className="secondary"
            >
              Previous Lesson
            </Button>
            <Button 
              onClick={goToNextLesson}
              className="primary"
            >
              Next Lesson
            </Button>
          </div>
          
          <ProgressBar 
            current={watchedPercentage}
            total={100}
            showPercentage={true}
          />
        </div>
      </div>
      
      <div className="sidebar">
        <div className="tab-navigation">
          <button 
            className={activeTab === 'notes' ? 'active' : ''}
            onClick={() => setActiveTab('notes')}
          >
            <FileText size={16} />
            Notes
          </button>
          <button 
            className={activeTab === 'comments' ? 'active' : ''}
            onClick={() => setActiveTab('comments')}
          >
            <MessageSquare size={16} />
            Comments
          </button>
          <button 
            className={activeTab === 'resources' ? 'active' : ''}
            onClick={() => setActiveTab('resources')}
          >
            <BookOpen size={16} />
            Resources
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'notes' && (
            <div className="notes-section">
              <div className="note-editor">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes while watching..."
                  rows="4"
                />
                <Button onClick={handleSaveNote} className="primary small">
                  Save Note
                </Button>
              </div>
              
              <div className="saved-notes">
                <h4>Saved Notes</h4>
                {savedNotes.map(note => (
                  <div key={note.id} className="note-item">
                    <div className="note-timestamp">
                      <button onClick={() => handleSeek(note.timestamp)}>
                        {formatTime(note.timestamp)}
                      </button>
                    </div>
                    <p>{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'comments' && (
            <div className="comments-section">
              <div className="comment-editor">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question or share your thoughts..."
                  rows="3"
                />
                <Button onClick={handleAddComment} className="primary small">
                  Add Comment
                </Button>
              </div>
              
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <img src={comment.avatar} alt={comment.user} />
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="username">{comment.user}</span>
                        <span className="timestamp">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p>{comment.text}</p>
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="comment-reply">
                          <img src={reply.avatar} alt={reply.user} />
                          <div className="reply-content">
                            <span className="username">{reply.user}</span>
                            <p>{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div className="resources-section">
              <h4>Lesson Resources</h4>
              {resources.map(resource => (
                <div key={resource.id} className="resource-item">
                  <div className="resource-info">
                    <h5>{resource.title}</h5>
                    <span className="resource-type">{resource.type?.toUpperCase()}</span>
                    {resource.size && <span className="resource-size">{resource.size}</span>}
                  </div>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    Download
                  </a>
                </div>
              ))}
              
              <div className="rating-section">
                <h4>Rate this lesson</h4>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={`star ${star <= rating ? 'filled' : ''}`}
                      disabled={hasRated}
                    >
                      <Star size={20} fill={star <= rating ? '#ffd700' : 'none'} />
                    </button>
                  ))}
                </div>
                {hasRated && (
                  <p className="rating-confirmation">
                    Thanks for rating this lesson!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLecture;