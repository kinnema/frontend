import { WorkerNostrReplicationManager } from "./workerNostrManager";
import { SYNC_CONNECTION_STATUS, SYNC_STATUS } from "../types/sync.type";

// Worker should not directly access stores - use message passing instead
interface WorkerInitData {
  availableCollections: any[];
  nostrSecretKey?: string;
  nostrRelayUrls?: any[];
}

interface WorkerMessage {
  action: string;
  data?: any;
}

let nostrManager: WorkerNostrReplicationManager | null = null;

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { action, data } = event.data;
  console.log("Worker received action:", action, data);

  try {
    if (action === "init") {
      const initData = data as WorkerInitData;
      
      self.postMessage({
        action: "connection_status",
        data: SYNC_CONNECTION_STATUS.CONNECTING,
      });

      const relayUrls = initData.nostrRelayUrls?.map(r => r.url) || [];
      
      nostrManager = new WorkerNostrReplicationManager({
        secretKey: initData.nostrSecretKey,
        relayUrls: relayUrls,
      });
      
      self.postMessage({
        action: "connection_status",
        data: SYNC_CONNECTION_STATUS.CONNECTED,
      });
      self.postMessage({ action: "initialized", data: "Nostr initialized!" });
    }

    if (action === "sync") {
      if (!nostrManager) {
        throw new Error("Nostr manager not initialized");
      }

      const { availableCollections } = data;
      self.postMessage({ action: "status", data: SYNC_STATUS.SYNCING });
      
      const results = [];
      
      for (const collection of availableCollections) {
        if (
          collection.enabled &&
          collection.enabledReplicationTypes?.includes("nostr")
        ) {
          console.log(
            `Worker: Starting Nostr sync for collection ${collection.key}`
          );

          try {
            const result = await nostrManager.fullSync(collection.key);
            results.push(result);
          } catch (error) {
            console.error(`Worker: Failed to sync ${collection.key}:`, error);
            results.push({ error: error?.toString() });
          }
        }
      }

      self.postMessage({
        action: "complete",
        data: results,
      });
      self.postMessage({ action: "status", data: SYNC_STATUS.COMPLETE });
    }

    if (action === "cleanup") {
      if (nostrManager) {
        await nostrManager.cleanup();
        nostrManager = null;
      }
    }
  } catch (error) {
    console.error("Worker error:", error);
    self.postMessage({
      action: "error",
      data: error?.toString(),
    });
    self.postMessage({
      action: "connection_status",
      data: SYNC_CONNECTION_STATUS.ERROR,
    });
  }
};
