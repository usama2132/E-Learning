import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const VideoUpload = ({ videos, setVideos, courseId }) => {
  const { getToken } = useAuth();
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [uploadingVideos, setUploadingVideos] = useState({});
  const [dragOver, setDragOver] = useState(false);

  // Generate unique ID for videos
  const generateVideoId = () => `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle file selection
  const handleFileSelect = useCallback((files) => {
    const fileList = Array.from(files);
    const validFiles = [];
    
    fileList.forEach(file => {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      if (!allowedTypes.includes(file.type)) {
        console.warn(`Invalid file type: ${file.type} for file: ${file.name}`);
        return;
      }
      
      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        console.warn(`File too large: ${file.name} (${formatFileSize(file.size)})`);
        return;
      }
      
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      processVideoFiles(validFiles);
    }
  }, []);

  // Process video files and extract metadata
  const processVideoFiles = useCallback((files) => {
    files.forEach(file => {
      const videoId = generateVideoId();
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      
      videoElement.onloadedmetadata = () => {
        const newVideo = {
          id: videoId,
          file: file,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          description: '',
          duration: videoElement.duration || 0,
          size: file.size,
          type: file.type,
          order: videos.length + 1,
          pendingUpload: true,
          uploaded: false,
          url: '',
          preview: URL.createObjectURL(file)
        };
        
        setVideos(prev => [...prev, newVideo]);
        URL.revokeObjectURL(videoElement.src);
      };
      
      videoElement.onerror = () => {
        console.error('Error loading video metadata for:', file.name);
        const newVideo = {
          id: videoId,
          file: file,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: '',
          duration: 0,
          size: file.size,
          type: file.type,
          order: videos.length + 1,
          pendingUpload: true,
          uploaded: false,
          url: '',
          preview: URL.createObjectURL(file)
        };
        
        setVideos(prev => [...prev, newVideo]);
      };
      
      videoElement.src = URL.createObjectURL(file);
    });
  }, [videos.length, setVideos]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  // Update video details
  const updateVideo = useCallback((videoId, updates) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, ...updates } : video
    ));
  }, [setVideos]);

  // Remove video
  const removeVideo = useCallback((videoId) => {
    setVideos(prev => {
      const updated = prev.filter(video => video.id !== videoId);
      // Update order for remaining videos
      return updated.map((video, index) => ({
        ...video,
        order: index + 1
      }));
    });
  }, [setVideos]);

  // Move video up/down
  const moveVideo = useCallback((videoId, direction) => {
    setVideos(prev => {
      const videoIndex = prev.findIndex(v => v.id === videoId);
      if (videoIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newVideos = [...prev];
      [newVideos[videoIndex], newVideos[newIndex]] = [newVideos[newIndex], newVideos[videoIndex]];
      
      // Update order numbers
      return newVideos.map((video, index) => ({
        ...video,
        order: index + 1
      }));
    });
  }, [setVideos]);

  // Upload individual video (if needed immediately)
  const uploadVideo = useCallback(async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video || !video.file || video.uploaded) return;

    setUploadingVideos(prev => ({ ...prev, [videoId]: { progress: 0, status: 'uploading' } }));

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const formData = new FormData();
      formData.append('video', video.file);
      formData.append('title', video.title);
      formData.append('description', video.description);
      formData.append('duration', video.duration.toString());
      formData.append('order', video.order.toString());

      console.log(`🎥 Uploading video: ${video.title} to course: ${courseId}`);

      const response = await fetch(`http://localhost:5000/api/uploads/course/${courseId}/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Video uploaded successfully:`, result);

      // Update video with upload result
      updateVideo(videoId, {
        uploaded: true,
        pendingUpload: false,
        url: result.data?.videoUrl || result.data?.url || '',
        videoId: result.data?.video?._id || result.data?._id
      });

      setUploadingVideos(prev => ({ ...prev, [videoId]: { progress: 100, status: 'completed' } }));

      // Clear upload status after delay
      setTimeout(() => {
        setUploadingVideos(prev => {
          const newState = { ...prev };
          delete newState[videoId];
          return newState;
        });
      }, 3000);

    } catch (error) {
      console.error('❌ Video upload failed:', error);
      setUploadingVideos(prev => ({ 
        ...prev, 
        [videoId]: { progress: 0, status: 'error', error: error.message } 
      }));
    }
  }, [videos, courseId, getToken, updateVideo]);

  // Render video item
  const renderVideoItem = (video, index) => {
    const uploadStatus = uploadingVideos[video.id];
    
    return (
      <div 
        key={video.id}
        className={`video-item ${theme === 'dark' ? 'video-item--dark' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
          border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
          borderRadius: '8px',
          marginBottom: '12px',
          position: 'relative'
        }}
      >
        {/* Order Number */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: theme === 'dark' ? '#1e40af' : '#3b82f6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          marginRight: '12px',
          flexShrink: 0
        }}>
          {index + 1}
        </div>

        {/* Video Preview */}
        {video.preview && (
          <video
            src={video.preview}
            style={{
              width: '80px',
              height: '45px',
              borderRadius: '4px',
              marginRight: '12px',
              objectFit: 'cover',
              flexShrink: 0
            }}
            muted
            preload="metadata"
          />
        )}

        {/* Video Info */}
        <div style={{ flex: 1, marginRight: '12px' }}>
          <input
            type="text"
            value={video.title}
            onChange={(e) => updateVideo(video.id, { title: e.target.value })}
            placeholder="Video title"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
              color: theme === 'dark' ? '#e5e7eb' : '#111827',
              marginBottom: '8px'
            }}
          />
          <textarea
            value={video.description}
            onChange={(e) => updateVideo(video.id, { description: e.target.value })}
            placeholder="Video description (optional)"
            rows="2"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '13px',
              backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
              color: theme === 'dark' ? '#e5e7eb' : '#111827',
              resize: 'vertical',
              minHeight: '60px'
            }}
          />
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            marginTop: '4px'
          }}>
            <span>⏱️ {formatDuration(video.duration)}</span>
            <span>📦 {formatFileSize(video.size)}</span>
            <span>🎬 {video.type.split('/')[1].toUpperCase()}</span>
            {video.uploaded && <span style={{ color: '#10b981' }}>✅ Ready for Upload</span>}
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div style={{
            marginRight: '12px',
            minWidth: '100px'
          }}>
            {uploadStatus.status === 'uploading' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  width: '60px',
                  height: '4px',
                  backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${uploadStatus.progress}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ fontSize: '11px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Uploading...
                </span>
              </div>
            )}
            {uploadStatus.status === 'completed' && (
              <span style={{ color: '#10b981', fontSize: '12px' }}>✅ Uploaded</span>
            )}
            {uploadStatus.status === 'error' && (
              <span style={{ color: '#ef4444', fontSize: '12px' }}>❌ Error</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Move Up */}
          {index > 0 && (
            <button
              type="button"
              onClick={() => moveVideo(video.id, 'up')}
              style={{
                padding: '6px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                color: theme === 'dark' ? '#e5e7eb' : '#374151',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Move up"
            >
              ↑
            </button>
          )}

          {/* Move Down */}
          {index < videos.length - 1 && (
            <button
              type="button"
              onClick={() => moveVideo(video.id, 'down')}
              style={{
                padding: '6px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                color: theme === 'dark' ? '#e5e7eb' : '#374151',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Move down"
            >
              ↓
            </button>
          )}

          {/* Preview Button */}
          <button
            type="button"
            onClick={() => {
              const videoElement = document.createElement('video');
              videoElement.src = video.preview;
              videoElement.controls = true;
              videoElement.style.maxWidth = '100%';
              videoElement.style.maxHeight = '400px';
              
              // Simple modal-like preview
              const modal = document.createElement('div');
              modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
              `;
              
              const closeBtn = document.createElement('button');
              closeBtn.textContent = '✕';
              closeBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                font-size: 16px;
              `;
              
              closeBtn.onclick = () => document.body.removeChild(modal);
              modal.onclick = (e) => {
                if (e.target === modal) document.body.removeChild(modal);
              };
              
              modal.appendChild(videoElement);
              modal.appendChild(closeBtn);
              document.body.appendChild(modal);
            }}
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: theme === 'dark' ? '#1e40af' : '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px'
            }}
            title="Preview video"
          >
            👁️ Preview
          </button>

          {/* Upload Now Button (if course exists) */}
          {courseId && !video.uploaded && !uploadStatus && (
            <button
              type="button"
              onClick={() => uploadVideo(video.id)}
              style={{
                padding: '6px 8px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px'
              }}
              title="Upload now"
            >
              📤 Upload
            </button>
          )}

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => {
              // Focus on title input for editing
              const titleInput = document.querySelector(`input[value="${video.title}"]`);
              if (titleInput) titleInput.focus();
            }}
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: theme === 'dark' ? '#7c2d12' : '#f59e0b',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px'
            }}
            title="Edit video details"
          >
            ✏️ Edit
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Remove "${video.title}" from the course?`)) {
                removeVideo(video.id);
              }
            }}
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px'
            }}
            title="Remove video"
          >
            🗑️ Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: 0,
          color: theme === 'dark' ? '#e5e7eb' : '#111827'
        }}>
          🎬 Course Videos
        </h4>
        <span style={{
          backgroundColor: theme === 'dark' ? '#3b82f6' : '#dbeafe',
          color: theme === 'dark' ? '#bfdbfe' : '#1e40af',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#3b82f6' : (theme === 'dark' ? '#4b5563' : '#d1d5db')}`,
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: dragOver 
            ? (theme === 'dark' ? '#1e3a8a20' : '#dbeafe20')
            : (theme === 'dark' ? '#374151' : '#f9fafb'),
          transition: 'all 0.3s ease',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{
          fontSize: '48px',
          marginBottom: '12px'
        }}>
          📹
        </div>
        
        <p style={{
          fontSize: '16px',
          fontWeight: '500',
          margin: '0 0 8px 0',
          color: theme === 'dark' ? '#e5e7eb' : '#111827'
        }}>
          {dragOver ? 'Drop videos here' : 'Choose Video Files'}
        </p>
        
        <p style={{
          fontSize: '14px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          margin: '0 0 16px 0'
        }}>
          or drag and drop video files here
        </p>
        
        <div style={{
          fontSize: '12px',
          color: theme === 'dark' ? '#6b7280' : '#9ca3af'
        }}>
          Supported formats: MP4, WebM, OGG, AVI, MOV (Max: 100MB each)
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Info Message */}
      {videos.length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
          color: theme === 'dark' ? '#bfdbfe' : '#1e40af',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <div>
            <div style={{ fontWeight: '500' }}>Videos will be uploaded to the server after the course is saved.</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              You can add multiple videos and reorder them before submitting the course.
            </div>
          </div>
        </div>
      )}

      {/* Video List */}
      {videos.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '0 4px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: theme === 'dark' ? '#e5e7eb' : '#374151'
            }}>
              Course Content ({videos.length} videos)
            </span>
            <div style={{
              fontSize: '12px',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280'
            }}>
              Total Duration: {formatDuration(videos.reduce((total, video) => total + video.duration, 0))}
            </div>
          </div>

          {videos.map((video, index) => renderVideoItem(video, index))}
        </div>
      )}

      {/* Upload Summary */}
      {videos.length > 0 && (
        <div style={{
          backgroundColor: theme === 'dark' ? '#065f46' : '#d1fae5',
          color: theme === 'dark' ? '#a7f3d0' : '#065f46',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginTop: '16px'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            ✅ {videos.length} video{videos.length !== 1 ? 's' : ''} ready for upload
          </div>
          <div>
            All videos will be automatically uploaded when you submit your course.
            You can still edit titles and descriptions before submitting.
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;