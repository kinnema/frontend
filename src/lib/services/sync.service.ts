import { get } from "idb-keyval";
import { NostrReplicationManager } from "../database/replication/nostrReplication";
import { KinnemaCollections } from "../database/rxdb";
import { SyncObservables } from "../observables/sync.observable";

export class SyncService {
  private static instance: SyncService;
  private nostrManager: NostrReplicationManager = new NostrReplicationManager();

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  static async setSecretKey(secretKey: string): Promise<void> {
    SyncObservables.nostrId$.next(secretKey);
  }

  static async getSecretKey(): Promise<string | null> {
    const secretKey = await get("nostr-secret-key");

    return secretKey;
  }

  async initializeNostrSync(): Promise<void> {
    try {
      SyncObservables.nostrConnectionStatus$.next("connecting");
      this.nostrManager = new NostrReplicationManager();
      SyncObservables.nostrConnectionStatus$.next("connected");
    } catch (error) {
      console.error("Failed to initialize Nostr sync:", error);
      SyncObservables.nostrConnectionStatus$.next("error");
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
    this.nostrManager.cleanup();
  }
}
