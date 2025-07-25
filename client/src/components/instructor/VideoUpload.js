import React, { useState, useRef } from 'react';
import useUpload from '../../hooks/useUpload'; // ✅ Correct
import Button from '../common/Button';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import '../../styles/dashboards/VideoUpload.css';

const VideoUpload = ({ videos, setVideos }) => {
  const { uploadVideo, uploading, uploadProgress } = useUpload();
  const [dragActive, setDragActive] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    duration: '',
    order: videos.length + 1
  });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoFile(e.target.files[0]);
    }
  };

  const handleVideoFile = (file) => {
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
      
      setVideoForm(prev => ({
        ...prev,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
      }));
      
      setSelectedVideo(file);
      setShowVideoModal(true);
      
      window.URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  };

  const handleVideoSubmit = async () => {
    if (!selectedVideo && !editingVideo) {
      alert('Please select a video file');
      return;
    }

    if (!videoForm.title.trim()) {
      alert('Please provide a title for the video');
      return;
    }

    try {
      let videoUrl = null;

      // Only upload if we have a new file
      if (selectedVideo) {
        videoUrl = await uploadVideo(selectedVideo, 'course-videos');
      }

      if (editingVideo) {
        // Update existing video
        setVideos(prev => prev.map(video => 
          video.id === editingVideo.id 
            ? {
                ...video,
                title: videoForm.title,
                description: videoForm.description,
                duration: videoForm.duration,
                order: videoForm.order,
                ...(videoUrl && { url: videoUrl, file: selectedVideo })
              }
            : video
        ));
      } else {
        // Add new video
        const newVideo = {
          id: Date.now(),
          title: videoForm.title,
          description: videoForm.description,
          url: videoUrl,
          duration: videoForm.duration,
          order: videoForm.order,
          file: selectedVideo
        };

        setVideos(prev => [...prev, newVideo]);
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    }
  };

  const resetForm = () => {
    setVideoForm({
      title: '',
      description: '',
      duration: '',
      order: videos.length + 1
    });
    setSelectedVideo(null);
    setEditingVideo(null);
    setShowVideoModal(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const editVideo = (video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description || '',
      duration: video.duration,
      order: video.order
    });
    setShowVideoModal(true);
  };

  const removeVideo = (videoId) => {
    if (window.confirm('Are you sure you want to remove this video?')) {
      setVideos(prev => {
        const filteredVideos = prev.filter(video => video.id !== videoId);
        // Reorder remaining videos
        return filteredVideos.map((video, index) => ({
          ...video,
          order: index + 1
        }));
      });
    }
  };

  const moveVideo = (videoId, direction) => {
    setVideos(prev => {
      const videoIndex = prev.findIndex(video => video.id === videoId);
      if (videoIndex === -1) return prev;

      const newVideos = [...prev];
      const newIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
      
      if (newIndex >= 0 && newIndex < newVideos.length) {
        [newVideos[videoIndex], newVideos[newIndex]] = [newVideos[newIndex], newVideos[videoIndex]];
        
        // Update order numbers
        newVideos.forEach((video, index) => {
          video.order = index + 1;
        });
      }
      
      return newVideos;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const previewVideo = (video) => {
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
  };

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
            <Loading size="lg" />
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
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
            {videos
              .sort((a, b) => a.order - b.order)
              .map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveVideo(video.id, 'up')}
                        disabled={index === 0}
                        className="p-1 h-6 w-6"
                      >
                        ↑
                      </Button>
                      <span className="text-xs text-gray-500">{video.order}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveVideo(video.id, 'down')}
                        disabled={index === videos.length - 1}
                        className="p-1 h-6 w-6"
                      >
                        ↓
                      </Button>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewVideo(video)}
                      title="Preview video"
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editVideo(video)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeVideo(video.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Video Details Modal */}
      <Modal
        isOpen={showVideoModal}
        onClose={resetForm}
        title={editingVideo ? "Edit Video Details" : "Video Details"}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Title *
            </label>
            <input
              type="text"
              value={videoForm.title}
              onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter video title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={videoForm.description}
              onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter video description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={videoForm.duration}
                onChange={(e) => setVideoForm(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 5:30"
                readOnly={!!selectedVideo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={videoForm.order}
                onChange={(e) => setVideoForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="1"
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

          {editingVideo && !selectedVideo && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Leave file selection empty to keep the existing video, or select a new file to replace it.
              </p>
              <label
                htmlFor="edit-video-upload"
                className="mt-2 cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Choose New Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="hidden"
                id="edit-video-upload"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetForm}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVideoSubmit}
              disabled={uploading || !videoForm.title.trim()}
            >
              {uploading ? 'Uploading...' : editingVideo ? 'Update Video' : 'Add Video'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoUpload;
