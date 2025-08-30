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
}

interface SyncStoreActions {
  addPeer: (peer: string) => void;
  removePeer: (peer: string) => void;
  setSyncId: (syncId: string) => void;
  setIsP2PEnabled: (isP2PEnabled: boolean) => void;
  clearPeers: () => void;
  setAvailableCollections: (collections: ICollectionSettingSync[]) => void;
}
