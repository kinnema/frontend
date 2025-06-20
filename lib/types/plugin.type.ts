export interface IPlugin {
  name: string;
  url: string;
  manifest: IPluginManifest;
}

export interface IPluginManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  license?: string;
}
