import { Configuration, DefaultApi, RequestContext } from "../api";
import { ApiWatchProvidersGet200Response } from "../api/models/ApiWatchProvidersGet200Response";
import { BASE_URL } from "../constants";
import { useWatchStore } from "../stores/watch.store";

const getAuthMiddleware = () => ({
  pre: async (context: RequestContext) => {
    if (typeof window === "undefined") {
      return context;
    }

    const token = localStorage.getItem("access_token");

    if (token) {
      context.init.headers = {
        ...context.init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return context;
  },
});

const apiConfig = new Configuration({
  basePath: BASE_URL,
  middleware: [getAuthMiddleware()],
});

export const apiClient = new DefaultApi(apiConfig);

export default class AppService {
  static fetchProviders =
    async (): Promise<ApiWatchProvidersGet200Response> => {
      const response = await apiClient.apiWatchProvidersGet();

      return response;
    };

  static fetchSeries = async (
    serie: string,
    season: number,
    chapter: number
  ): Promise<void> => {
    const response = await apiClient.apiWatchGetRaw({
      serieName: serie,
      seasonNumber: season,
      episodeNumber: chapter,
    });

    // Get the response body as a readable stream
    const reader = response.raw.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and split by newlines
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      // Parse each non-empty line as JSON
      for (const line of lines) {
        if (line.trim()) {
          try {
            const jsonData = JSON.parse(line);
            useWatchStore.getState().addLink(jsonData);

            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (e) {
            console.warn("Failed to parse JSON line:", e);
          }
        }
      }
    }
  };
}
