import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { uploadPhoto } from '../lib/api';

export default function PhotoPreview() {
  const { 
    photos, 
    setPhotos, 
    setAppScreen, 
    sessionId, 
    currentUser, 
    activeProject 
  } = useProject();
  
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
  const [uploadError, setUploadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const MAX_RETRIES = 3;
  const currentPhotoIndex = photos.length - 1;

  // Create preview URL from latest photo
  useEffect(() => {
    const latestPhoto = photos[currentPhotoIndex];
    if (latestPhoto && latestPhoto instanceof Blob) {
      const url = URL.createObjectURL(latestPhoto);
      setPreviewUrl(url);
      setPhotoBlob(latestPhoto);
      
      return () => URL.revokeObjectURL(url);
    }
  }, [photos, currentPhotoIndex]);

  // Auto-upload on mount
  useEffect(() => {
    if (photoBlob && uploadState === 'idle') {
      handleUpload();
    }
  }, [photoBlob]);

  const handleUpload = async () => {
    if (!photoBlob) return;
    
    setUploadState('uploading');
    setUploadError(null);
    
    try {
      const uploadOptions = currentUser && activeProject
        ? { userId: currentUser.id, projectId: activeProject.id }
        : { sessionId };
      
      await uploadPhoto(photoBlob, currentPhotoIndex, uploadOptions);
      
      setUploadState('success');
      setRetryCount(0);
      
      // Auto-proceed to analyzing after 1 second
      setTimeout(() => {
        setAppScreen('analyzing');
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      setUploadState('error');
    }
  };

  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    if (newRetryCount < MAX_RETRIES) {
      handleUpload();
    }
  };

  const handleTakeNew = () => {
    // Remove failed photo from array
    setPhotos(photos.slice(0, -1));
    // Return to camera
    setAppScreen('camera');
  };

  // Error state after max retries
  if (uploadState === 'error' && retryCount >= MAX_RETRIES) {
    return (
      <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="font-pencil-hand text-3xl text-parchment">
            Upload Issue
          </h2>
          <p className="font-serif text-parchment/80">
            Upload isn't working right now. Check your connection and try again.
          </p>
          
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full rounded-lg shadow-lg"
            />
          )}
          
          <button
            onClick={handleTakeNew}
            className="w-full min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-lg py-3 px-6 rounded-md shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Error state with retry options
  if (uploadState === 'error') {
    return (
      <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="font-pencil-hand text-3xl text-parchment">
            Upload Failed
          </h2>
          <p className="font-serif text-parchment/80 text-sm">
            {uploadError || 'Something went wrong'}
          </p>
          
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full rounded-lg shadow-lg"
            />
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-lg py-3 px-6 rounded-md shadow-lg transition-all"
            >
              Retry Upload ({retryCount}/{MAX_RETRIES})
            </button>
            
            <button
              onClick={handleTakeNew}
              className="w-full min-h-[44px] bg-iron border-2 border-wood hover:bg-wood/20 text-parchment font-pencil-hand text-lg py-3 px-6 rounded-md transition-all"
            >
              Take New Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Uploading or success state
  return (
    <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-6">
        {previewUrl && (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full rounded-lg shadow-lg"
            />
            
            {uploadState === 'uploading' && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parchment mx-auto"></div>
                  <p className="font-serif text-parchment text-sm">Uploading...</p>
                </div>
              </div>
            )}
            
            {uploadState === 'success' && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-parchment text-5xl">✓</div>
                  <p className="font-serif text-parchment text-sm">Upload complete</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {uploadState === 'success' && (
          <p className="font-serif text-parchment/70 text-center text-sm">
            Analyzing your project...
          </p>
        )}
      </div>
    </div>
  );
}
