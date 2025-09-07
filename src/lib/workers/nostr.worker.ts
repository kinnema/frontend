import { SyncService } from "../services/sync.service";
import { useSyncStore } from "../stores/sync.store";
import { SYNC_CONNECTION_STATUS, SYNC_STATUS } from "../types/sync.type";

self.onmessage = async (event) => {
  const { action, data } = event.data;
  console.log("HOST: Worker received action:", action, data);

  const nostrManager = new SyncService();

  if (action === "sync") {
    const collections = useSyncStore.getState().availableCollections;
    self.postMessage({ action: "status", data: SYNC_STATUS.SYNCING });
    const promises = [];

    for (const collection of collections) {
      if (
        collection.enabled &&
        collection.enabledReplicationTypes.includes("nostr")
      ) {
        console.log(
          `Worker: Starting Nostr sync for collection ${collection.key}`
        );

        promises.push(nostrManager.fullNostrSync(collection.key));
      }
    }

    await Promise.all(promises);

    self.postMessage({
      action: "complete",
      data: await Promise.all(promises.map(async (p) => p.then((s) => s))),
    });
    self.postMessage({ action: "status", data: SYNC_STATUS.COMPLETE });
  }

  if (action === "init") {
    self.postMessage({
      action: "connection_status",
      data: SYNC_CONNECTION_STATUS.CONNECTING,
    });
    await nostrManager.initializeNostrSync().catch((error) => {
      console.error("Worker: Failed to initialize Nostr sync:", error);
      self.postMessage({
        action: "connection_status",
        data: SYNC_CONNECTION_STATUS.ERROR,
      });
    });
    self.postMessage({
      action: "connection_status",
      data: SYNC_CONNECTION_STATUS.CONNECTED,
    });
    self.postMessage({ action: "initialized", data: "Nostr initialized!" });
  }
};
