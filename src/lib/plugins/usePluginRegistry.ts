import { CapacitorHttp } from "@capacitor/core";
import { compare } from "semver";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  IPlugin,
  IPluginManifest,
  IPluginUpdating,
} from "../types/plugin.type";
import { isNativePlatform } from "../utils/native";

interface PluginRegistryState {
  plugins: IPlugin[];
  registerPlugin: (url: string) => Promise<IPlugin | void>;
  unregisterPlugin: (id: string) => void;
  enablePlugin: (id: string) => void;
  disablePlugin: (id: string) => void;
  getPlugin: (id: string) => IPlugin | undefined;
  getPluginsByType: (type: "series" | "movie") => IPlugin[];
  updatePlugins: () => Promise<number>;
  updatePlugin: (pluginId: string) => Promise<void>;
  getAllEnabledPlugins: () => IPlugin[];
  isUpdating: IPluginUpdating | null;
}

async function _fetchPlugin(url: string): Promise<IPluginManifest> {
  const response = await CapacitorHttp.get({ url });
  if (response.status !== 200)
    throw new Error(`Failed to fetch manifest from ${url}`);

  return response.data as IPluginManifest;
}

export const usePluginRegistry = create<PluginRegistryState>()(
  persist(
    (set, get) => ({
      plugins: [],
      isUpdating: null,
      registerPlugin: async (url: string) => {
        const urlObj = new URL(url);
        const manifest: IPluginManifest = await _fetchPlugin(url);

        if (manifest?.bundle) {
          manifest.bundle.forEach(async (bundleUrl) => {
            await get().registerPlugin(`${urlObj.origin}/${bundleUrl}`);
          });

          return;
        }

        // Prevent duplicate
        if (get().plugins.some((p) => p.name === manifest.name)) {
          throw new Error(`Plugin ${manifest.name} is already registered.`);
        }

        console.log(`Registering plugin: ${manifest.name} from ${urlObj}`);

        const plugin: IPlugin = {
          id: uuidv4(),
          name: manifest.name,
          enabled: true,
          url: urlObj.origin,
          manifest,
        };
        set((state) => ({ plugins: [...state.plugins, plugin] }));
        return plugin;
      },

      updatePlugins: async () => {
        const storage = get();
        const plugins = storage.plugins;

        const promises = plugins.map((plugin) =>
          storage.updatePlugin(plugin.id)
        );

        await Promise.all(promises);

        return promises.length;
      },

      updatePlugin: async (pluginId: string) => {
        const storage = get();
        const plugin = storage.getPlugin(pluginId);

        if (!plugin) return;
        set({
          isUpdating: {
            isUpdating: true,
            pluginId: plugin.id,
          },
        });

        const requestedPlugin = await _fetchPlugin(
          `${plugin.url}/manifest.json`
        );
        const localVersion = plugin.manifest.version;
        const remoteVersion = requestedPlugin.version;
        const compared = compare(localVersion, remoteVersion);

        if (compared === -1) {
          storage.unregisterPlugin(plugin.id);
          storage.registerPlugin(plugin.url);
        }
        set({
          isUpdating: {
            isUpdating: false,
            pluginId: plugin.id,
          },
        });
      },

      unregisterPlugin: (id: string) => {
        set((state) => ({
          plugins: state.plugins.filter((p) => p.id !== id),
        }));
      },
      enablePlugin: (id: string) => {
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, enabled: true } : p
          ),
        }));
      },
      disablePlugin: (id: string) => {
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, enabled: false } : p
          ),
        }));
      },
      getPlugin: (id: string) => {
        return get().plugins.find((p) => p.id === id);
      },
      getAllEnabledPlugins: () => {
        return get().plugins.filter((p) => p.enabled);
      },
      getPluginsByType: (type: "series" | "movie") => {
        let plugins = get().plugins.filter((p) => p.enabled);

        if (!isNativePlatform()) {
          plugins = plugins.filter((p) => !p.manifest.cors);
        }

        return plugins.filter((p) => p.manifest.supportedTypes?.includes(type));
      },
    }),
    {
      name: "plugin-registry", // localStorage key
    }
  )
);
