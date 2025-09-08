import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { indexedDbZustandStorage } from "./stores/indexedDb";

export interface ISubtitleProviderConfig {
  apiKey?: string;
  enabled: boolean;
}

export interface ICachedSubtitle {
  lang: string;
  content: string;
  provider: string;
}

interface ISubtitleStore {
  providerConfig: {
    [providerName: string]: ISubtitleProviderConfig;
  };
  setProviderApiKey: (providerName: string, apiKey: string) => void;
  setProviderEnabled: (providerName: string, enabled: boolean) => void;
}

export const useSubtitleStore = create(
  persist<ISubtitleStore>(
    (set, get) => ({
      providerConfig: {
        subdl: {
          enabled: true,
          // apiKey will be stored here by the user via UI
        },
        // other providers can be added here in the future
      },
      setProviderApiKey: (providerName, apiKey) => {
        set((state) => ({
          providerConfig: {
            ...state.providerConfig,
            [providerName]: {
              ...(state.providerConfig[providerName] || { enabled: true }),
              apiKey,
            },
          },
        }));
      },

      setProviderEnabled: (providerName, enabled) => {
        set((state) => ({
          providerConfig: {
            ...state.providerConfig,
            [providerName]: {
              ...(state.providerConfig[providerName] || { apiKey: undefined }),
              enabled,
            },
          },
        }));
      },
    }),
    {
      name: "subtitle-storage",
      storage: createJSONStorage(() => indexedDbZustandStorage),
      version: import.meta.env.__APP_VERSION__,
    }
  )
);
