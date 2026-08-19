/**
 * Note: This component acts as a deterrent, not true screen-recording detection.
 * Browsers cannot completely prevent screenshotting or external recording.
 * This blurs content on blur/visibility change and intercepts common keyboard shortcuts.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ContentProtectionProps {
  children: React.ReactNode;
}

export function ContentProtection({ children }: ContentProtectionProps) {
  const [isProtected, setIsProtected] = useState(false);

  const handleProtect = useCallback(() => {
    setIsProtected(true);
  }, []);

  const handleResume = () => {
    setIsProtected(false);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleProtect();
      }
    };

    const handleBlur = () => {
      handleProtect();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        handleProtect();
      }
      
      // Prevent Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        handleProtect();
      }

      // Prevent macOS screenshot shortcuts (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5)
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        handleProtect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleProtect]);

  return (
    <div className="relative min-h-screen w-full">
      {/* 
        We apply blur to the content if isProtected is true. 
        pointer-events-none ensures they can't interact with blurred content.
      */}
      <div 
        className={`h-full w-full transition-all duration-200 ${
          isProtected ? "blur-xl select-none pointer-events-none" : ""
        }`}
      >
        {children}
      </div>

      {isProtected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-w-sm rounded-lg bg-white p-8 text-center shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Content Protected</h2>
            <p className="mb-6 text-gray-600">
              For security reasons, the content was hidden because the window lost focus or a screenshot attempt was detected.
            </p>
            <button
              onClick={handleResume}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Resume Viewing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
