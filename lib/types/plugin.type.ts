export interface IPlugin {
  id: string;
  enabled: boolean;
  name: string;
  url: string;
  manifest: IPluginManifest;
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
