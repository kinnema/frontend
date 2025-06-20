import { v4 as uuidv4 } from "uuid";
import { IPlugin, IPluginManifest } from "../types/plugin.type";

export class PluginRegistry {
  private plugins: IPlugin[] = [];

  constructor() {
    this.loadPluginsFromLocalStorage();
  }

  async registerPlugin(url: string) {
    const manifest = await this.fetchPluginManifest(url);

    if (this.plugins.some((p) => p.name === plugin.name)) {
      throw new Error(`Plugin ${manifest.name} is already registered.`);
    }

    const plugin: IPlugin = {
      id: uuidv4(),
      name: manifest.name,
      url: url,
      manifest: manifest,
    };

    this.plugins.push(plugin);
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
    const index = this.plugins.findIndex((p) => p.name === name);
    if (index === -1) {
      throw new Error(`Plugin ${name} is not registered.`);
    }
    this.plugins.splice(index, 1);
    console.log(`Plugin ${name} unregistered successfully.`);
    this.savePluginsToLocalStorage();
  }

  private async fetchPluginManifest(url: string): Promise<IPluginManifest> {
    try {
      const response = await fetch(url + "/manifest.json");
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

  getPlugin(id: string) {
    const plugin = this.plugins.find((p) => p.id === id);
    if (!plugin) {
      throw new Error(`Plugin ${id} is not registered.`);
    }
    return plugin;
  }

  getPluginsByType(type: "series" | "movie") {
    return this.plugins.filter((plugin) =>
      plugin.manifest.supportedTypes.some((t) => t === type)
    );
  }

  getAllPlugins() {
    return this.plugins;
  }
}

export const pluginRegistry = new PluginRegistry();
