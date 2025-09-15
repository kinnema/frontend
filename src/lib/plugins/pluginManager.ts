import { CapacitorHttp } from "@capacitor/core";
import { Subject } from "rxjs";
import { IPlugin, IPluginEndpointResponse } from "../types/plugin.type";
import { IPluginEventData } from "../types/pluginEvents.type";
import { isNativePlatform } from "../utils/native";
import { usePluginRegistry } from "./usePluginRegistry";

export class PluginManager {
  events = new Subject<IPluginEventData>();

  pluginRegistry = usePluginRegistry;
  async fetchSource(params: { id: string; season?: number; chapter?: number }) {
    try {
      const plugins = this.pluginRegistry.getState().getAllEnabledPlugins();

      if (plugins.length === 0) {
        throw new Error("No plugins registered.");
      }

      const results = await Promise.all(
        plugins.map((plugin) => this.fetchSourceByPlugin(plugin.id, params))
      );

      return results;
    } catch (error) {
      return {
        type: "provider_failed",
        data: "Error fetching sources: " + error,
      };
    }
  }

  private async handleLocalPlugins(
    plugin: IPlugin,
    pluginId: string,
    params: { id: string; season?: number; chapter?: number }
  ) {
    if (plugin.type === "local" && !plugin.handler) {
      const { getLocalPluginHandler } = await import("./local");
      const handler = getLocalPluginHandler(plugin.name);

      if (!handler) {
        throw new Error(`No handler found for local plugin ${plugin.name}`);
      }

      this.pluginRegistry.setState((state) => ({
        ...state,
        plugins: state.plugins.map((p) =>
          p.id === plugin.id ? { ...p, handler } : p
        ),
      }));

      plugin.handler = handler;
      console.log(`Reattached handler for local plugin: ${plugin.name}`);
    }

    if (plugin.type === "local" && plugin.handler) {
      this.events.next({
        type: "trying_provider",
        data: {
          pluginId: plugin.id,
        },
      });

      try {
        const endpoint = params.season !== undefined ? "series" : "movie";
        const handlerMethod = plugin.handler[endpoint];
        console.log("Using local plugin:", plugin);
        if (!handlerMethod) {
          throw new Error(
            `No ${endpoint} handler defined for local plugin ${pluginId}.`
          );
        }

        const result = await handlerMethod(params);

        this.events.next({
          type: "provider_success",
          data: {
            pluginId: plugin.id,
            url: result.data.url,
            subtitles: result.subtitles,
          },
        });

        return result;
      } catch (error) {
        console.error("Error in local plugin:", error);
        this.events.next({
          type: "provider_failed",
          data: {
            pluginId: plugin.id,
          },
        });
        throw error;
      }
    }
  }

  async fetchSourceByPlugin(
    pluginId: string,
    params: { id: string; season?: number; chapter?: number }
  ) {
    const plugin = this.pluginRegistry.getState().getPlugin(pluginId);

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered.`);
    }

    if (!plugin.enabled) {
      console.log(`Skipping plugin ${pluginId} is not enabled.`);
      return;
    }

    if (plugin.manifest.cors && !isNativePlatform()) {
      console.log(`Skipping plugin ${pluginId} due to CORS restrictions.`);
      return;
    }

    console.log("OK", plugin);

    if (plugin.type === "local") {
      return await this.handleLocalPlugins(plugin, pluginId, params);
    }

    // Handle remote plugins
    const endpoint =
      plugin.manifest.endpoints.series || plugin.manifest.endpoints.movie;

    if (!endpoint) {
      throw new Error(`No endpoint defined for plugin ${pluginId}.`);
    }

    const url = new URL(plugin.url + endpoint);
    url.searchParams.set("id", params.id);
    if (params.season) {
      url.searchParams.set("season", params.season.toString());
    }
    if (params.chapter) {
      url.searchParams.set("chapter", params.chapter.toString());
    }
    this.events.next({
      type: "trying_provider",
      data: {
        pluginId: plugin.id,
      },
    });

    const response = await CapacitorHttp.get({
      url: url.toString(),
    });

    if (response.status === 404) {
      this.events.next({
        type: "provider_failed",
        data: {
          pluginId: plugin.id,
        },
      });
      throw new Error(`Serie not found ${pluginId}`);
    }

    if (response.status !== 200) {
      this.events.next({
        type: "provider_failed",
        data: {
          pluginId: plugin.id,
        },
      });
      throw new Error(`Serie not found ${pluginId}`);
    }

    const { data, type, subtitles } =
      (await response.data) as IPluginEndpointResponse;

    this.events.next({
      type: "provider_success",
      data: {
        pluginId: plugin.id,
        url: data.url,
        subtitles,
      },
    });
  }
}

export const pluginManager = new PluginManager();
