import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const VideoUpload = ({ videos, setVideos, courseId }) => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(new Set());

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

  // Get authentication token
  const getTokenFromStorage = () => {
    return token || 
           localStorage.getItem('token') || 
           localStorage.getItem('lms_auth_token') ||
           localStorage.getItem('auth_token') ||
           localStorage.getItem('access_token') ||
           sessionStorage.getItem('token');
  };

  // Upload individual video to backend
  const uploadVideoToBackend = async (video) => {
    if (!courseId) {
      throw new Error('Course ID is required. Please create the course first.');
    }

    const authToken = getTokenFromStorage();
    if (!authToken) {
      throw new Error('Authentication required. Please log in again.');
    }

    const formData = new FormData();
    formData.append('video', video.file);
    formData.append('title', video.title || video.file.name);
    formData.append('description', video.description || `Course video: ${video.title}`);
    formData.append('duration', (video.duration || 600).toString());
    formData.append('order', video.order.toString());

    const response = await fetch(`http://localhost:5000/api/uploads/course/${courseId}/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    return await response.json();
  };

  // Handle individual video upload
  const handleVideoUpload = async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    setUploadingVideos(prev => new Set([...prev, videoId]));

    try {
      console.log('Uploading video:', video.title);
      const result = await uploadVideoToBackend(video);
      
      // Update video state
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { 
              ...v, 
              uploaded: true, 
              pendingUpload: false,
              url: result.data?.videoUrl || result.data?.url || '',
              videoId: result.data?.video?.id || result.data?.video?._id
            }
          : v
      ));

      console.log('Video uploaded successfully:', result);
    } catch (error) {
      console.error('Video upload failed:', error);
      
      // Update video with error
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, uploadError: error.message, pendingUpload: true }
          : v
      ));
    } finally {
      setUploadingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((files) => {
    const fileList = Array.from(files);
    const validFiles = [];
    
    fileList.forEach(file => {
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      if (!allowedTypes.includes(file.type)) {
        console.warn(`Invalid file type: ${file.type} for file: ${file.name}`);
        return;
      }
      
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
    const newVideos = [];
    
    files.forEach((file, index) => {
      const videoId = generateVideoId();
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      
      const videoOrder = videos.length + index + 1;
      
      videoElement.onloadedmetadata = () => {
        const newVideo = {
          id: videoId,
          file: file,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: '',
          duration: videoElement.duration || 0,
          size: file.size,
          type: file.type,
          order: videoOrder,
          pendingUpload: true,
          uploaded: false,
          url: '',
          preview: URL.createObjectURL(file)
        };
        
        newVideos.push(newVideo);
        
        if (newVideos.length === files.length) {
          setVideos(prev => [...prev, ...newVideos]);
        }
        
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
          order: videoOrder,
          pendingUpload: true,
          uploaded: false,
          url: '',
          preview: URL.createObjectURL(file)
        };
        
        newVideos.push(newVideo);
        
        if (newVideos.length === files.length) {
          setVideos(prev => [...prev, ...newVideos]);
        }
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
      
      return newVideos.map((video, index) => ({
        ...video,
        order: index + 1
      }));
    });
  }, [setVideos]);

  // Render video item with upload functionality
  const renderVideoItem = (video, index) => {
    const isUploading = uploadingVideos.has(video.id);
    const hasError = video.uploadError;
    
    return (
      <div 
        key={video.id}
        className={`video-item ${theme === 'dark' ? 'video-item--dark' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
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
          backgroundColor: video.uploaded ? '#10b981' : theme === 'dark' ? '#1e40af' : '#3b82f6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          marginRight: '12px',
          flexShrink: 0
        }}>
          {video.uploaded ? '✓' : index + 1}
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
            disabled={isUploading}
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
            disabled={isUploading}
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
          
          {/* Status and File Info */}
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            marginTop: '4px',
            alignItems: 'center'
          }}>
            <span>⏱️ {formatDuration(video.duration)}</span>
            <span>📦 {formatFileSize(video.size)}</span>
            <span>🎬 {video.type.split('/')[1].toUpperCase()}</span>
            
            {/* Upload Status */}
            {video.uploaded ? (
              <span style={{ color: '#10b981', fontWeight: '500' }}>✅ Uploaded</span>
            ) : isUploading ? (
              <span style={{ color: '#f59e0b', fontWeight: '500' }}>⏳ Uploading...</span>
            ) : hasError ? (
              <span style={{ color: '#ef4444', fontWeight: '500' }}>❌ Failed</span>
            ) : (
              <span style={{ color: '#f59e0b', fontWeight: '500' }}>⏳ Pending Upload</span>
            )}
          </div>

          {/* Error Message */}
          {hasError && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#dc2626'
            }}>
              Error: {video.uploadError}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end'
        }}>
          {/* Upload Button - Show only if not uploaded and course exists */}
          {!video.uploaded && courseId && (
            <button
              type="button"
              onClick={() => handleVideoUpload(video.id)}
              disabled={isUploading || !video.title.trim()}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isUploading ? '#9ca3af' : '#10b981',
                color: 'white',
                cursor: isUploading || !video.title.trim() ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={!video.title.trim() ? 'Please add a title first' : 'Upload this video'}
            >
              {isUploading ? (
                <>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid transparent',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Uploading...
                </>
              ) : (
                <>
                  📤 Upload Now
                </>
              )}
            </button>
          )}

          {/* Secondary Actions */}
          <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center'
          }}>
            {/* Move Up */}
            {index > 0 && (
              <button
                type="button"
                onClick={() => moveVideo(video.id, 'up')}
                disabled={isUploading}
                style={{
                  padding: '4px 6px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  color: theme === 'dark' ? '#e5e7eb' : '#374151',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '10px'
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
                disabled={isUploading}
                style={{
                  padding: '4px 6px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  color: theme === 'dark' ? '#e5e7eb' : '#374151',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '10px'
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
                padding: '4px 6px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: theme === 'dark' ? '#1e40af' : '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontSize: '10px'
              }}
              title="Preview video"
            >
              👁️
            </button>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Remove "${video.title}" from the course?`)) {
                  removeVideo(video.id);
                }
              }}
              disabled={isUploading}
              style={{
                padding: '4px 6px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: '10px'
              }}
              title="Remove video"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

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
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📹</div>
        
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

      {/* Course ID Warning */}
      {!courseId && videos.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: theme === 'dark' ? '#7c2d12' : '#fef3c7',
          color: theme === 'dark' ? '#fbbf24' : '#92400e',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: '500' }}>Videos will be uploaded after course creation</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              Complete the course creation process first, then videos will be uploaded automatically.
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

      {/* Bulk Upload Actions */}
      {videos.length > 0 && courseId && (
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#f8fafc',
          borderRadius: '8px',
          marginTop: '16px'
        }}>
          <button
            type="button"
            onClick={async () => {
              const pendingVideos = videos.filter(v => !v.uploaded && !uploadingVideos.has(v.id));
              for (const video of pendingVideos) {
                if (video.title.trim()) {
                  await handleVideoUpload(video.id);
                }
              }
            }}
            disabled={uploadingVideos.size > 0 || videos.every(v => v.uploaded) || videos.some(v => !v.title.trim())}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: uploadingVideos.size > 0 ? '#9ca3af' : '#10b981',
              color: 'white',
              cursor: uploadingVideos.size > 0 || videos.every(v => v.uploaded) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📤 Upload All Videos
          </button>

          <div style={{
            fontSize: '12px',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            display: 'flex',
            alignItems: 'center'
          }}>
            {videos.filter(v => v.uploaded).length}/{videos.length} uploaded
          </div>
        </div>
      )}

      {/* Upload Summary */}
      {videos.length > 0 && !courseId && (
        <div style={{
          backgroundColor: theme === 'dark' ? '#065f46' : '#d1fae5',
          color: theme === 'dark' ? '#a7f3d0' : '#065f46',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginTop: '16px'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            ⏳ {videos.length} video{videos.length !== 1 ? 's' : ''} ready for upload
          </div>
          <div>
            Videos will be automatically uploaded when you submit your course.
            You can edit titles and descriptions before submitting.
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;