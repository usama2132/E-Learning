import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { api } from '../utils/api';

const useUpload = () => {
  const { token, user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadVideo = useCallback(async (videoFile, courseId, metadata = {}) => {
    if (!token || !user) {
      throw new Error('Authentication required for video upload');
    }

    if (!videoFile) {
      throw new Error('Video file is required');
    }

    if (!courseId) {
      throw new Error('Course ID is required');
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('🎥 Starting video upload for course:', courseId);
      console.log('📊 File details:', {
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type
      });

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', metadata.title || videoFile.name);
      formData.append('description', metadata.description || '');
      formData.append('duration', metadata.duration || '');
      formData.append('courseId', courseId);

      console.log('🔐 Using token for upload:', token ? 'Present' : 'Missing');
      console.log('👤 User role:', user?.role);

      const response = await fetch('http://localhost:5000/api/uploads/course/course-videos/video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      console.log('📡 Upload response status:', response.status);
      
      const responseData = await response.json();
      console.log('📨 Upload response data:', responseData);

      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error || 'Upload failed';
        console.error('❌ Upload failed:', errorMsg);
        throw new Error(errorMsg);
      }

      if (responseData.success) {
        console.log('✅ Video upload successful');
        setUploadProgress(100);
        return responseData.data?.url || responseData.url;
      } else {
        throw new Error(responseData.message || 'Upload failed');
      }

    } catch (error) {
      console.error('💥 Upload error:', error);
      setError(error.message);
      
      // Handle specific error types
      if (error.message.includes('Authentication') || error.message.includes('token')) {
        throw new Error('Authentication required. Please login again.');
      }
      
      if (error.message.includes('Network')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw new Error(error.message || 'Video upload failed');
    } finally {
      setUploading(false);
    }
  }, [token, user]);

  const uploadImage = useCallback(async (imageFile, folder = 'images') => {
    if (!token) {
      throw new Error('Authentication required for image upload');
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('🖼️ Starting image upload');

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('folder', folder);

      const response = await fetch('http://localhost:5000/api/uploads/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Image upload failed');
      }

      console.log('✅ Image upload successful');
      setUploadProgress(100);
      return responseData.data?.url || responseData.url;

    } catch (error) {
      console.error('💥 Image upload error:', error);
      setError(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [token]);

  const uploadDocument = useCallback(async (documentFile, folder = 'documents') => {
    if (!token) {
      throw new Error('Authentication required for document upload');
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('📄 Starting document upload');

      const formData = new FormData();
      formData.append('document', documentFile);
      formData.append('folder', folder);

      const response = await fetch('http://localhost:5000/api/uploads/document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Document upload failed');
      }

      console.log('✅ Document upload successful');
      setUploadProgress(100);
      return responseData.data?.url || responseData.url;

    } catch (error) {
      console.error('💥 Document upload error:', error);
      setError(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [token]);

  const deleteFile = useCallback(async (publicId) => {
    if (!token) {
      throw new Error('Authentication required for file deletion');
    }

    try {
      console.log('🗑️ Deleting file:', publicId);

      const response = await fetch(`http://localhost:5000/api/uploads/delete/${publicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'File deletion failed');
      }

      console.log('✅ File deleted successfully');
      return true;

    } catch (error) {
      console.error('💥 File deletion error:', error);
      setError(error.message);
      throw error;
    }
  }, [token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetProgress = useCallback(() => {
    setUploadProgress(0);
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    uploadVideo,
    uploadImage,
    uploadDocument,
    deleteFile,
    clearError,
    resetProgress,
    // Utility functions
    formatFileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    isValidVideoFile: (file) => {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      return validTypes.includes(file.type);
    },
    isValidImageFile: (file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return validTypes.includes(file.type);
    },
    getFileExtension: (filename) => {
      return filename.split('.').pop().toLowerCase();
    }
  };
};

export default useUpload; 