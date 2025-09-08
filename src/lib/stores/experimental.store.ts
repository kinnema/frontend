import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  ExperimentalFeature,
  IExperimentalFeature,
} from "../types/experiementalFeatures";
import { indexedDbZustandStorage } from "./stores/indexedDb";

interface ExperimentalStoreValues {
  features: IExperimentalFeature[];
}

interface ExperimentalStoreActions {
  toggleFeature: (featureId: string) => void;
  isFeatureEnabled: (featureId: string) => boolean;
  getFeature: (
    featureId: ExperimentalFeature
  ) => IExperimentalFeature | undefined;
}

type ExperimentalStore = ExperimentalStoreValues & ExperimentalStoreActions;

const DEFAULT_FEATURES: IExperimentalFeature[] = [
  {
    id: ExperimentalFeature.Sync,
    name: "Device Sync",
    description:
      "Synchronize your data across multiple devices using P2P or Nostr protocols",
    descriptionTranslationKey: "experimental.sync.description",
    enabled: false,
    translationKey: "experimental.sync.name",
    warning:
      "This feature is experimental and may be unstable. Use with caution.",
    warningTranslationKey: "experimental.sync.warning",
  },
  {
    id: ExperimentalFeature.WatchTogether,
    name: "Watch Together",
    description: "Watch videos together with friends in real-time",
    descriptionTranslationKey: "experimental.watchTogether.description",
    enabled: false,
    translationKey: "experimental.watchTogether.name",
    warning:
      "This feature is experimental and may be unstable. Use with caution.",
    warningTranslationKey: "experimental.watchTogether.warning",
  },
];

export const useExperimentalStore = create<ExperimentalStore>()(
  persist(
    (set, get) => ({
      features: DEFAULT_FEATURES,

      toggleFeature: (featureId: string) => {
        set((state) => ({
          features: state.features.map((feature) =>
            feature.id === featureId
              ? { ...feature, enabled: !feature.enabled }
              : feature
          ),
        }));
      },

      isFeatureEnabled: (featureId: string) => {
        const feature = get().features.find((f) => f.id === featureId);
        return feature?.enabled ?? false;
      },

      getFeature: (featureId: string) => {
        return get().features.find((f) => f.id === featureId);
      },
    }),
    {
      name: "experimental-features-store",
      version: import.meta.env.__APP_VERSION__,
      storage: createJSONStorage(() => indexedDbZustandStorage),
    }
  )
);
