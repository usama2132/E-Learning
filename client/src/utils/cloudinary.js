// utils/cloudinary.js
import { CLOUDINARY_CONFIG } from './config';

/**
 * Upload file to Cloudinary
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    // Add optional parameters
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.resourceType) {
      formData.append('resource_type', options.resourceType);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${options.resourceType || 'auto'}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Type of resource (image, video, etc.)
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    
    // Generate signature (in production, this should be done on the server)
    const timestamp = Date.now();
    formData.append('timestamp', timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Generate optimized image URL
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Image transformations
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = transformations;

  let transformStr = `q_${quality},f_${format}`;
  
  if (width || height) {
    transformStr += `,c_${crop}`;
    if (width) transformStr += `,w_${width}`;
    if (height) transformStr += `,h_${height}`;
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformStr}/${publicId}`;
};

/**
 * Generate video thumbnail URL
 * @param {string} publicId - Public ID of the video
 * @param {Object} options - Thumbnail options
 * @returns {string} Video thumbnail URL
 */
export const getVideoThumbnail = (publicId, options = {}) => {
  const { width = 640, height = 360, time = '50%' } = options;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload/so_${time},w_${width},h_${height},c_fill,f_jpg/${publicId}.jpg`;
};

/**
 * Get video streaming URL
 * @param {string} publicId - Public ID of the video
 * @param {Object} options - Streaming options
 * @returns {string} Video streaming URL
 */
export const getVideoStreamUrl = (publicId, options = {}) => {
  const { quality = 'auto', format = 'auto' } = options;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload/q_${quality},f_${format}/${publicId}`;
};

/**
 * Upload multiple files to Cloudinary
 * @param {FileList|Array} files - Files to upload
 * @param {Object} options - Upload options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleFiles = async (files, options = {}, onProgress = null) => {
  const uploadPromises = Array.from(files).map(async (file, index) => {
    try {
      const result = await uploadToCloudinary(file, options);
      if (onProgress) {
        onProgress((index + 1) / files.length * 100);
      }
      return { success: true, result, file: file.name };
    } catch (error) {
      return { success: false, error: error.message, file: file.name };
    }
  });

  return Promise.all(uploadPromises);
};