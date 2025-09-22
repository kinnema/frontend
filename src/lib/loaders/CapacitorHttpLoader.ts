import { Capacitor, CapacitorHttp } from "@capacitor/core";
import type Hls from "hls.js";

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
        this.loadWithFetch(context, config, callbacks);
      }
    }

    private async loadWithFetch(context: any, config: any, callbacks: any) {
      const { onSuccess, onError } = callbacks;

      try {
        const startTime = performance.now();

        const isBinaryRequest =
          context.responseType === "arraybuffer" ||
          context.url.includes(".ts") ||
          context.url.includes(".m4s");

        const headers = new Headers({
          ...context.headers,
          "User-Agent": "VLC/3.0.17.4 LibVLC/3.0.9",
        });

        console.log(
          `Fetch API loading: ${context.url} (binary: ${isBinaryRequest})`
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          context.timeout || 30000
        );

        const response = await fetch(context.url, {
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const endTime = performance.now();

        if (response.ok) {
          let data: ArrayBuffer | string;
          if (isBinaryRequest) {
            data = await response.arrayBuffer();
          } else {
            data = await response.text();
          }

          const responseObj = {
            url: context.url,
            data: data,
          };

          const stats = {
            aborted: false,
            loaded:
              data instanceof ArrayBuffer ? data.byteLength : data.length || 0,
            retry: 0,
            total:
              data instanceof ArrayBuffer ? data.byteLength : data.length || 0,
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
            `Fetch API success: ${context.url} (${stats.loaded} bytes)`
          );
          onSuccess(responseObj, stats, context);
        } else {
          console.error(
            `Fetch API error: ${response.status} for ${context.url}`
          );
          onError(
            {
              code: response.status,
              text: `HTTP Error ${response.status}: ${response.statusText}`,
            },
            context
          );
        }
      } catch (error) {
        console.error("Fetch API loader error:", error);
        onError(
          {
            code: 0,
            text: error instanceof Error ? error.message : "Network error",
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

        const isBinaryRequest =
          context.responseType === "arraybuffer" ||
          context.url.includes(".ts") ||
          context.url.includes(".m4s");

        const headers = {
          ...context.headers,
          "User-Agent": "VLC/3.0.17.4 LibVLC/3.0.9",
        };

        console.log(
          `CapacitorHTTP loading: ${context.url} (binary: ${isBinaryRequest})`
        );

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
            if (response.data instanceof ArrayBuffer) {
              data = response.data;
            } else if (typeof response.data === "string") {
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
            data =
              typeof response.data === "string"
                ? response.data
                : JSON.stringify(response.data);
          }

          const responseObj = {
            url: context.url,
            data: data,
          };

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
      super.abort();
    }

    destroy() {
      super.destroy();
    }
  }

  return CapacitorHttpLoader;
}
