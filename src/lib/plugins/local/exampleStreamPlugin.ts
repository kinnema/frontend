import {
  IPluginEndpointResponse,
  IPluginHandler,
  IPluginManifest,
} from "../../types/plugin.type";

export const exampleStreamPlugin: {
  manifest: IPluginManifest;
  handler: IPluginHandler;
} = {
  manifest: {
    name: "Built-in Streams",
    version: "1.0.0",
    description: "Built-in streaming sources",
    author: "Kinnema Team",
    homepage: "https://kinnema.app",
    license: "MIT",
    supportedTypes: ["movie", "series"],
    cors: false,
    endpoints: {
      movie: "/api/movie",
      series: "/api/series",
      search: "/api/search",
      details: "/api/details",
    },
  },
  handler: {
    search: async (query: string): Promise<IPluginEndpointResponse> => {
      return {
        type: "series",
        data: {
          url: "https://example.com/stream/sample",
          type: "series",
          id: "sample-id",
        },
      };
    },

    movie: async (params: { id: string }): Promise<IPluginEndpointResponse> => {
      console.log(`Getting movie stream for ID: ${params.id}`);

      return {
        type: "movie",
        data: {
          url: `https://example.com/stream/movie/${params.id}`,
          type: "movie",
          id: params.id,
        },
        subtitles: [
          {
            url: `https://example.com/subtitles/movie/${params.id}/en.vtt`,
            lang: "en",
          },
        ],
      };
    },

    series: async (params: {
      id: string;
      season?: number;
      episode?: number;
    }): Promise<IPluginEndpointResponse> => {
      console.log(
        `Getting series stream for ID: ${params.id}, Season: ${params.season}, Episode: ${params.episode}`
      );

      return {
        type: "series",
        data: {
          url: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`,
          type: "series",
          id: params.id,
          season: params.season,
          episode: params.episode,
        },
        subtitles: [
          {
            url: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`,
            lang: "en",
          },
        ],
      };
    },

    details: async (params: { id: string }): Promise<any> => {
      console.log(`Getting details for ID: ${params.id}`);

      return {
        id: params.id,
        title: "Sample Title",
        description: "Sample description",
        year: 2023,
        rating: 8.5,
      };
    },
  },
};
