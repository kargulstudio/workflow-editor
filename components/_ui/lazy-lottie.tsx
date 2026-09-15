"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface VideoProps {
  src: string;
  mobileSrc?: string;
  className?: string;
  poster?: string;

  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: () => void;
}

function Video({
  src,
  mobileSrc,
  className,
  poster,
  onLoadStart,
  onLoadedData,
  onError,
  ...props
}: VideoProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isLowPowerMode, setIsLowPowerMode] = React.useState(false);

  // Helper function to clear all video sources
  const clearAllVideoSources = React.useCallback((video: HTMLVideoElement) => {
    // Remove src attribute from video element
    video.removeAttribute("src");
    // Clear all source elements
    const sources = video.querySelectorAll("source");
    sources.forEach((source) => {
      source.removeAttribute("src");
    });

    // Trigger load to release resources
    video.load();
  }, []);

  // Helper function to restore video sources
  const restoreVideoSources = React.useCallback(
    (video: HTMLVideoElement) => {
      if (!video.dataset.originalSources) return;

      const sourcesData = JSON.parse(video.dataset.originalSources);
      const sources = video.querySelectorAll("source");

      sources.forEach((source, index) => {
        if (sourcesData[index]) {
          source.src = sourcesData[index].src;
          source.type = sourcesData[index].type;
          if (sourcesData[index].media) {
            source.media = sourcesData[index].media;
          }
        }
      });

      // Reload the video with new sources
      video.load();

      // Wait for the video to be ready before playing
      const onLoaded = () => {
        video.play().catch((err) => {
          console.log("Error playing video:", err);
          // If autoplay fails, remove the sources
          clearAllVideoSources(video);
        });
        video.removeEventListener("loadeddata", onLoaded);
      };

      video.addEventListener("loadeddata", onLoaded);
    },
    [clearAllVideoSources],
  );

  // Set up intersection observer for video play/pause
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    // Store original sources for restoration
    if (!video.dataset.originalSources) {
      const sources = video.querySelectorAll("source");
      const sourcesData = Array.from(sources).map((source) => ({
        src: source.src,
        type: source.type,
        media: source.media || "",
      }));
      video.dataset.originalSources = JSON.stringify(sourcesData);
    }

    // Handle autoplay failure and detect low power mode
    const handleAutoplayFailure = () => {
      console.log("Autoplay failed, removing video sources");
      clearAllVideoSources(video);
    };

    // Add event listener for autoplay failure
    video.addEventListener("error", handleAutoplayFailure);

    // Override play() to detect low power mode (NotAllowedError)
    const originalPlay = video.play;
    video.play = function () {
      return originalPlay.call(this).catch((error) => {
        // NotAllowedError indicates low power mode on iOS
        if (error instanceof Error && error.name === "NotAllowedError") {
          console.log("Low Power Mode detected - showing poster image");
          setIsLowPowerMode(true);
          clearAllVideoSources(video);
        } else {
          console.log("Play promise rejected:", error);
          handleAutoplayFailure();
        }
        // Don't throw - prevent error bubbling
        return Promise.resolve();
      });
    };

    // Also check on initial load when autoplay tries to play
    const checkInitialAutoplay = () => {
      if (video.readyState >= 2) {
        // Video is ready, try to detect low power mode
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (error instanceof Error && error.name === "NotAllowedError") {
              console.log("Low Power Mode detected on initial load");
              setIsLowPowerMode(true);
              clearAllVideoSources(video);
            }
          });
        }
      }
    };

    // Check after video can play
    const onCanPlay = () => {
      checkInitialAutoplay();
      video.removeEventListener("canplay", onCanPlay);
    };
    video.addEventListener("canplay", onCanPlay);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Skip if low power mode is detected
          if (isLowPowerMode) return;

          if (entry.isIntersecting) {
            // Video is in view - restore sources and auto-play after load
            console.log("play");
            restoreVideoSources(video);
          } else {
            // Video is out of view - pause and clean sources
            console.log("pause");
            video.pause();
            clearAllVideoSources(video);
          }
        });
      },
      { threshold: 0, rootMargin: "200px" },
    );

    observer.observe(video);

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
      video.removeEventListener("error", handleAutoplayFailure);
    };
  }, [clearAllVideoSources, restoreVideoSources, isLowPowerMode]);

  // If low power mode is detected, show poster image instead
  if (isLowPowerMode && poster) {
    return (
      <Image
        src={poster}
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className={cn("absolute object-cover", className)}
        {...props}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      poster={poster}
      className={cn("auto_video absolute object-cover", className)}
      onLoadStart={onLoadStart}
      onLoadedData={onLoadedData}
      onError={onError}
      {...props}
    >
      <source src={src} type="video/webm" media="(min-width: 768px)" />
      <source
        src={mobileSrc || src}
        type="video/webm"
        media="(max-width: 769px)"
      />
      Your browser does not support the video tag.
    </video>
  );
}

export default Video;
