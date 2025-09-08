import { get } from "idb-keyval";
import { NostrReplicationManager } from "../database/replication/nostrReplication";
import { KinnemaCollections } from "../database/rxdb";
import { useSyncStore } from "../stores/sync.store";
import { SYNC_CONNECTION_STATUS } from "../types/sync.type";

export class SyncService {
  private static instance: SyncService;
  private nostrManager: NostrReplicationManager | null = null;
  private syncStore = useSyncStore.getState();

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  static async setSecretKey(secretKey: string): Promise<void> {
    const instance = SyncService.getInstance();
    instance.syncStore.setNostrSecretKey(secretKey);
    // Also update the nostr manager if it exists
    if (instance.nostrManager) {
      instance.nostrManager.setSecretKey(secretKey);
    }
  }

  static async getSecretKey(): Promise<string | null> {
    const secretKey = await get("nostr-secret-key");
    return secretKey;
  }

  async initializeNostrSync(): Promise<void> {
    try {
      this.syncStore.setNostrConnectionStatus(
        SYNC_CONNECTION_STATUS.CONNECTING
      );
      
      const currentState = useSyncStore.getState();
      const relayUrls = currentState.nostrRelayUrls?.map(r => r.url) || [];
      
      this.nostrManager = new NostrReplicationManager({
        secretKey: currentState.nostrSecretKey,
        relayUrls: relayUrls,
      });
      
      this.syncStore.setNostrConnectionStatus(SYNC_CONNECTION_STATUS.CONNECTED);
    } catch (error) {
      console.error("Failed to initialize Nostr sync:", error);
      this.syncStore.setNostrConnectionStatus(SYNC_CONNECTION_STATUS.ERROR);
      throw error;
    }
  }

  async syncToNostr(collectionName: keyof KinnemaCollections) {
    if (!this.nostrManager) {
      throw new Error("Nostr manager not initialized");
    }
    return await this.nostrManager.syncToNostr(collectionName);
  }

  async syncFromNostr(collectionName: keyof KinnemaCollections) {
    if (!this.nostrManager) {
      throw new Error("Nostr manager not initialized");
    }
    return await this.nostrManager.syncFromNostr(collectionName);
  }

  async fullNostrSync(collectionName: keyof KinnemaCollections) {
    if (!this.nostrManager) {
      throw new Error("Nostr manager not initialized");
    }
    return await this.nostrManager.fullSync(collectionName);
  }

  async deleteFromNostr(
    collectionName: keyof KinnemaCollections,
    itemId: string
  ) {
    if (!this.nostrManager) {
      throw new Error("Nostr manager not initialized");
    }
    return await this.nostrManager.deleteFromNostr(collectionName, itemId);
  }

  async deleteMultipleFromNostr(
    collectionName: keyof KinnemaCollections,
    itemIds: string[]
  ) {
    if (!this.nostrManager) {
      throw new Error("Nostr manager not initialized");
    }
    return await this.nostrManager.deleteMultipleFromNostr(
      collectionName,
      itemIds
    );
  }

  async syncDeletionsToNostr(
    collectionName: keyof KinnemaCollections,
    deletedItemIds: string[]
  ) {
    if (!this.nostrManager) {
      throw new Error("Nostr manager not initialized");
    }
    return await this.nostrManager.syncDeletionsToNostr(
      collectionName,
      deletedItemIds
    );
  }

  async deleteAllSyncData() {
    if (!this.nostrManager) {
      throw new Error("Nostr manager not initialized");
    }
    return await this.nostrManager.deleteAllSyncData();
  }
  async deleteAllCollectionData(collectionName: keyof KinnemaCollections) {
    if (!this.nostrManager) {
      throw new Error("Nostr manager not initialized");
    }

    return await this.nostrManager.deleteAllCollectionData(collectionName);
  }

  cleanup(): void {
    if (this.nostrManager) {
      this.nostrManager.cleanup();
      this.nostrManager = null;
    }
  }
}
