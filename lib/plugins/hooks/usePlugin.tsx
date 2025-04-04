import { pluginService } from "@/lib/services/plugin.service";
import { usePlugins } from "../PluginProvider";

export const usePlugin = (id: string) => {
  const { plugins } = usePlugins();

  const plugin = plugins.find((p) => p.id === id);

  if (!plugin) return null;

  async function fetchCatalog(type: string, id: string) {
    if (!plugin) return;

    return await pluginService.fetchCatalog(plugin.id, type, id);
  }

  return {
    plugin,
    fetchCatalog,
  };
};
