import { availableCollectionsForSync$ } from "../database/replication/availableReplications";
import { SyncService } from "../services/sync.service";
import { SYNC_STATUS } from "../types/sync.type";

self.onmessage = async (event) => {
  console.log("HOST: Worker received event:", event);

  const { action, data } = event.data;
  console.log("HOST: Worker received action:", action, data);

  const nostrManager = new SyncService();
  const collections = availableCollectionsForSync$.getValue();

  if (action === "sync") {
    self.postMessage({ action: "status", data: SYNC_STATUS.SYNCING });
    for (const collection of collections) {
      await nostrManager.fullNostrSync(collection.key);
    }

    self.postMessage({ action: "complete", data: "Nostr sync completed!" });
    self.postMessage({ action: "status", data: SYNC_STATUS.COMPLETE });
  }

  if (action === "init") {
    await nostrManager.initializeNostrSync();
    self.postMessage({ action: "initialized", data: "Nostr initialized!" });
  }
};
