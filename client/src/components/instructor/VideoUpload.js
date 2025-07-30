import React, { useState, useRef, useCallback, useMemo } from 'react';
import useUpload from '../../hooks/useUpload';
import '../../styles/dashboards/VideoUpload.css';

// ISOLATED FORM COMPONENT - This prevents parent re-renders from affecting inputs
const VideoFormModal = React.memo(({ 
  isOpen, 
  onClose, 
  title, 
  initialData, 
  onSubmit, 
  selectedVideo, 
  formatFileSize, 
  uploading,
  onFileSelect 
}) => {
  // LOCAL STATE - Only this component controls these inputs
  const [localForm, setLocalForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || '',
    order: initialData?.order || 1
  });

  // Update local state when modal opens with new data
  React.useEffect(() => {
    if (isOpen && initialData) {
      setLocalForm({
        title: initialData.title || '',
        description: initialData.description || '',
        duration: initialData.duration || '',
        order: initialData.order || 1
      });
    }
  }, [isOpen, initialData]);

  // STABLE input handlers - never recreated
  const handleInputChange = useCallback((field) => (e) => {
    const value = field === 'order' ? parseInt(e.target.value) || 1 : e.target.value;
    setLocalForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(localForm);
  }, [localForm, onSubmit]);

  const handleClose = useCallback(() => {
    setLocalForm({
      title: '',
      description: '',
      duration: '',
      order: 1
    });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={handleClose}
        />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={localForm.title}
                  onChange={handleInputChange('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter video title"
                  autoComplete="off"
                  autoFocus={false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={localForm.description}
                  onChange={handleInputChange('description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter video description (optional)"
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={localForm.duration}
                    onChange={handleInputChange('duration')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5:30"
                    readOnly={!!selectedVideo}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={localForm.order}
                    onChange={handleInputChange('order')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    autoComplete="off"
                  />
                </div>
              </div>

              {selectedVideo && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <h6 className="text-sm font-medium text-blue-900 mb-1">Selected File:</h6>
                  <p className="text-sm text-blue-700">{selectedVideo.name}</p>
                  <p className="text-xs text-blue-600">Size: {formatFileSize(selectedVideo.size)}</p>
                </div>
              )}

              {initialData && !selectedVideo && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">
                    Leave file selection empty to keep the existing video, or select a new file to replace it.
                  </p>
                  <label
                    htmlFor="edit-video-upload-isolated"
                    className="cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Choose New Video
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={onFileSelect}
                    className="hidden"
                    id="edit-video-upload-isolated"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading || !localForm.title.trim()}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    uploading || !localForm.title.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploading ? 'Uploading...' : (initialData ? 'Update Video' : 'Add Video')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const VideoUpload = ({ videos, setVideos }) => {
  const { uploadVideo, uploading, uploadProgress } = useUpload();
  const [dragActive, setDragActive] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const fileInputRef = useRef(null);

  // Memoize handlers to prevent recreation
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoFile(e.target.files[0]);
    }
  }, []);

  const handleVideoFile = useCallback((file) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid video file (MP4, WebM, OGG, AVI, MOV)');
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('Video file size must be less than 100MB');
      return;
    }

    // Get video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      
      setSelectedVideo({
        file,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        title: file.name.replace(/\.[^/.]+$/, '')
      });
      setShowVideoModal(true);
      
      window.URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  }, []);

  const handleModalSubmit = useCallback(async (formData) => {
    if (!selectedVideo && !editingVideo) {
      alert('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please provide a title for the video');
      return;
    }

    try {
      let videoUrl = null;

      // Only upload if we have a new file
      if (selectedVideo?.file) {
        videoUrl = await uploadVideo(selectedVideo.file, 'course-videos');
      }

      if (editingVideo) {
        // Update existing video
        setVideos(prev => prev.map(video => 
          video.id === editingVideo.id 
            ? {
                ...video,
                ...formData,
                ...(videoUrl && { url: videoUrl, file: selectedVideo.file })
              }
            : video
        ));
      } else {
        // Add new video
        const newVideo = {
          id: Date.now(),
          ...formData,
          url: videoUrl,
          file: selectedVideo.file
        };

        setVideos(prev => [...prev, newVideo]);
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    }
  }, [selectedVideo, editingVideo, uploadVideo, setVideos]);

  const resetForm = useCallback(() => {
    setSelectedVideo(null);
    setEditingVideo(null);
    setShowVideoModal(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const editVideo = useCallback((video) => {
    setEditingVideo(video);
    setSelectedVideo(null);
    setShowVideoModal(true);
  }, []);

  const removeVideo = useCallback((videoId) => {
    if (window.confirm('Are you sure you want to remove this video?')) {
      setVideos(prev => {
        const filteredVideos = prev.filter(video => video.id !== videoId);
        return filteredVideos.map((video, index) => ({
          ...video,
          order: index + 1
        }));
      });
    }
  }, [setVideos]);

  const moveVideo = useCallback((videoId, direction) => {
    setVideos(prev => {
      const videoIndex = prev.findIndex(video => video.id === videoId);
      if (videoIndex === -1) return prev;

      const newVideos = [...prev];
      const newIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
      
      if (newIndex >= 0 && newIndex < newVideos.length) {
        [newVideos[videoIndex], newVideos[newIndex]] = [newVideos[newIndex], newVideos[videoIndex]];
        
        newVideos.forEach((video, index) => {
          video.order = index + 1;
        });
      }
      
      return newVideos;
    });
  }, [setVideos]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const previewVideo = useCallback((video) => {
    if (video.url) {
      window.open(video.url, '_blank');
    } else if (video.file) {
      const url = URL.createObjectURL(video.file);
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Video Preview</title></head>
          <body style="margin:0; padding:20px; background:#000;">
            <video controls style="width:100%; max-width:800px;">
              <source src="${url}" type="${video.file.type}">
              Your browser does not support the video tag.
            </video>
          </body>
        </html>
      `);
    }
  }, []);

  // Memoized components
  const LoadingSpinner = useMemo(() => React.memo(({ size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };

    return (
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
    );
  }), []);

  // Prepare modal data
  const modalData = useMemo(() => {
    if (editingVideo) {
      return editingVideo;
    }
    if (selectedVideo) {
      return {
        title: selectedVideo.title,
        description: '',
        duration: selectedVideo.duration,
        order: videos.length + 1
      };
    }
    return {
      title: '',
      description: '',
      duration: '',
      order: videos.length + 1
    };
  }, [editingVideo, selectedVideo, videos.length]);

  // Stable sorted videos
  const sortedVideos = useMemo(() => 
    videos.sort((a, b) => a.order - b.order), 
    [videos]
  );

  return (
    <div className="video-upload">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Course Videos</h4>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileInput}
          className="hidden"
          id="video-upload"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-4">
            <LoadingSpinner size="lg" />
            <div>
              <p className="text-sm text-gray-600 mb-2">Uploading video...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            <div className="space-y-2">
              <label
                htmlFor="video-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Choose Video Files
              </label>
              <p className="text-sm text-gray-500">
                or drag and drop video files here
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: MP4, WebM, OGG, AVI, MOV (Max: 100MB each)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video List */}
      {videos.length > 0 && (
        <div className="mt-6">
          <h5 className="text-md font-medium text-gray-900 mb-3">
            Course Videos ({videos.length})
          </h5>
          
          <div className="space-y-3">
            {sortedVideos.map((video, index) => (
              <div
                key={video.id} // Stable key
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => moveVideo(video.id, 'up')}
                      disabled={index === 0}
                      className={`p-1 h-6 w-6 text-xs border rounded ${
                        index === 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      ↑
                    </button>
                    <span className="text-xs text-gray-500">{video.order}</span>
                    <button
                      onClick={() => moveVideo(video.id, 'down')}
                      disabled={index === videos.length - 1}
                      className={`p-1 h-6 w-6 text-xs border rounded ${
                        index === videos.length - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      ↓
                    </button>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div 
                      className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                      onClick={() => previewVideo(video)}
                      title="Click to preview video"
                    >
                      <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h6 className="text-sm font-medium text-gray-900 truncate">
                      {video.title}
                    </h6>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Duration: {video.duration}</span>
                      {video.file && (
                        <span>Size: {formatFileSize(video.file.size)}</span>
                      )}
                      {video.url && (
                        <span className="text-green-600">Uploaded</span>
                      )}
                    </div>
                    {video.description && (
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => previewVideo(video)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    title="Preview video"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => editVideo(video)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeVideo(video.id)}
                    className="px-3 py-1 text-sm border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Isolated Video Form Modal */}
      <VideoFormModal
        isOpen={showVideoModal}
        onClose={resetForm}
        title={editingVideo ? "Edit Video Details" : "Video Details"}
        initialData={modalData}
        onSubmit={handleModalSubmit}
        selectedVideo={selectedVideo?.file}
        formatFileSize={formatFileSize}
        uploading={uploading}
        onFileSelect={handleFileInput}
      />
    </div>
  );
};

export default VideoUpload;