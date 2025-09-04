import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const VideoUpload = ({ videos, setVideos, courseId }) => {
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(new Set());

  // Get authentication token from multiple sources
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

  // FIXED: Upload video with correct endpoint and required fields
  const uploadVideoToBackend = async (video) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    if (!courseId) {
      throw new Error('Course ID is required for video upload.');
    }

    const formData = new FormData();
    formData.append('video', video.file);
    formData.append('title', video.title || video.file.name.replace(/\.[^/.]+$/, ''));
    formData.append('description', video.description || `Video lesson for ${video.title}`);
    formData.append('duration', video.duration?.toString() || '600');
    formData.append('order', video.order?.toString() || '1');

    console.log('Uploading video:', {
      courseId,
      title: video.title,
      fileName: video.file.name,
      fileSize: video.file.size,
      fileType: video.file.type
    });

    // FIXED: Use correct backend endpoint format
    const response = await fetch(`http://localhost:5000/api/uploads/course/${courseId}/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData - let browser set it
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Upload failed';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || `Server error: ${response.status}`;
      }
      
      console.error('Upload failed:', response.status, errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  };

  // Handle file selection with validation
  const handleFileSelect = useCallback((files) => {
    const fileList = Array.from(files);
    const validFiles = [];
    const errors = [];
    
    fileList.forEach(file => {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Invalid file type: ${file.name} (${file.type})`);
        return;
      }
      
      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`File too large: ${file.name} (${formatFileSize(file.size)}). Max size: 100MB`);
        return;
      }
      
      // Check for duplicates
      const isDuplicate = videos.some(v => v.file && v.file.name === file.name && v.file.size === file.size);
      if (isDuplicate) {
        errors.push(`Duplicate file: ${file.name}`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      processVideoFiles(validFiles);
    }
  }, [videos]);

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
          duration: Math.round(videoElement.duration) || 600,
          size: file.size,
          type: file.type,
          order: videoOrder,
          pendingUpload: true,
          uploaded: false,
          uploading: false,
          uploadError: null,
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
          duration: 600, // Default duration
          size: file.size,
          type: file.type,
          order: videoOrder,
          pendingUpload: true,
          uploaded: false,
          uploading: false,
          uploadError: null,
          url: '',
          preview: URL.createObjectURL(file)
        };
        
        setVideos(prev => [...prev, newVideo]);
      };
      
      videoElement.src = URL.createObjectURL(file);
    });
  }, [videos.length, setVideos]);

  // FIXED: Upload individual video with better error handling
  const uploadVideo = async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video || !video.file || video.uploaded || video.uploading) {
      return;
    }

    // Validate required fields
    if (!video.title || video.title.trim() === '') {
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, uploadError: 'Video title is required' }
          : v
      ));
      return;
    }

    if (!courseId) {
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, uploadError: 'Course ID is missing' }
          : v
      ));
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
      
      // Handle successful upload
      if (result.success) {
        console.log('Upload successful:', result);

        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { 
                ...v, 
                uploaded: true, 
                uploading: false,
                pendingUpload: false,
                uploadError: null,
                url: result.data?.videoUrl || result.videoUrl || '',
                videoId: result.data?.video?.id || result.data?.id,
                backendId: result.data?.video?.id || result.data?.id
              }
            : v
        ));
      } else {
        throw new Error(result.message || 'Upload failed');
      }

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
    const videoToRemove = videos.find(v => v.id === videoId);
    if (videoToRemove && videoToRemove.preview) {
      URL.revokeObjectURL(videoToRemove.preview);
    }
    
    setVideos(prev => {
      const updated = prev.filter(video => video.id !== videoId);
      return updated.map((video, index) => ({
        ...video,
        order: index + 1
      }));
    });
  }, [setVideos, videos]);

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

  // Upload all videos
  const uploadAllVideos = async () => {
    const pendingVideos = videos.filter(v => v.pendingUpload && !v.uploading && v.file && v.title?.trim());
    
    if (pendingVideos.length === 0) {
      alert('No videos ready for upload. Please add videos and ensure they have titles.');
      return;
    }

    console.log(`Starting upload of ${pendingVideos.length} videos...`);
    
    // Upload videos sequentially to avoid overwhelming the server
    for (const video of pendingVideos) {
      try {
        await uploadVideo(video.id);
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to upload ${video.title}:`, error);
      }
    }
  };

  // Render video item
  const renderVideoItem = (video, index) => {
    const isUploading = uploadingVideos.has(video.id);
    const hasError = !!video.uploadError;
    const canUpload = !video.uploaded && !isUploading && video.file && courseId && video.title?.trim();

    return (
      <div 
        key={video.id}
        className={`video-item ${theme === 'dark' ? 'video-item--dark' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
          border: `1px solid ${hasError ? '#ef4444' : (theme === 'dark' ? '#4b5563' : '#e5e7eb')}`,
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
          backgroundColor: video.uploaded ? '#10b981' : 
                          isUploading ? '#f59e0b' :
                          hasError ? '#ef4444' :
                          (theme === 'dark' ? '#1e40af' : '#3b82f6'),
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          marginRight: '12px',
          flexShrink: 0
        }}>
          {video.uploaded ? '✓' : 
           isUploading ? '⏳' :
           hasError ? '✗' : index + 1}
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
            placeholder="Video title (required)"
            disabled={isUploading}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${!video.title?.trim() ? '#ef4444' : (theme === 'dark' ? '#4b5563' : '#d1d5db')}`,
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
            marginTop: '4px',
            flexWrap: 'wrap'
          }}>
            <span>⏱️ {formatDuration(video.duration)}</span>
            <span>📦 {formatFileSize(video.size)}</span>
            <span>🎬 {video.type.split('/')[1].toUpperCase()}</span>
            <span style={{ 
              color: video.uploaded ? '#10b981' : 
                     isUploading ? '#f59e0b' : 
                     hasError ? '#ef4444' : '#f59e0b',
              fontWeight: '500'
            }}>
              {video.uploaded ? '✅ Uploaded' : 
               isUploading ? '⏳ Uploading...' : 
               hasError ? '❌ Failed' : '⏳ Pending'}
            </span>
          </div>
          
          {hasError && (
            <div style={{
              fontSize: '11px',
              color: '#ef4444',
              marginTop: '4px',
              fontStyle: 'italic',
              backgroundColor: theme === 'dark' ? '#7f1d1d20' : '#fef2f2',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              ❌ Error: {video.uploadError}
            </div>
          )}
          
          {!video.title?.trim() && (
            <div style={{
              fontSize: '11px',
              color: '#f59e0b',
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              ⚠️ Title is required for upload
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Upload Button */}
          {canUpload && (
            <button
              type="button"
              onClick={() => uploadVideo(video.id)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
              title="Upload video"
            >
              📤 Upload
            </button>
          )}

          {/* Retry Button */}
          {hasError && !isUploading && (
            <button
              type="button"
              onClick={() => uploadVideo(video.id)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#f59e0b',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
              title="Retry upload"
            >
              🔄 Retry
            </button>
          )}

          {/* Move Buttons */}
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
                if (window.confirm(`Remove "${video.title || 'this video'}" from the course?`)) {
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
                fontSize: '12px'
              }}
              title="Remove video"
            >
              🗑️
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

      {/* Course ID Check */}
      {!courseId && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef3cd',
          color: '#92400e',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fbbf24'
        }}>
          ⚠️ Course ID is required for video upload. Please save the course first.
        </div>
      )}

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
          Supported: MP4, WebM, OGG, AVI, MOV (Max: 100MB each)
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/avi,video/mov,video/quicktime"
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>

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
              Total Duration: {formatDuration(videos.reduce((total, video) => total + (video.duration || 0), 0))}
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
              📤 {videos.filter(v => v.pendingUpload && v.title?.trim()).length} videos ready for upload
            </div>
            <div>
              {videos.filter(v => !v.title?.trim()).length > 0 && 
                `${videos.filter(v => !v.title?.trim()).length} videos need titles. `}
              Upload videos individually or all at once.
            </div>
          </div>
          
          <button
            type="button"
            onClick={uploadAllVideos}
            disabled={videos.filter(v => v.pendingUpload && v.title?.trim()).length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: videos.filter(v => v.pendingUpload && v.title?.trim()).length === 0 ? '#6b7280' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: videos.filter(v => v.pendingUpload && v.title?.trim()).length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            📤 Upload All ({videos.filter(v => v.pendingUpload && v.title?.trim()).length})
          </button>
        </div>
      )}

      {/* Help Message */}
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
            <div style={{ fontWeight: '500' }}>Add videos to your course</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              Upload video files and they'll be processed automatically. Make sure each video has a title before uploading.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;