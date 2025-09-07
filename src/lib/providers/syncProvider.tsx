import NostrWorker from "@/lib/workers/nostr.worker?worker";
import { set } from "idb-keyval";
import { createContext, useContext, useEffect } from "react";
import { take, tap } from "rxjs";
import { SyncObservables } from "../observables/sync.observable";
import { useSyncStore } from "../stores/sync.store";
import { SYNC_CONNECTION_STATUS, SYNC_STATUS } from "../types/sync.type";

export const syncProviderContext = createContext(new NostrWorker());

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const worker = useContext(syncProviderContext);
  const isNostrEnabled = useSyncStore((state) => state.isNostrEnabled);
  const setNostrSyncInProgress = useSyncStore(
    (state) => state.setNostrSyncInProgress
  );
  useEffect(() => {
    SyncObservables.nostrId$
      .pipe(
        take(1),
        tap(async (id) => {
          await set("nostr-secret-key", id);
        })
      )
      .subscribe();

    worker.postMessage({ action: "init" });

    worker.onmessage = (event) => {
      const { action, data } = event.data;

      switch (action) {
        case "connection_status":
          if (data === SYNC_CONNECTION_STATUS.CONNECTED && isNostrEnabled) {
            // Start initial sync after connection is established
            worker.postMessage({ action: "sync" });
          }
          useSyncStore.getState().setNostrConnectionStatus(data);
          break;
        case "status":
          switch (data as SYNC_STATUS) {
            case SYNC_STATUS.SYNCING:
              setNostrSyncInProgress(true);
              break;
            default:
              setNostrSyncInProgress(false);
          }
          break;
        case "complete":
          console.log("Nostr Sync Completed:", data);
          break;
        case "initialized":
          // Handle initialization
          console.log("Nostr Initialized:", data);
          break;
        default:
          console.warn("Unknown action from worker:", action);
      }
    };
  }, []);

  return <>{children}</>;
}
