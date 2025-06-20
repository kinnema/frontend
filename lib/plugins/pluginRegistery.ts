import { IPlugin, IPluginManifest } from "../types/plugin.type";

export class PluginRegistry {
  private plugins: Record<string, IPlugin> = {};

  constructor() {
    this.loadPluginsFromLocalStorage();
  }

  async registerPlugin(url: string) {
    const manifest = await this.fetchPluginManifest(url);
    if (this.plugins[manifest.name]) {
      throw new Error(`Plugin ${manifest.name} is already registered.`);
    }

    const plugin: IPlugin = {
      name: manifest.name,
      url: url,
      manifest: manifest,
    };

    this.plugins[manifest.name] = plugin;
    this.savePluginsToLocalStorage();
    console.log(`Plugin ${manifest.name} registered successfully.`);
    return plugin;
  }

  private savePluginsToLocalStorage() {
    try {
      localStorage.setItem("plugins", JSON.stringify(this.plugins));
    } catch (error) {
      console.error("Failed to save plugins to localStorage:", error);
    }
  }

  private loadPluginsFromLocalStorage() {
    try {
      const plugins = localStorage.getItem("plugins");
      if (plugins) {
        this.plugins = JSON.parse(plugins);
      }
    } catch (error) {
      console.error("Failed to load plugins from localStorage:", error);
    }
  }

  unregisterPlugin(name: string) {
    if (!this.plugins[name]) {
      throw new Error(`Plugin ${name} is not registered.`);
    }
    delete this.plugins[name];
    this.savePluginsToLocalStorage();
  }

  private async fetchPluginManifest(url: string): Promise<IPluginManifest> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin manifest from ${url}`);
      }
      const data = await response.json();
      if (!data.name) {
        throw new Error(`Invalid plugin manifest: missing 'name' field`);
      }
      return data as IPluginManifest;
    } catch (error) {
      console.error(`Error fetching plugin manifest from ${url}:`, error);
      throw error;
    }
  }

  getPlugin(name: string) {
    return this.plugins[name];
  }

  getAllPlugins() {
    return this.plugins;
  }
}

export const pluginRegistry = new PluginRegistry();
