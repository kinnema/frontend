import { createContext, useEffect, useRef } from "react";
import { useExperimentalStore } from "../stores/experimental.store";
import { useSyncStore } from "../stores/sync.store";
import { ExperimentalFeature } from "../types/experiementalFeatures";
import { SYNC_CONNECTION_STATUS, SYNC_STATUS } from "../types/sync.type";

export const syncProviderContext = createContext<Worker | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const workerRef = useRef<Worker | null>(null);
  const isNostrEnabled = useSyncStore((state) => state.isNostrEnabled);
  const nostrSecretKey = useSyncStore((state) => state.nostrSecretKey);
  const isSyncFeatureEnabled = useExperimentalStore((state) =>
    state.isFeatureEnabled(ExperimentalFeature.Sync)
  );
  const nostrRelayUrls = useSyncStore((state) => state.nostrRelayUrls);
  const availableCollections = useSyncStore(
    (state) => state.availableCollections
  );
  const setNostrSyncInProgress = useSyncStore(
    (state) => state.setNostrSyncInProgress
  );

  useEffect(() => {
    async function initNostr() {
      const { default: NostrWorker } = await import(
        "../workers/nostr.worker?worker"
      );
      workerRef.current = new NostrWorker();

      const worker = workerRef.current;

      // Initialize worker with store data
      worker.postMessage({
        action: "init",
        data: {
          availableCollections,
          nostrSecretKey,
          nostrRelayUrls,
        },
      });

      worker.onmessage = (event) => {
        const { action, data } = event.data;

        switch (action) {
          case "connection_status":
            if (data === SYNC_CONNECTION_STATUS.CONNECTED && isNostrEnabled) {
              // Start initial sync after connection is established
              worker.postMessage({
                action: "sync",
                data: { availableCollections },
              });
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
            console.log("Nostr Initialized:", data);
            break;
          case "error":
            console.error("Worker error:", data);
            useSyncStore
              .getState()
              .setNostrConnectionStatus(SYNC_CONNECTION_STATUS.ERROR);
            break;
          default:
            console.warn("Unknown action from worker:", action);
        }
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        useSyncStore
          .getState()
          .setNostrConnectionStatus(SYNC_CONNECTION_STATUS.ERROR);
      };
    }

    if (!isSyncFeatureEnabled) return;
    initNostr();

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ action: "cleanup" });
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Re-initialize worker when Nostr is enabled/disabled
  useEffect(() => {
    if (workerRef.current && isNostrEnabled) {
      workerRef.current.postMessage({
        action: "sync",
        data: { availableCollections },
      });
    }
  }, [isNostrEnabled, availableCollections]);

  return <>{children}</>;
}
