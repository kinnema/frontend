import EventEmitter from "node:events";
import type TypedEmitter from "typed-emitter";
import { Configuration, DefaultApi, RequestContext } from "../api";
import { BASE_URL } from "../constants";
import {
  IWatchEvent,
  IWatchEventEmitter,
  IWatchEventInit,
  IWatchEventProviderFailed,
  IWatchEventProviderSuccess,
  IWatchEventTryingProvider,
} from "../types/watch";
const getAuthMiddleware = () => ({
  pre: async (context: RequestContext) => {
    if (typeof window === "undefined") {
      return context;
    }

    const token = localStorage.getItem("access_token");

    if (token) {
      context.init.headers = {
        ...context.init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return context;
  },
});

const apiConfig = new Configuration({
  basePath: BASE_URL,
  middleware: [getAuthMiddleware()],
});

export const apiClient = new DefaultApi(apiConfig);

export default class AppService {
  static serieEventEmitter =
    new EventEmitter() as TypedEmitter<IWatchEventEmitter>;
  static fetchSeries = (
    serie: string,
    season: number,
    chapter: number
  ): (() => void) => {
    const response = new EventSource(
      `${BASE_URL}/api/watch/?serie_name=${serie}&season_number=${season}&episode_number=${chapter}`
    );

    const eventHandler = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as IWatchEvent;

      switch (data.type) {
        case "init":
          const initData = data as IWatchEventInit;
          this.serieEventEmitter.emit("event", initData);
          break;

        case "trying_provider":
          const tryingProviderData = data as IWatchEventTryingProvider;

          this.serieEventEmitter.emit("event", tryingProviderData);
          break;

        case "provider_success":
          const providerSuccessData = data as IWatchEventProviderSuccess;

          this.serieEventEmitter.emit("event", providerSuccessData);
          break;

        case "provider_failed":
          const providerFailedData = data as IWatchEventProviderFailed;

          this.serieEventEmitter.emit("event", providerFailedData);
          break;

        case "end":
          this.serieEventEmitter.emit("end");
          break;
      }
    };

    response.addEventListener("message", eventHandler);
    response.addEventListener("error", (event) => {
      console.error("Error:", event);
    });
    response.addEventListener("open", () => {
      console.log("Open");
    });

    return () => {
      response.close();
      response.removeEventListener("message", eventHandler);
    };
  };
}
