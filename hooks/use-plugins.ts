"use client";

import { PluginRegistry } from "@/lib/plugins/pluginRegistery";
import { IPlugin } from "@/lib/types/plugin.type";
import { useEffect, useMemo, useState } from "react";

export function usePlugins() {
  const [plugins, setPlugins] = useState<IPlugin[]>([]);
  const pluginRegistry = useMemo(() => new PluginRegistry(), []);

  useEffect(() => {
    console.log("Initializing plugins from local storage...");
    console.log("PluginRegistry instance:", pluginRegistry.getAllPlugins());
    setPlugins(pluginRegistry.getAllPlugins());
  }, []);

  function getPluginsByType(type: "series" | "movie"): IPlugin[] {
    return pluginRegistry.getPluginsByType(type);
  }

  function fetchSerieByPlugin() {}

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
      setPlugins((prev) => prev.filter((p) => p.name !== name));
    } catch (error) {
      console.error("Failed to unregister plugin:", error);
      throw error;
    }
  };

  return {
    plugins,
    registerPlugin,
    unregisterPlugin,
    getPluginsByType,
  };
}
