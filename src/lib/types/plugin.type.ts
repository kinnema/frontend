export interface IPlugin {
  id: string;
  enabled: boolean;
  name: string;
  url: string;
  type: "local" | "remote";
  handler?: IPluginHandler; // For local plugins
  manifest: IPluginManifest;
}

export interface IPluginHandler {
  search?: (query: string) => Promise<IPluginEndpointResponse>;
  movie?: (params: { id: string }) => Promise<IPluginEndpointResponse>;
  series?: (params: {
    id: string;
    season?: number;
    episode?: number;
  }) => Promise<IPluginEndpointResponse>;
  details?: (params: { id: string }) => Promise<any>;
  [key: string]: ((params: any) => Promise<any>) | undefined;
}

export interface IPluginManifest {
  name: string;
  bundle?: string[];
  version: string;
  description: string;
  author: string;
  homepage: string;
  license?: string;
  supportedTypes: string[]; // e.g., ["movie", "series"]
  cors: boolean;
  endpoints: {
    movie?: string;
    series?: string;
    search?: string;
    details?: string;
    [key: string]: string | undefined;
  };
}

export interface IPluginEndpointResponse {
  type: "movie" | "series";
  data: IPluginEndpointPayload;
  subtitles?: IPluginEndpointSubtitle[];
}

export interface IPluginEndpointSubtitle {
  url: string;
  lang: string;
}

export interface IPluginEndpointPayload {
  url: string;
  type: "movie" | "series";
  id: string;
  season?: number;
  episode?: number;
}

export interface IPluginUpdating {
  pluginId: string;
  isUpdating: boolean;
}
