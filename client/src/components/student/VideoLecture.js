import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProgressContext } from '../../context/ProgressContext';
import  AuthContext  from '../../context/AuthContext';
import  NotificationContext from '../../context/NotificationContext';
import VideoPlayer from '../common/VideoPlayer';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ProgressBar from './ProgressBar';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, Maximize, FileText, MessageSquare, BookOpen, Star } from 'lucide-react';
import '../../styles/dashboards/VideoLecture.css';

const VideoLecture = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { updateProgress, getProgress } = useContext(ProgressContext);
  const { addNotification } = useContext(NotificationContext);
  
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lecture, setLecture] = useState(null);
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
    fetchLectureData();
    fetchCourseData();
    fetchUserProgress();
    fetchComments();
    fetchResources();
    fetchUserNotes();
  }, [lectureId, courseId]);

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

  const fetchLectureData = async () => {
    try {
      // This would typically be an API call
      // const response = await api.get(`/api/lectures/${lectureId}`);
      // setLecture(response.data);
      
      // Mock data for demonstration
      setLecture({
        id: lectureId,
        title: "Introduction to React Hooks",
        description: "Learn the fundamentals of React Hooks and how to use useState and useEffect in your applications.",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: 1800, // 30 minutes
        order: 1,
        courseId: courseId,
        transcript: "This is a sample transcript of the video lecture...",
        nextLecture: {
          id: "2",
          title: "Advanced React Hooks"
        },
        prevLecture: null
      });
    } catch (error) {
      console.error('Failed to fetch lecture data:', error);
      addNotification('Failed to load lecture', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      // Mock course data
      setCourse({
        id: courseId,
        title: "Complete React Developer Course",
        instructor: "John Doe",
        totalLectures: 25,
        completedLectures: 5
      });
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const progress = await getProgress(courseId, lectureId);
      if (progress) {
        setCurrentTime(progress.lastWatchedTime || 0);
        setWatchedPercentage(progress.watchedPercentage || 0);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const fetchComments = async () => {
    try {
      // Mock comments data
      setComments([
        {
          id: 1,
          user: "Jane Smith",
          avatar: "/default-avatar.png",
          text: "Great explanation of hooks! This really helped me understand the concept.",
          timestamp: new Date().toISOString(),
          replies: []
        },
        {
          id: 2,
          user: "Mike Johnson",
          avatar: "/default-avatar.png",
          text: "Could you explain more about the dependency array in useEffect?",
          timestamp: new Date().toISOString(),
          replies: [
            {
              id: 3,
              user: "John Doe",
              avatar: "/instructor-avatar.png",
              text: "Sure! The dependency array controls when the effect runs...",
              timestamp: new Date().toISOString()
            }
          ]
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchResources = async () => {
    try {
      // Mock resources data
      setResources([
        {
          id: 1,
          title: "React Hooks Documentation",
          type: "pdf",
          url: "/resources/react-hooks.pdf",
          size: "2.5 MB"
        },
        {
          id: 2,
          title: "Code Examples",
          type: "zip",
          url: "/resources/hooks-examples.zip",
          size: "1.2 MB"
        },
        {
          id: 3,
          title: "Additional Reading",
          type: "link",
          url: "https://reactjs.org/docs/hooks-intro.html",
          size: null
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const fetchUserNotes = async () => {
    try {
      // Mock user notes
      setSavedNotes([
        {
          id: 1,
          timestamp: 300,
          note: "Important: useState returns an array with current value and setter function",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          timestamp: 600,
          note: "useEffect cleanup function prevents memory leaks",
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const updateVideoProgress = async (currentTime, duration) => {
    try {
      const percentage = (currentTime / duration) * 100;
      await updateProgress(courseId, lectureId, {
        lastWatchedTime: currentTime,
        watchedPercentage: percentage,
        completed: percentage >= 90
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

  const goToNextLecture = () => {
    if (lecture?.nextLecture) {
      navigate(`/courses/${courseId}/lectures/${lecture.nextLecture.id}`);
    }
  };

  const goToPrevLecture = () => {
    if (lecture?.prevLecture) {
      navigate(`/courses/${courseId}/lectures/${lecture.prevLecture.id}`);
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

  return (
    <div className="video-lecture">
      <div className="video-section">
        <div className="video-container">
          <video
            ref={videoRef}
            src={lecture?.videoUrl}
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
                  style={{ width: `${(currentTime / duration) * 100}%` }}
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
                  <button onClick={() => handleSeek(currentTime - 10)}>
                    <SkipBack size={20} />
                  </button>
                  <button onClick={() => handleSeek(currentTime + 10)}>
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
          <h1>{lecture?.title}</h1>
          <p>{lecture?.description}</p>
          <div className="lecture-meta">
            <span>Course: {course?.title}</span>
            <span>Instructor: {course?.instructor}</span>
            <span>Duration: {formatTime(lecture?.duration || 0)}</span>
          </div>
          
          <div className="lecture-actions">
            <Button 
              onClick={goToPrevLecture} 
              disabled={!lecture?.prevLecture}
              className="secondary"
            >
              Previous Lecture
            </Button>
            <Button 
              onClick={goToNextLecture}
              disabled={!lecture?.nextLecture}
              className="primary"
            >
              Next Lecture
            </Button>
          </div>
          
          <ProgressBar 
            current={course?.completedLectures || 0}
            total={course?.totalLectures || 1}
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
              <h4>Lecture Resources</h4>
              {resources.map(resource => (
                <div key={resource.id} className="resource-item">
                  <div className="resource-info">
                    <h5>{resource.title}</h5>
                    <span className="resource-type">{resource.type.toUpperCase()}</span>
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
                <h4>Rate this lecture</h4>
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
                    Thanks for rating this lecture!
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
