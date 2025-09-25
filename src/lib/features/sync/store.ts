import { indexedDbZustandStorage } from "@/lib/stores/stores/indexedDb";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SyncMnemonic } from "./mnemonic";
import { isSyncActive$ } from "./observables";
import { ConnectionStatus, SyncCollection, SyncStore } from "./types";

const defaultCollections: SyncCollection[] = [
  {
    name: "lastWatched",
    enabled: true,
    nostrEnabled: true,
    webrtcEnabled: true,
    isRxdb: true,
  },
  {
    name: "favorite",
    enabled: true,
    nostrEnabled: true,
    webrtcEnabled: true,
    isRxdb: true,
  },
  {
    name: "plugins",
    enabled: true,
    nostrEnabled: true,
    webrtcEnabled: true,
    isRxdb: false,
  },
];

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      identity: null,
      collections: defaultCollections,
      nostrStatus: ConnectionStatus.DISCONNECTED,
      webrtcStatus: ConnectionStatus.DISCONNECTED,
      nostrRelays: [
        { url: "wss://relay.damus.io", status: ConnectionStatus.DISCONNECTED },
        { url: "wss://nos.lol", status: ConnectionStatus.DISCONNECTED },
        {
          url: "wss://relay.snort.social",
          status: ConnectionStatus.DISCONNECTED,
        },
      ],
      isActive: false,

      generateIdentity: async () => {
        console.log("Store: generateIdentity called");
        const mnemonic = await SyncMnemonic.generate();
        console.log(
          "Store: generated mnemonic length:",
          mnemonic.split(" ").length
        );
        const identity = await SyncMnemonic.deriveIdentity(mnemonic);
        console.log("Store: derived identity:", {
          deviceId: identity.deviceId,
          nostrPublicKey: identity.nostrPublicKey.substring(0, 16) + "...",
        });
        set({ identity });
      },

      setIdentity: async (mnemonic: string) => {
        console.log("Store: setIdentity called with mnemonic");
        const identity = await SyncMnemonic.deriveIdentity(mnemonic);
        console.log("Store: imported identity:", {
          deviceId: identity.deviceId,
          nostrPublicKey: identity.nostrPublicKey.substring(0, 16) + "...",
        });
        set({ identity });
      },

      clearIdentity: () => {
        set({
          identity: null,
          isActive: false,
          nostrStatus: ConnectionStatus.DISCONNECTED,
          webrtcStatus: ConnectionStatus.DISCONNECTED,
        });
      },

      updateCollectionConfig: (
        name: string,
        config: Partial<SyncCollection>
      ) => {
        set((state) => ({
          collections: state.collections.map((col) =>
            col.name === name ? { ...col, ...config } : col
          ),
        }));
      },

      setNostrStatus: (status: ConnectionStatus) => {
        set({ nostrStatus: status });
      },

      setWebRTCStatus: (status: ConnectionStatus) => {
        set({ webrtcStatus: status });
      },

      setActive: (active: boolean) => {
        isSyncActive$.next(active);
        set({ isActive: active });
      },

      addRelay: (url: string) => {
        set((state) => ({
          nostrRelays: [
            ...state.nostrRelays,
            { url, status: ConnectionStatus.DISCONNECTED },
          ],
        }));
      },
      removeRelay: (url: string) => {
        set((state) => ({
          nostrRelays: state.nostrRelays.filter((relay) => relay.url !== url),
        }));
      },
      setRelayStatus: (url: string, status: ConnectionStatus) => {
        set((state) => ({
          nostrRelays: state.nostrRelays.map((relay) =>
            relay.url === url ? { ...relay, status } : relay
          ),
        }));
      },
    }),
    {
      name: "sync-store",
      storage: createJSONStorage(() => indexedDbZustandStorage),
      version: import.meta.env.__APP_VERSION__,
      onRehydrateStorage(state) {
        return (state) => {
          isSyncActive$.next(state?.isActive ?? false);
        };
      },
    }
  )
);
