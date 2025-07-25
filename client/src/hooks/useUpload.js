import { useState, useCallback, useRef } from 'react';

const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const abortControllerRef = useRef(null);

  // Generic file upload function
  const uploadFile = useCallback(async (file, endpoint, options = {}) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add additional form data if provided
      if (options.additionalData) {
        Object.keys(options.additionalData).forEach(key => {
          formData.append(key, options.additionalData[key]);
        });
      }

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        // Handle progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          setUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            setUploadedFiles(prev => [...prev, response.file]);
            resolve(response);
          } else {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || 'Upload failed'));
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          setUploading(false);
          reject(new Error('Network error occurred'));
        });

        // Handle abort
        xhr.addEventListener('abort', () => {
          setUploading(false);
          reject(new Error('Upload was cancelled'));
        });

        // Set up cancellation
        abortControllerRef.current.signal.addEventListener('abort', () => {
          xhr.abort();
        });

        // Configure request
        xhr.open('POST', endpoint);
        
        // Add authorization header if token exists
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        // Add custom headers if provided
        if (options.headers) {
          Object.keys(options.headers).forEach(key => {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }

        xhr.send(formData);
      });

    } catch (err) {
      setUploading(false);
      setError(err.message);
      throw err;
    }
  }, []);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (files, endpoint, options = {}) => {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadFile(files[i], endpoint, {
          ...options,
          additionalData: {
            ...options.additionalData,
            fileIndex: i,
            totalFiles: files.length
          }
        });
        results.push(result);
      } catch (err) {
        errors.push({ file: files[i], error: err.message });
      }
    }

    if (errors.length > 0) {
      setError(`${errors.length} files failed to upload`);
    }

    return { results, errors };
  }, [uploadFile]);

  // Upload video file
  const uploadVideo = useCallback(async (file, courseId, lessonId = null, options = {}) => {
    return uploadFile(file, '/api/upload/video', {
      ...options,
      additionalData: {
        courseId,
        lessonId,
        ...options.additionalData
      }
    });
  }, [uploadFile]);

  // Upload course thumbnail
  const uploadThumbnail = useCallback(async (file, courseId, options = {}) => {
    return uploadFile(file, '/api/upload/thumbnail', {
      ...options,
      additionalData: {
        courseId,
        ...options.additionalData
      }
    });
  }, [uploadFile]);

  // Upload profile image
  const uploadProfileImage = useCallback(async (file, userId, options = {}) => {
    return uploadFile(file, '/api/upload/profile-image', {
      ...options,
      additionalData: {
        userId,
        ...options.additionalData
      }
    });
  }, [uploadFile]);

  // Upload assignment/document
  const uploadDocument = useCallback(async (file, courseId, lessonId, options = {}) => {
    return uploadFile(file, '/api/upload/document', {
      ...options,
      additionalData: {
        courseId,
        lessonId,
        ...options.additionalData
      }
    });
  }, [uploadFile]);

  // Validate file before upload
  const validateFile = useCallback((file, validationRules = {}) => {
    const errors = [];

    // Check file size
    if (validationRules.maxSize && file.size > validationRules.maxSize) {
      errors.push(`File size exceeds ${formatFileSize(validationRules.maxSize)}`);
    }

    // Check file type
    if (validationRules.allowedTypes && !validationRules.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file extension
    if (validationRules.allowedExtensions) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!validationRules.allowedExtensions.includes(fileExtension)) {
        errors.push(`File extension .${fileExtension} is not allowed`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Clear uploaded files
  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  // Delete uploaded file
  const deleteFile = useCallback(async (fileId) => {
    try {
      const response = await fetch(`/api/upload/delete/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      return true;

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Format file size for display
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Get file validation rules for different types
  const getValidationRules = useCallback((fileType) => {
    const rules = {
      video: {
        maxSize: 500 * 1024 * 1024, // 500MB
        allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
        allowedExtensions: ['mp4', 'avi', 'mov', 'wmv']
      },
      image: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      },
      document: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        allowedExtensions: ['pdf', 'doc', 'docx', 'txt']
      }
    };

    return rules[fileType] || {};
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    uploadedFiles,
    uploadFile,
    uploadMultipleFiles,
    uploadVideo,
    uploadThumbnail,
    uploadProfileImage,
    uploadDocument,
    validateFile,
    cancelUpload,
    clearUploadedFiles,
    deleteFile,
    formatFileSize,
    getValidationRules,
    resetError: () => setError(null)
  };
};

export default useUpload;