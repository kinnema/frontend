import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IPlugin, IPluginManifest } from "../types/plugin.type";

interface PluginRegistryState {
  plugins: IPlugin[];
  registerPlugin: (url: string) => Promise<IPlugin | void>;
  unregisterPlugin: (id: string) => void;
  enablePlugin: (id: string) => void;
  disablePlugin: (id: string) => void;
  getPlugin: (id: string) => IPlugin | undefined;
  getPluginsByType: (type: "series" | "movie") => IPlugin[];
}

export const usePluginRegistry = create<PluginRegistryState>()(
  persist(
    (set, get) => ({
      plugins: [],
      registerPlugin: async (url: string) => {
        const urlObj = new URL(url);
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Failed to fetch manifest from ${url}`);

        const manifest: IPluginManifest = await response.json();

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
      getPluginsByType: (type: "series" | "movie") => {
        const plugins = get().plugins.filter((p) => p.enabled);

        return plugins.filter((p) => p.manifest.supportedTypes?.includes(type));
      },
    }),
    {
      name: "plugin-registry", // localStorage key
    }
  )
);
