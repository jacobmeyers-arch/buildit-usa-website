/**
 * Camera utilities for BuildIt USA
 * 
 * Handles iOS Safari detection and client-side image resizing
 */

/**
 * Detect iOS Safari (not Chrome on iOS)
 * iOS Safari has better camera integration via file input than getUserMedia
 */
export const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isWebKit = /WebKit/.test(ua);
  const isChrome = /CriOS/.test(ua);
  return isIOS && isWebKit && !isChrome;
};

/**
 * Resize image to max dimension on longest edge
 * @param {Blob} imageBlob - Original image blob
 * @param {number} maxSize - Maximum dimension (default 1280px)
 * @param {number} quality - JPEG quality 0-1 (default 0.75)
 * @returns {Promise<Blob>} Resized image blob
 */
export const resizeImage = async (imageBlob, maxSize = 1280, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};
