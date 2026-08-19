/**
 * Note: This component acts as a deterrent, not true screen-recording detection.
 * Browsers cannot detect external recording software (e.g., OBS, QuickTime).
 * This forces the user to share their screen with the browser as a hurdle.
 */
"use client";

import React, { useState, useEffect, useRef } from "react";

interface ScreenShareGuardProps {
  children: React.ReactNode;
}

export function ScreenShareGuard({ children }: ScreenShareGuardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setIsSupported(false);
    }
    
    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startSharing = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      streamRef.current = stream;
      setIsSharing(true);

      // Listen for when the user stops sharing via the browser UI
      stream.getVideoTracks()[0].onended = () => {
        setIsSharing(false);
        streamRef.current = null;
      };
    } catch (err) {
      console.error("Error accessing display media:", err);
      setError("Screen sharing was denied or failed. You must share your screen to view this content.");
      setIsSharing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Feature Unsupported</h2>
          <p className="text-gray-700">
            Your browser or device does not support screen sharing. This is required to view the protected content.
          </p>
        </div>
      </div>
    );
  }

  if (!isSharing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mb-6 flex justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Screen Sharing Required</h2>
          <p className="mb-6 text-gray-600">
            To view this protected content, you must share your screen. This is a security measure to prevent unauthorized capture.
          </p>
          
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <button
            onClick={startSharing}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Sharing to Proceed
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
