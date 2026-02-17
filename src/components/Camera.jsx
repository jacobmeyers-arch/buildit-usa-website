import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { isIOSSafari, resizeImage } from '../lib/camera';

export default function Camera() {
  const { setAppScreen, setPhotos, photos } = useProject();
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [useFallback, setUseFallback] = useState(isIOSSafari());
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Attempt getUserMedia on mount (if not iOS Safari)
  useEffect(() => {
    if (useFallback) {
      // iOS Safari: skip getUserMedia, go straight to file input
      return;
    }

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('getUserMedia error:', error);
        setCameraError('denied');
      }
    };

    startCamera();

    // Cleanup: stop stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useFallback]);

  // Capture photo from video stream
  const captureFromStream = async () => {
    if (!videoRef.current || !stream) return;
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });
      
      // Resize
      const resizedBlob = await resizeImage(blob);
      
      // Add to photos array
      setPhotos([...photos, resizedBlob]);
      
      // Stop stream
      stream.getTracks().forEach(track => track.stop());
      
      // Go to preview
      setAppScreen('preview');
    } catch (error) {
      console.error('Capture error:', error);
      alert('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle file input selection
  const handleFileInput = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsCapturing(true);
    
    try {
      // Resize the selected image
      const resizedBlob = await resizeImage(file);
      
      // Add to photos array
      setPhotos([...photos, resizedBlob]);
      
      // Go to preview
      setAppScreen('preview');
    } catch (error) {
      console.error('File processing error:', error);
      alert('Failed to process photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Retry getUserMedia
  const retryCamera = async () => {
    setCameraError(null);
    setUseFallback(false);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('getUserMedia retry error:', error);
      setCameraError('denied');
    }
  };

  // Use file input fallback
  const useFallbackInput = () => {
    setUseFallback(true);
    setCameraError(null);
    fileInputRef.current?.click();
  };

  // Camera denied state
  if (cameraError === 'denied') {
    return (
      <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="font-pencil-hand text-3xl text-parchment">
            Camera Access Needed
          </h2>
          <p className="font-serif text-parchment/80">
            Camera access is needed to photograph your project.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={retryCamera}
              className="w-full min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-lg py-3 px-6 rounded-md shadow-lg transition-all"
            >
              Allow Camera Access
            </button>
            
            <button
              onClick={useFallbackInput}
              className="w-full min-h-[44px] bg-iron border-2 border-wood hover:bg-wood/20 text-parchment font-pencil-hand text-lg py-3 px-6 rounded-md transition-all"
            >
              Upload a Photo Instead
            </button>
          </div>
        </div>
        
        {/* Hidden file input for fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  // File input fallback UI (for iOS Safari or when user chooses upload)
  if (useFallback) {
    return (
      <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="font-pencil-hand text-3xl text-parchment">
            Take a Photo
          </h2>
          <p className="font-serif text-parchment/80">
            Photograph the area you want to build or renovate.
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isCapturing}
            className="w-full min-h-[44px] bg-wood hover:bg-wood/90 disabled:bg-wood/50 text-parchment font-pencil-hand text-xl py-3 px-8 rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:scale-100"
          >
            {isCapturing ? 'Processing...' : 'Open Camera'}
          </button>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  // Live camera view
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Video preview */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Overlay UI */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <p className="font-serif text-white text-center text-sm bg-black/50 py-2 px-4 rounded-md">
            Frame your project area
          </p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-iron py-8 px-6 space-y-4">
        <button
          onClick={captureFromStream}
          disabled={isCapturing || !stream}
          className="w-full min-h-[60px] bg-wood hover:bg-wood/90 disabled:bg-wood/50 text-parchment font-pencil-hand text-2xl py-4 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:scale-100"
        >
          {isCapturing ? 'Capturing...' : 'Capture Photo'}
        </button>
        
        <button
          onClick={useFallbackInput}
          className="w-full min-h-[44px] text-parchment/70 font-serif text-sm underline"
        >
          Choose from library instead
        </button>
      </div>
      
      {/* Hidden file input for fallback option */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
