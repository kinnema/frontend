import { PluginRegistry } from "@/lib/plugins/pluginRegistery";
import { IPlugin } from "@/lib/types/plugin.type";
import { useEffect, useMemo, useState } from "react";

export function usePlugins() {
  const [plugins, setPlugins] = useState<Record<string, IPlugin>>({});
  const pluginRegistry = useMemo(() => new PluginRegistry(), []);
  // Initialize plugins from local storage
  useEffect(() => {
    console.log("Initializing plugins from local storage...");
    console.log("PluginRegistry instance:", pluginRegistry.getAllPlugins());
    setPlugins(pluginRegistry.getAllPlugins());
  }, []);

  const registerPlugin = async (url: string): Promise<IPlugin> => {
    try {
      const plugin = await pluginRegistry.registerPlugin(url);
      setPlugins((prev) => ({ ...prev, [plugin.name]: plugin }));
      return plugin;
    } catch (error) {
      console.error("Failed to register plugin:", error);
      throw error;
    }
  };

  const unregisterPlugin = (name: string): void => {
    try {
      pluginRegistry.unregisterPlugin(name);
      setPlugins((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error("Failed to unregister plugin:", error);
      throw error;
    }
  };

  return {
    plugins,
    registerPlugin,
    unregisterPlugin,
  };
}
