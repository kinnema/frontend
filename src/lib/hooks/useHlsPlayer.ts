import { useToast } from "@/hooks/use-toast";
import type Hls from "hls.js";
import { useRef, useState } from "react";
import { createHlsConfig, hlsEventHandlers } from "../utils/hlsConfig";

interface UseHlsPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onError?: (error: any) => void;
  onReady?: () => void;
}

/**
 * Custom hook to manage HLS player initialization and cleanup
 * Handles both native HLS support and hls.js with CapacitorHTTP integration
 */
export function useHlsPlayer({
  videoRef,
  onError,
  onReady,
}: UseHlsPlayerProps) {
  const hlsRef = useRef<Hls | null>(null);
  const toast = useToast();
  const [isHlsSupported, setIsHlsSupported] = useState(false);

  async function loadSource(src: string) {
    const { default: Hls } = await import("hls.js");
    setIsHlsSupported(Hls.isSupported());

    const videoElement = videoRef.current;

    if (!videoElement) throw new Error("Source url or video ref is missing");

    console.log("Initializing HLS player with source:", src);

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      console.log("Initializing hls.js with CapacitorHTTP loader");

      const hlsConfig = await createHlsConfig();
      const hls = new Hls(hlsConfig);
      hlsRef.current = hls;

      // Load source and attach to video element
      hls.loadSource(src);
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
      videoElement.src = src;
      videoElement.play().catch(console.error);
      onReady?.();
    } else {
      console.error("HLS not supported on this platform");
      const error = new Error("HLS not supported on this platform");
      onError?.(error);

      if (toast) {
        toast.toast({
          title: "Compatibility Error",
          description: "This device does not support HLS video format.",
          variant: "destructive",
        });
      }
    }
  }

  function destroy() {
    if (hlsRef.current) {
      console.log("Cleaning up HLS instance");
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }

  return {
    hls: hlsRef.current,
    isHlsSupported,
    destroy,
    loadSource,
  };
}
