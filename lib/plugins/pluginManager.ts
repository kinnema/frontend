import EventEmitter from "events";
import TypedEventEmitter from "typed-emitter";
import { IPluginEndpointResponse } from "../types/plugin.type";
import { IPluginEventEmitter } from "../types/pluginEvents.type";
import { PluginRegistry, pluginRegistry } from "./pluginRegistery";

export class PluginManager {
  pluginRegistry: PluginRegistry = pluginRegistry;
  eventEmitter = new EventEmitter() as TypedEventEmitter<IPluginEventEmitter>;

  async fetchSource(params: { id: string; season?: number; chapter?: number }) {
    try {
      const plugins = this.pluginRegistry.getAllPlugins();
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

  async fetchSourceByPlugin(
    pluginName: string,
    params: { id: string; season?: number; chapter?: number }
  ) {
    const plugin = this.pluginRegistry.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not registered.`);
    }

    const endpoint =
      plugin.manifest.endpoints.series || plugin.manifest.endpoints.movie;
    if (!endpoint) {
      throw new Error(`No endpoint defined for plugin ${pluginName}.`);
    }

    const url = new URL(plugin.url + endpoint);
    url.searchParams.set("id", params.id);
    if (params.season) {
      url.searchParams.set("season", params.season.toString());
    }
    if (params.chapter) {
      url.searchParams.set("chapter", params.chapter.toString());
    }
    this.eventEmitter.emit("event", {
      type: "trying_provider",
      data: {
        pluginId: plugin.id,
      },
    });

    const response = await fetch(url.toString());

    if (response.status === 404) {
      this.eventEmitter.emit("event", {
        type: "provider_failed",
        data: {
          pluginId: plugin.id,
        },
      });
      throw new Error(`Serie not found ${pluginName}`);
    }

    if (response.status !== 200) {
      this.eventEmitter.emit("event", {
        type: "provider_failed",
        data: {
          pluginId: plugin.id,
        },
      });
      throw new Error(`Serie not found ${pluginName}`);
    }

    const { data, type } = (await response.json()) as IPluginEndpointResponse;

    this.eventEmitter.emit("event", {
      type: "provider_success",
      data: {
        pluginId: plugin.id,
        url: data.url,
      },
    });
  }
}

export const pluginManager = new PluginManager();
