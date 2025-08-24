import { CapacitorHttp } from "@capacitor/core";
import EventEmitter from "eventemitter3";
import TypedEventEmitter from "typed-emitter";
import { IPluginEndpointResponse } from "../types/plugin.type";
import { IPluginEventEmitter } from "../types/pluginEvents.type";
import { usePluginRegistry } from "./usePluginRegistry";

export class PluginManager {
  eventEmitter = new EventEmitter() as TypedEventEmitter<IPluginEventEmitter>;
  pluginRegistry = usePluginRegistry;
  async fetchSource(params: { id: string; season?: number; chapter?: number }) {
    try {
      const plugins = this.pluginRegistry.getState().plugins;

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
    this.eventEmitter.emit("event", {
      type: "trying_provider",
      data: {
        pluginId: plugin.id,
      },
    });

    const response = await CapacitorHttp.get({
      url: url.toString(),
    });

    if (response.status === 404) {
      this.eventEmitter.emit("event", {
        type: "provider_failed",
        data: {
          pluginId: plugin.id,
        },
      });
      throw new Error(`Serie not found ${pluginId}`);
    }

    if (response.status !== 200) {
      this.eventEmitter.emit("event", {
        type: "provider_failed",
        data: {
          pluginId: plugin.id,
        },
      });
      throw new Error(`Serie not found ${pluginId}`);
    }

    const { data, type, subtitles } =
      (await response.data) as IPluginEndpointResponse;

    this.eventEmitter.emit("event", {
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
