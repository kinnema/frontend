import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  availableCollectionsForSync,
  availableCollectionsForSync$,
  ICollectionSettingSync,
} from "../database/replication/availableReplications";
import { SyncObservables } from "../observables/sync.observable";

export const useSyncStore = create<SyncStore & SyncStoreActions>()(
  persist(
    (set, get) => ({
      peers: [],
      isP2PEnabled: false,
      availableCollections: availableCollectionsForSync,
      // Nostr sync default state
      isNostrEnabled: false,
      nostrConnectionStatus: "disconnected" as const,
      nostrSyncInProgress: false,
      addPeer: (peers: string) => set({ peers: [...get().peers, peers] }),
      removePeer: (peers: string) =>
        set({ peers: get().peers.filter((peer) => peer !== peers) }),
      setSyncId: (syncId: string) => set({ syncId }),
      setIsP2PEnabled: (isP2PEnabled: boolean) => {
        SyncObservables.isEnabled$.next(isP2PEnabled);
        set({ isP2PEnabled });
      },
      setAvailableCollections: (collections: ICollectionSettingSync[]) => {
        set({ availableCollections: collections });
      },
      clearPeers: () => set({ peers: [] }),
      // Nostr sync actions
      setIsNostrEnabled: (isEnabled: boolean) => {
        SyncObservables.isNostrEnabled$.next(isEnabled);
        set({ isNostrEnabled: isEnabled });
      },
      setNostrPublicKey: (publicKey: string) =>
        set({ nostrPublicKey: publicKey }),
      setNostrConnectionStatus: (status) => {
        SyncObservables.nostrConnectionStatus$.next(status);
        set({ nostrConnectionStatus: status });
      },
      setLastNostrSync: (timestamp: number) =>
        set({ lastNostrSync: timestamp }),
      setNostrSyncInProgress: (inProgress: boolean) => {
        SyncObservables.nostrSyncInProgress$.next(inProgress);
        set({ nostrSyncInProgress: inProgress });
      },
    }),
    {
      name: "sync-store",
      version: 0.1,

      onRehydrateStorage: (state) => {
        console.log("hydration starts");

        // optional
        return (state, error) => {
          if (error) {
            console.log("an error happened during hydration", error);
          } else {
            if (!state) return;
            availableCollectionsForSync$.next(state.availableCollections);
            SyncObservables.isEnabled$.next(state.isP2PEnabled);
            // Restore Nostr observables
            SyncObservables.isNostrEnabled$.next(state.isNostrEnabled || false);
            SyncObservables.nostrConnectionStatus$.next(
              state.nostrConnectionStatus || "disconnected"
            );
            SyncObservables.nostrSyncInProgress$.next(
              state.nostrSyncInProgress || false
            );
          }
        };
      },
    }
  )
);

interface SyncStore {
  peers: string[];
  syncId?: string;
  isP2PEnabled: boolean;
  availableCollections: ICollectionSettingSync[];
  // Nostr sync status
  isNostrEnabled: boolean;
  nostrPublicKey?: string;
  nostrConnectionStatus: "connecting" | "connected" | "disconnected" | "error";
  lastNostrSync?: number;
  nostrSyncInProgress: boolean;
}

interface SyncStoreActions {
  addPeer: (peer: string) => void;
  removePeer: (peer: string) => void;
  setSyncId: (syncId: string) => void;
  setIsP2PEnabled: (isP2PEnabled: boolean) => void;
  clearPeers: () => void;
  setAvailableCollections: (collections: ICollectionSettingSync[]) => void;
  // Nostr sync actions
  setIsNostrEnabled: (isEnabled: boolean) => void;
  setNostrPublicKey: (publicKey: string) => void;
  setNostrConnectionStatus: (
    status: "connecting" | "connected" | "disconnected" | "error"
  ) => void;
  setLastNostrSync: (timestamp: number) => void;
  setNostrSyncInProgress: (inProgress: boolean) => void;
}
