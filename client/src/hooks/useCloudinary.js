import { useState, useCallback } from 'react';

const useCloudinary = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadImage = useCallback(async (file, options = {}) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

      if (options.folder) {
        formData.append('folder', options.folder);
      }

      if (options.transformation) {
        formData.append('transformation', JSON.stringify(options.transformation));
      }

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          setUploading(false);
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              width: response.width,
              height: response.height,
              format: response.format,
              bytes: response.bytes
            });
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          setUploading(false);
          reject(new Error('Network error'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`);
        xhr.send(formData);
      });

    } catch (err) {
      setUploading(false);
      setError(err.message);
      throw err;
    }
  }, []);

  const uploadVideo = useCallback(async (file, options = {}) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
      formData.append('resource_type', 'video');

      if (options.folder) {
        formData.append('folder', options.folder);
      }

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          setUploading(false);
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              duration: response.duration,
              format: response.format,
              bytes: response.bytes
            });
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          setUploading(false);
          reject(new Error('Network error'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/video/upload`);
        xhr.send(formData);
      });

    } catch (err) {
      setUploading(false);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteAsset = useCallback(async (publicId, resourceType = 'image') => {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId, resourceType }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    uploadImage,
    uploadVideo,
    deleteAsset,
    resetError: () => setError(null)
  };
};

export { useCloudinary };

export default useCloudinary;