import { usePluginRegistry } from "../usePluginRegistry";
import { exampleStreamPlugin } from "./exampleStreamPlugin";

export const localPlugins = [exampleStreamPlugin];

export const getLocalPluginHandler = (pluginName: string) => {
  const plugin = localPlugins.find((p) => p.manifest.name === pluginName);
  return plugin?.handler;
};

export const registerLocalPlugins = () => {
  const { registerLocalPlugin } = usePluginRegistry.getState();

  localPlugins.forEach((plugin) => {
    try {
      registerLocalPlugin(plugin.manifest, plugin.handler);
      console.log(`Registered local plugin: ${plugin.manifest.name}`);
    } catch (error) {
      console.warn(
        `Failed to register local plugin ${plugin.manifest.name}:`,
        error
      );
    }
  });
};

export const reattachLocalPluginHandlers = () => {
  const store = usePluginRegistry.getState();
  const { plugins } = store;

  const localPluginsNeedingHandlers = plugins.filter(
    (plugin) => plugin.type === "local" && !plugin.handler
  );

  if (localPluginsNeedingHandlers.length > 0) {
    console.log(
      `Reattaching handlers to ${localPluginsNeedingHandlers.length} local plugins...`
    );

    usePluginRegistry.setState((state) => ({
      ...state,
      plugins: state.plugins.map((plugin) => {
        if (plugin.type === "local" && !plugin.handler) {
          const handler = getLocalPluginHandler(plugin.name);
          if (handler) {
            console.log(`Reattached handler for: ${plugin.name}`);
            return { ...plugin, handler };
          } else {
            console.warn(`No handler found for local plugin: ${plugin.name}`);
          }
        }
        return plugin;
      }),
    }));
  }
};

export const initializeLocalPlugins = () => {
  const { plugins } = usePluginRegistry.getState();
  const localPluginNames = localPlugins.map((p) => p.manifest.name);

  reattachLocalPluginHandlers();

  const missingPlugins = localPluginNames.filter(
    (name) => !plugins.some((p) => p.name === name && p.type === "local")
  );

  if (missingPlugins.length > 0) {
    console.log(`Initializing ${missingPlugins.length} local plugins...`);
    registerLocalPlugins();
  }
};
