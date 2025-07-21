import { useToast } from "@/hooks/use-toast";
import Hls from "hls.js";
import { useEffect, useRef } from "react";
import { createHlsConfig, hlsEventHandlers } from "../utils/hlsConfig";

interface UseHlsPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null> ;
  sourceUrl: string | null;
  onError?: (error: any) => void;
  onReady?: () => void;
}

/**
 * Custom hook to manage HLS player initialization and cleanup
 * Handles both native HLS support and hls.js with CapacitorHTTP integration
 */
export function useHlsPlayer({
  videoRef,
  sourceUrl,
  onError,
  onReady,
}: UseHlsPlayerProps) {
  const hlsRef = useRef<Hls | null>(null);
  const toast = useToast();
  
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement || !sourceUrl) {
      return;
    }

    console.log("Initializing HLS player with source:", sourceUrl);

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      console.log("Initializing hls.js with CapacitorHTTP loader");
      
      const hlsConfig = createHlsConfig();
      const hls = new Hls(hlsConfig);
      hlsRef.current = hls;

      // Load source and attach to video element
      hls.loadSource(sourceUrl);
      hls.attachMedia(videoElement);

      // Set up event listeners
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        hlsEventHandlers.onManifestParsed(videoElement);
        onReady?.();
      });

      hls.on(Hls.Events.ERROR, hlsEventHandlers.createErrorHandler(hls, toast));

      hls.on(Hls.Events.FRAG_LOADED, hlsEventHandlers.onFragmentLoaded);

    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Using native HLS support");
      videoElement.src = sourceUrl;
      videoElement.play().catch(console.error);
      onReady?.();
    } else {
      console.error("HLS not supported on this platform");
      const error = new Error("HLS not supported on this platform");
      onError?.(error);
      
      if (toast) {
        toast.toast({
          title: "Compatibility Error",
          description: "Bu cihaz HLS video formatını desteklemiyor.",
          variant: "destructive",
        });
      }
    }

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        console.log("Cleaning up HLS instance");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [sourceUrl, videoRef, onError, onReady, toast]);

  return {
    hls: hlsRef.current,
    isHlsSupported: Hls.isSupported(),
  };
}