import { HlsConfig } from "hls.js";
import { CapacitorHttpLoader } from "../loaders/CapacitorHttpLoader";

/**
 * Creates an optimized HLS configuration for mobile and web platforms
 * Uses CapacitorHTTP loader for better performance on native platforms
 */
export function createHlsConfig(): Partial<HlsConfig> {
  return {
    debug: process.env.NODE_ENV === "development",
    // Use custom loader for both playlists and fragments
    pLoader: CapacitorHttpLoader as any,
    fLoader: CapacitorHttpLoader as any,
    // Additional configuration for better mobile performance
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    maxBufferSize: 60 * 1000 * 1000,
    maxBufferHole: 0.5,
    lowLatencyMode: false,
    backBufferLength: 90,
  };
}

/**
 * HLS event handlers for common use cases
 */
export const hlsEventHandlers = {
  onManifestParsed: (videoElement: HTMLVideoElement) => {
    console.log("manifest loaded successfully");
    // Auto-play after manifest is parsed
    videoElement.play().catch(console.error);
  },

  onFragmentLoaded: () => {
    console.log("Fragment loaded via CapacitorHTTP");
  },

  createErrorHandler: (hls: any, toast: any) => (event: any, data: any) => {
    console.error("HLS error:", data);

    if (data.fatal) {
      switch (data.type) {
        case "networkError":
          console.log("Network error, trying to recover...");
          hls.startLoad();
          break;
        case "mediaError":
          console.log("Media error, trying to recover...");
          hls.recoverMediaError();
          break;
        default:
          console.log("Fatal error, destroying HLS instance");
          hls.destroy();
          toast.toast({
            title: "Video Error",
            description: `Video yüklenemedi: ${data.details}`,
            variant: "destructive",
          });
          break;
      }
    } else {
      console.warn("Non-fatal HLS error:", data);
    }
  },
};
