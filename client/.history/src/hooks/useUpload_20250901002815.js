import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

const useUpload = () => {
  const { token, user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Get auth token from multiple sources
  const getAuthToken = () => {
    return token || 
           localStorage.getItem('token') || 
           localStorage.getItem('lms_auth_token') ||
           localStorage.getItem('access_token') ||
           sessionStorage.getItem('token');
  };

    // FIXED: Upload video with correct endpoint and validation
  const uploadVideo = useCallback(async (videoFile, courseId, metadata = {}) => {
    if (!user || !getAuthToken()) {
      throw new Error('Authentication required for video upload');
    }

    if (!videoFile) {
      throw new Error('Video file is required');
    }

    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
    if (!validTypes.includes(videoFile.type)) {
      throw new Error(`Invalid video format. Supported: ${validTypes.join(', ')}`);
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024;
    if (videoFile.size > maxSize) {
      throw new Error('Video file too large. Maximum size: 100MB');
    }

    // Validate required metadata
    if (!metadata.title || metadata.title.trim() === '') {
      throw new Error('Video title is required');
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('Starting video upload:', {
        courseId,
        fileName: videoFile.name,
        fileSize: videoFile.size,
        fileType: videoFile.type,
        title: metadata.title
      });

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', metadata.title.trim());
      formData.append('description', metadata.description?.trim() || '');
      formData.append('duration', metadata.duration?.toString() || '600');
      formData.append('order', metadata.order?.toString() || '1');

      const authToken = getAuthToken();
      console.log('Using auth token:', authToken ? 'Present' : 'Missing');

      // FIXED: Use correct backend endpoint format
      const response = await fetch(`http://localhost:5000/api/uploads/course/${courseId}/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          // Don't set Content-Type for FormData - let browser handle it
        },
        body: formData
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('❌ Server error response:', errorData);
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || `Server error: ${response.status}`;
          console.error('❌ Raw error response:', errorText);
        }

        // Handle specific status codes
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Permission denied. You may not have instructor access.');
        } else if (response.status === 404) {
          throw new Error('Course not found or upload endpoint unavailable.');
        } else if (response.status === 413) {
          throw new Error('File too large for server.');
        } else if (response.status === 422) {
          throw new Error(`Validation error: ${errorMessage}`);
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Upload successful:', responseData);

      if (responseData.success) {
        setUploadProgress(100);
        return {
          success: true,
          url: responseData.data?.videoUrl || responseData.videoUrl,
          videoId: responseData.data?.video?.id || responseData.data?.id,
          data: responseData.data
        };
      } else {
        throw new Error(responseData.message || 'Upload failed');
      }

    } catch (error) {
      console.error('💥 Upload error:', error);
      setError(error.message);
      
      // Re-throw with context
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    } finally {
      setUploading(false);
    }
  }, [user, token]);

  // Upload image (profile, thumbnail, etc.)
  const uploadImage = useCallback(async (imageFile, type = 'general', targetId = null) => {
    const authToken = getAuthToken();
    if (!authToken) {
      throw new Error('Authentication required for image upload');
    }

    if (!imageFile) {
      throw new Error('Image file is required');
    }

    // Validate image file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      throw new Error(`Invalid image format. Supported: ${validTypes.join(', ')}`);
    }

    // Validate file size (5MB limit for images)
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      throw new Error('Image file too large. Maximum size: 5MB');
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('🖼️ Starting image upload:', {
        type,
        targetId,
        fileName: imageFile.name,
        fileSize: imageFile.size
      });

      const formData = new FormData();
      
      // Determine endpoint based on type
      let endpoint = '';
      let fieldName = '';
      
      switch (type) {
        case 'profile':
          endpoint = '/uploads/profile';
          fieldName = 'profileImage';
          break;
        case 'thumbnail':
          if (!targetId) throw new Error('Course ID required for thumbnail upload');
          endpoint = `/uploads/course/${targetId}/thumbnail`;
          fieldName = 'thumbnail';
          break;
        default:
          endpoint = '/uploads/image';
          fieldName = 'image';
      }

      formData.append(fieldName, imageFile);

      const response = await fetch(`http://localhost:5000/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Image upload failed: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Image upload successful:', responseData);

      setUploadProgress(100);
      return {
        success: true,
        url: responseData.data?.imageUrl || responseData.data?.thumbnailUrl || responseData.url,
        publicId: responseData.data?.publicId || responseData.publicId,
        data: responseData.data
      };

    } catch (error) {
      console.error('💥 Image upload error:', error);
      setError(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  // Upload document/material
  const uploadDocument = useCallback(async (documentFile, courseId, metadata = {}) => {
    const authToken = getAuthToken();
    if (!authToken) {
      throw new Error('Authentication required for document upload');
    }

    if (!documentFile) {
      throw new Error('Document file is required');
    }

    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // Validate document file
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    
    if (!validTypes.includes(documentFile.type)) {
      throw new Error('Invalid document format. Supported: PDF, DOC, DOCX, PPT, PPTX, TXT');
    }

    // Validate file size (10MB limit for documents)
    const maxSize = 10 * 1024 * 1024;
    if (documentFile.size > maxSize) {
      throw new Error('Document file too large. Maximum size: 10MB');
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('📄 Starting document upload:', {
        courseId,
        fileName: documentFile.name,
        fileSize: documentFile.size
      });

      const formData = new FormData();
      formData.append('material', documentFile);
      formData.append('title', metadata.title || documentFile.name);
      formData.append('description', metadata.description || '');

      const response = await fetch(`http://localhost:5000/api/uploads/course/${courseId}/material`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Document upload failed: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Document upload successful:', responseData);

      setUploadProgress(100);
      return {
        success: true,
        url: responseData.data?.fileUrl || responseData.url,
        publicId: responseData.data?.publicId || responseData.publicId,
        data: responseData.data
      };

    } catch (error) {
      console.error('💥 Document upload error:', error);
      setError(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  // Delete file
  const deleteFile = useCallback(async (publicId, resourceType = 'image') => {
    const authToken = getAuthToken();
    if (!authToken) {
      throw new Error('Authentication required for file deletion');
    }

    if (!publicId) {
      throw new Error('Public ID is required');
    }

    try {
      console.log('🗑️ Deleting file:', publicId);

      const response = await fetch(`http://localhost:5000/api/uploads/file/${publicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resourceType })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'File deletion failed');
      }

      const responseData = await response.json();
      console.log('✅ File deleted successfully:', responseData);

      return { success: true, data: responseData.data };

    } catch (error) {
      console.error('💥 File deletion error:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Get upload progress (for chunked uploads)
  const getUploadProgress = useCallback(async (uploadId) => {
    const authToken = getAuthToken();
    if (!authToken) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`http://localhost:5000/api/uploads/progress/${uploadId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get upload progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting upload progress:', error);
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset progress
  const resetProgress = useCallback(() => {
    setUploadProgress(0);
  }, []);

  // Reset all states
  const resetUploadState = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  // Utility functions
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const isValidVideoFile = useCallback((file) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
    return validTypes.includes(file.type);
  }, []);

  const isValidImageFile = useCallback((file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }, []);

  const isValidDocumentFile = useCallback((file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    return validTypes.includes(file.type);
  }, []);

  const getFileExtension = useCallback((filename) => {
    return filename.split('.').pop().toLowerCase();
  }, []);

  const validateFileSize = useCallback((file, type = 'video') => {
    const maxSizes = {
      video: 100 * 1024 * 1024, // 100MB
      image: 5 * 1024 * 1024,   // 5MB
      document: 10 * 1024 * 1024 // 10MB
    };
    
    return file.size <= (maxSizes[type] || maxSizes.video);
  }, []);

  return {
    // State
    uploading,
    uploadProgress,
    error,
    
    // Upload functions
    uploadVideo,
    uploadImage,
    uploadDocument,
    deleteFile,
    getUploadProgress,
    
    // State management
    clearError,
    resetProgress,
    resetUploadState,
    
    // Utility functions
    formatFileSize,
    isValidVideoFile,
    isValidImageFile,
    isValidDocumentFile,
    getFileExtension,
    validateFileSize,
    
    // Auth check
    isAuthenticated: () => !!getAuthToken() && !!user
  };
};

export default useUpload;