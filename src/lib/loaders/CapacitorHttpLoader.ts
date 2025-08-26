import { Capacitor, CapacitorHttp } from "@capacitor/core";
import type Hls from "hls.js";

/**
 * Custom HLS loader that uses CapacitorHTTP for native platforms
 * and falls back to the default loader for web platforms.
 *
 * This provides better performance and reliability on mobile devices
 * by leveraging native HTTP capabilities.
 */

export async function createCapacitorHttpLoader() {
  const { default: Hls } = await import("hls.js");

  class CapacitorHttpLoader extends Hls.DefaultConfig.loader {
    constructor(config: any) {
      super(config);
    }

    load(context: any, config: any, callbacks: any) {
      // Only use CapacitorHTTP on native platforms
      if (Capacitor.isNativePlatform()) {
        this.loadWithCapacitorHttp(context, config, callbacks);
      } else {
        //@ts-ignore
        if (window.__TAURI__) {
          return this.loadWithTauri(context, config, callbacks);
        }
        // Fallback to default loader for web
        super.load(context, config, callbacks);
      }
    }

    private async loadWithTauri(context: any, config: any, callbacks: any) {
      const { onSuccess, onError } = callbacks;

      try {
        const startTime = performance.now();

        // Determine if this is a binary request (TS segments) or text (m3u8 playlists)
        const isBinaryRequest =
          context.responseType === "arraybuffer" ||
          context.url.includes(".ts") ||
          context.url.includes(".m4s");

        // Prepare headers with proper content type expectations
        const headers = {
          ...context.headers,
          "User-Agent": "VLC/3.0.17.4 LibVLC/3.0.9", // Match the capacitor config
        };

        console.log(
          `Native fetch loading: ${context.url} (binary: ${isBinaryRequest})`
        );

        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, config.timeout || 30000);

        // Use native fetch for the request
        const response = await fetch(context.url, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        // Clear timeout since request completed
        clearTimeout(timeoutId);

        const endTime = performance.now();

        if (response.ok) {
          let data;

          if (isBinaryRequest) {
            // For binary data (TS segments), get ArrayBuffer
            data = await response.arrayBuffer();
          } else {
            // For text data (m3u8 playlists)
            data = await response.text();
          }

          const responseObj = {
            url: context.url,
            data: data,
          };

          // Create stats object with the exact structure hls.js expects
          const stats = {
            aborted: false,
            loaded:
              data instanceof ArrayBuffer ? data.byteLength : data?.length || 0,
            retry: 0,
            total:
              data instanceof ArrayBuffer ? data.byteLength : data?.length || 0,
            chunkCount: 1,
            bwEstimate: 0,
            loading: {
              start: startTime,
              first: endTime,
              end: endTime,
            },
            parsing: {
              start: 0,
              end: 0,
            },
            buffering: {
              start: 0,
              first: 0,
              end: 0,
            },
          };

          console.log(
            `Native fetch success: ${context.url} (${stats.loaded} bytes)`
          );
          onSuccess(responseObj, stats, context);
        } else {
          console.error(
            `Native fetch error: ${response.status} for ${context.url}`
          );
          onError(
            {
              code: response.status,
              text: `HTTP Error ${response.status}: "${
                response.statusText || "Unknown error"
              }"`,
            },
            context
          );
        }
      } catch (error) {
        console.error("Native fetch loader error:", error);

        // Handle different error types
        let errorCode = 0;
        let errorMessage = "Network error";

        //@ts-ignore
        if (error.name === "AbortError") {
          errorCode = 408; // Request Timeout
          errorMessage = "Request timeout";
        } else if (error instanceof TypeError) {
          errorMessage = "Network error or CORS issue";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        onError(
          {
            code: errorCode,
            text: errorMessage,
          },
          context
        );
      }
    }

    private async loadWithCapacitorHttp(
      context: any,
      config: any,
      callbacks: any
    ) {
      const { onSuccess, onError } = callbacks;

      try {
        const startTime = performance.now();

        // Determine if this is a binary request (TS segments) or text (m3u8 playlists)
        const isBinaryRequest =
          context.responseType === "arraybuffer" ||
          context.url.includes(".ts") ||
          context.url.includes(".m4s");

        // Prepare headers with proper content type expectations
        const headers = {
          ...context.headers,
          "User-Agent": "VLC/3.0.17.4 LibVLC/3.0.9", // Match the capacitor config
        };

        console.log(
          `CapacitorHTTP loading: ${context.url} (binary: ${isBinaryRequest})`
        );

        // Use CapacitorHTTP for the request
        const response = await CapacitorHttp.get({
          url: context.url,
          headers,
          readTimeout: config.timeout || 30000,
          connectTimeout: config.timeout || 10000,
          responseType: isBinaryRequest ? "arraybuffer" : "text",
        });

        const endTime = performance.now();

        if (response.status >= 200 && response.status < 300) {
          let data;
          if (isBinaryRequest) {
            // For binary data (TS segments), handle ArrayBuffer or base64
            if (response.data instanceof ArrayBuffer) {
              data = response.data;
            } else if (typeof response.data === "string") {
              // Convert base64 to ArrayBuffer
              try {
                const binaryString = atob(response.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                data = bytes.buffer;
              } catch (e) {
                console.error("Failed to decode base64 data:", e);
                throw new Error("Failed to decode binary data");
              }
            } else {
              data = response.data;
            }
          } else {
            // For text data (m3u8 playlists)
            data =
              typeof response.data === "string"
                ? response.data
                : JSON.stringify(response.data);
          }

          const responseObj = {
            url: context.url,
            data: data,
          };

          // Create stats object with the exact structure hls.js expects
          const stats = {
            aborted: false,
            loaded:
              data instanceof ArrayBuffer ? data.byteLength : data?.length || 0,
            retry: 0,
            total:
              data instanceof ArrayBuffer ? data.byteLength : data?.length || 0,
            chunkCount: 1,
            bwEstimate: 0,
            loading: {
              start: startTime,
              first: endTime,
              end: endTime,
            },
            parsing: {
              start: 0,
              end: 0,
            },
            buffering: {
              start: 0,
              first: 0,
              end: 0,
            },
          };

          console.log(
            `CapacitorHTTP success: ${context.url} (${stats.loaded} bytes)`
          );
          onSuccess(responseObj, stats, context);
        } else {
          console.error(
            `CapacitorHTTP error: ${response.status} for ${context.url}`
          );
          onError(
            {
              code: response.status,
              text: `HTTP Error ${response.status}: "Unknown error"`,
            },
            context
          );
        }
      } catch (error) {
        console.error("CapacitorHTTP loader error:", error);
        onError(
          {
            code: 0,
            text: error instanceof Error ? error.message : "Network error",
          },
          context
        );
      }
    }

    abort() {
      // CapacitorHTTP doesn't support request cancellation in the same way
      // but we can implement cleanup if needed
      super.abort();
    }

    destroy() {
      // Cleanup resources
      super.destroy();
    }
  }

  return CapacitorHttpLoader;
}
