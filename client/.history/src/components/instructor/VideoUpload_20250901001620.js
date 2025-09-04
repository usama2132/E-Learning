import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const VideoUpload = ({ videos, setVideos, courseId }) => {
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(new Set());

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('lms_auth_token') ||
           localStorage.getItem('access_token') ||
           sessionStorage.getItem('token');
  };

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

  // FIXED: Upload video to backend
  const uploadVideoToBackend = async (video) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const formData = new FormData();
    formData.append('video', video.file);
    formData.append('title', video.title || video.file.name.replace(/\.[^/.]+$/, ''));
    formData.append('description', video.description || `Video lesson: ${video.title}`);
    formData.append('duration', video.duration.toString());
    formData.append('order', video.order.toString());

    console.log('Uploading video to backend:', {
      courseId,
      title: video.title,
      size: video.file.size
    });

    const response = await fetch(`http://localhost:5000/api/uploads/course/${courseId}/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
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
          uploading: false,
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
          order: videoOrder,
          pendingUpload: true,
          uploaded: false,
          uploading: false,
          url: '',
          preview: URL.createObjectURL(file)
        };
        
        setVideos(prev => [...prev, newVideo]);
      };
      
      videoElement.src = URL.createObjectURL(file);
    });
  }, [videos.length, setVideos]);

  // FIXED: Upload individual video
  const uploadVideo = async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video || !video.file || video.uploaded || video.uploading) {
      return;
    }

    console.log('Starting upload for video:', video.title);

    // Update video state to uploading
    setVideos(prev => prev.map(v => 
      v.id === videoId 
        ? { ...v, uploading: true, pendingUpload: false, uploadError: null }
        : v
    ));

    setUploadingVideos(prev => new Set([...prev, videoId]));

    try {
      const result = await uploadVideoToBackend(video);
      console.log('Upload successful:', result);

      // Update video with success
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { 
              ...v, 
              uploaded: true, 
              uploading: false,
              pendingUpload: false,
              url: result.data?.videoUrl || result.videoUrl || '',
              videoId: result.data?.video?.id || result.data?.id
            }
          : v
      ));

    } catch (error) {
      console.error('Upload failed:', error);
      
      // Update video with error
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { 
              ...v, 
              uploading: false, 
              pendingUpload: true,
              uploadError: error.message 
            }
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
    const canUpload = !video.uploaded && !isUploading && video.file && courseId;

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
          backgroundColor: video.uploaded ? '#10b981' : (theme === 'dark' ? '#1e40af' : '#3b82f6'),
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
              marginBottom: '8px',
              opacity: isUploading ? 0.7 : 1
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
              minHeight: '60px',
              opacity: isUploading ? 0.7 : 1
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
            <span style={{ 
              color: video.uploaded ? '#10b981' : 
                     isUploading ? '#f59e0b' : 
                     video.uploadError ? '#ef4444' : '#f59e0b' 
            }}>
              {video.uploaded ? '✅ Uploaded' : 
               isUploading ? '⏳ Uploading...' : 
               video.uploadError ? '❌ Failed' : '⏳ Pending Upload'}
            </span>
          </div>
          {video.uploadError && (
            <div style={{
              fontSize: '11px',
              color: '#ef4444',
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              Error: {video.uploadError}
            </div>
          )}
        </div>

        // Update the renderVideoItem function - replace the existing Action Buttons section with this:

{/* Action Buttons */}
<div style={{
  display: 'flex',
  gap: '8px',
  alignItems: 'center'
}}>
  {/* Upload Button - Show for pending uploads */}
  {video.pendingUpload && !isUploading && video.file && (
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
      title="Upload video"
    >
      📤 Upload
    </button>
  )}

  {/* Retry Button */}
  {video.uploadError && (
    <button
      type="button"
      onClick={() => uploadVideo(video.id)}
      style={{
        padding: '6px 8px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#f59e0b',
        color: 'white',
        cursor: 'pointer',
        fontSize: '11px'
      }}
      title="Retry upload"
    >
      🔄 Retry
    </button>
  )}

  {/* Move Up */}
  {index > 0 && !isUploading && (
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
        fontSize: '12px'
      }}
      title="Move up"
    >
      ↑
    </button>
  )}

  {/* Move Down */}
  {index < videos.length - 1 && !isUploading && (
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
        fontSize: '12px'
      }}
      title="Move down"
    >
      ↓
    </button>
  )}

  {/* Remove Button */}
  {!isUploading && (
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
  )}
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
            <div style={{ fontWeight: '500' }}>Upload videos for your course</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              Add videos here and upload them individually or all at once.
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

      {/* Bulk Upload Controls */}
      {videos.length > 0 && courseId && (
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          backgroundColor: theme === 'dark' ? '#065f46' : '#d1fae5',
          borderRadius: '8px',
          marginTop: '16px'
        }}>
          <div style={{
            color: theme === 'dark' ? '#a7f3d0' : '#065f46',
            fontSize: '13px'
          }}>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              📤 {videos.filter(v => !v.uploaded).length} videos ready for upload
            </div>
            <div>
              Upload videos individually or all at once before submitting your course.
            </div>
          </div>
          
          <button
            type="button"
            onClick={async () => {
              const pendingVideos = videos.filter(v => !v.uploaded && !v.uploading && v.file);
              for (const video of pendingVideos) {
                await uploadVideo(video.id);
              }
            }}
            disabled={videos.filter(v => !v.uploaded && !v.uploading).length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500',
              opacity: videos.filter(v => !v.uploaded && !v.uploading).length === 0 ? 0.5 : 1
            }}
          >
            📤 Upload All
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;