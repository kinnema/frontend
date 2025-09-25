import { getDb } from "@/lib/database/rxdb";
import { usePluginRegistry } from "@/lib/plugins/usePluginRegistry";
import { IPlugin } from "@/lib/types/plugin.type";
import { lastSyncedAt$, syncingStatus$ } from "./observables";
import { useSyncStore } from "./store";
import {
  ConnectionStatus,
  NostrWorkerDeleteMessage,
  NostrWorkerErrorMessage,
  NostrWorkerInitMessage,
  NostrWorkerMergedDeletionsMessage,
  NostrWorkerOutgoingMessage,
  NostrWorkerPartialSyncMessage,
  NostrWorkerRelayStatusMessage,
  NostrWorkerResultMessage,
  NostrWorkerResultPluginsMessage,
  NostrWorkerStatusMessage,
  NostrWorkerSyncMessage,
  NostrWorkerSyncPluginsMessage,
  SyncResult,
  TypedWorker,
} from "./types";

export class SyncEngine {
  private nostrWorker: TypedWorker<
    | NostrWorkerInitMessage
    | NostrWorkerSyncMessage
    | NostrWorkerDeleteMessage
    | NostrWorkerSyncPluginsMessage,
    NostrWorkerOutgoingMessage
  > | null = null;

  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async start() {
    const { identity, isActive } = useSyncStore.getState();
    console.log(
      "SyncEngine.start() called - identity:",
      !!identity,
      "isActive:",
      isActive
    );

    if (!identity) {
      console.log("Sync not starting - no identity configured");
      return;
    }

    if (this.isRunning) {
      console.log("Sync not starting - already active, call stop() first");
      return;
    }

    console.log("Starting sync engine...");
    this.isRunning = true;

    await this.initWorkers();
    await this.startSync();

    // Start periodic sync every 5 minutes
    this.startPeriodicSync();
    console.log("Sync engine fully initialized and running");
  }

  async stop() {
    console.log("SyncEngine.stop() called - current state:", {
      isRunning: this.isRunning,
      hasNostrWorker: !!this.nostrWorker,
      hasSyncInterval: !!this.syncInterval,
    });

    this.isRunning = false;
    useSyncStore.getState().setActive(false);

    if (this.syncInterval) {
      console.log("Clearing periodic sync interval");
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.nostrWorker) {
      console.log("Terminating Nostr worker");
      this.nostrWorker.terminate();
      this.nostrWorker = null;
    }

    useSyncStore.getState().setNostrStatus(ConnectionStatus.DISCONNECTED);
    console.log("Sync engine fully stopped");
  }

  async restart() {
    console.log("SyncEngine.restart() called - forcing full restart");
    await this.stop();

    // Wait a moment for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));

    await this.start();
    console.log("SyncEngine restart completed");
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(async () => {
      if (this.isRunning) {
        console.log("Running periodic sync...");
        await this.startSync();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async initWorkers() {
    const { identity, nostrRelays } = useSyncStore.getState();

    if (!identity) return;

    try {
      console.log("Initializing workers...");
      await Promise.all([
        this.initNostrWorker(
          identity.nostrPrivateKey,
          identity.nostrPublicKey,
          nostrRelays
        ),
      ]);
      console.log("All workers initialized successfully");
    } catch (error) {
      console.error("Worker initialization failed:", error);
      throw error;
    }
  }

  private async initNostrWorker(
    privateKey: string,
    publicKey: string,
    relays: any[]
  ) {
    const NostrWorker = await import("./workers/nostr.worker?worker");
    this.nostrWorker = new NostrWorker.default();

    return new Promise<void>((resolve, reject) => {
      this.nostrWorker!.onmessage = async (event) => {
        const message = event.data;
        const { type } = message;

        switch (type) {
          case "sync-start":
            syncingStatus$.next(true);
            break;
          case "sync-complete":
            syncingStatus$.next(false);
            lastSyncedAt$.next(new Date());
            break;
          case "merged-deletions":
            const mergedDeletionsMessage =
              message as NostrWorkerMergedDeletionsMessage;
            const { deletedIds } = mergedDeletionsMessage.payload;
            console.log(
              `Received ${deletedIds.length} merged deleted IDs from Nostr worker`
            );
            this.handleDeletedIds(deletedIds);
            break;
          case "relay-status":
            const relayStatusMessage = message as NostrWorkerRelayStatusMessage;
            const { relay, status } = relayStatusMessage.payload;
            useSyncStore.getState().setRelayStatus(relay, status);
            console.log(`Relay ${relay} status: ${status}`);
            break;
          case "status":
            const statusMessage = message as NostrWorkerStatusMessage;
            useSyncStore
              .getState()
              .setNostrStatus(statusMessage.payload.status);
            if (statusMessage.payload.status === ConnectionStatus.CONNECTED) {
              console.log("Nostr worker initialization completed");
              resolve();
            }
            break;
          case "result":
            const resultMessage = message as NostrWorkerResultMessage;
            this.handleSyncResult("nostr", resultMessage.payload);
            break;
          case "result-plugins":
            const pluginResultMessage =
              message as NostrWorkerResultPluginsMessage;
            this.handlePluginSyncResult(pluginResultMessage.payload, "nostr");
            break;
          case "deleted-plugins":
            this.handleDeletedPlugins(message.payload);
            break;
          case "partial-sync":
            const partialSyncMessage = message as NostrWorkerPartialSyncMessage;
            await this.mergeRemoteData(
              partialSyncMessage.payload.collection,
              partialSyncMessage.payload.documents
            );
            break;
          case "error":
            const errorMessage = message as NostrWorkerErrorMessage;
            console.error("Nostr worker error:", errorMessage.payload.error);
            useSyncStore.getState().setNostrStatus(ConnectionStatus.ERROR);

            if (errorMessage.payload.error.includes("Initialization failed")) {
              reject(new Error(errorMessage.payload.error));
            }
            break;
        }
      };

      const initMessage: NostrWorkerInitMessage = {
        type: "init",
        payload: {
          privateKeyHex: privateKey,
          publicKeyHex: publicKey,
          relays,
        },
      };
      this.nostrWorker!.postMessage(initMessage);

      setTimeout(() => {
        reject(new Error("Nostr worker initialization timeout"));
      }, 10000);
    });
  }
  private async handleDeletedPlugins(
    deletedPlugins: { pluginId: string; deletedAt: number }[]
  ) {
    try {
      console.log(
        `Handling ${deletedPlugins.length} deleted plugins from Nostr worker`
      );

      for (const { pluginId, deletedAt } of deletedPlugins) {
        console.log(
          `Deleting local plugin ${pluginId} (deleted at ${deletedAt})`
        );
        const pluginRegistry = usePluginRegistry.getState();
        const existing = pluginRegistry.getPlugin(pluginId);
        if (existing) {
          pluginRegistry.unregisterPlugin(pluginId);
        }
      }
    } catch (error) {
      console.error("Failed to handle deleted plugins:", error);
    }
  }

  private async handleDeletedIds(deletedIds: string[]) {
    try {
      console.log(
        `Handling ${deletedIds.length} deleted document IDs from Nostr worker`
      );
      const db = await getDb();

      for (const collection of useSyncStore.getState().collections) {
        if (!collection.enabled) continue;

        const coll = db[collection.name as keyof typeof db];
        if (!coll) {
          console.warn(`Collection ${collection.name} not found in database`);
          continue;
        }

        for (const docId of deletedIds) {
          try {
            const doc = await coll
              .findOne({
                selector: { id: docId },
              })
              .exec();

            if (doc) {
              console.log(
                `Deleting local document ${docId} from collection ${collection.name}`
              );
              await doc.remove();
            } else {
              console.log(
                `Document ${docId} not found in collection ${collection.name}, skipping`
              );
            }
          } catch (error) {
            console.error(
              `Failed to delete document ${docId} from collection ${collection.name}:`,
              error
            );
          }
        }
      }

      console.log("Completed handling deleted document IDs");
    } catch (error) {
      console.error("Failed to handle deleted document IDs:", error);
    }
  }

  public async deleteNostrEvent(
    type: "plugin" | "document",
    documentId: string
  ) {
    if (!this.nostrWorker) {
      console.error("Nostr worker is not initialized");
      return;
    }

    const deleteMessage: NostrWorkerDeleteMessage = {
      type: "delete",
      payload: {
        type,
        id: documentId,
      },
    };
    this.nostrWorker.postMessage(deleteMessage);
  }

  private isPluginSyncEnabled() {
    const pluginCollection = useSyncStore
      .getState()
      .collections.find((c) => c.name === "plugins");

    if (!pluginCollection?.enabled || !pluginCollection.nostrEnabled) {
      console.error("Plugin collection sync is disabled");
      return;
    }

    return true;
  }

  public async syncPluginsManually() {
    const isEnabled = this.isPluginSyncEnabled();
    if (!isEnabled) return;

    if (!this.isRunning) {
      console.error("Sync engine is not running - call start() first");
      return;
    }

    console.log("Current sync engine state:", {
      isRunning: this.isRunning,
      hasNostrWorker: !!this.nostrWorker,
    });

    await this.syncPlugins();
  }

  public async debugPluginSync() {
    console.log("=== Plugin Sync Debug ===");

    const pluginRegistry = usePluginRegistry.getState();
    const allPlugins = pluginRegistry.plugins;
    const remotePlugins = pluginRegistry.getAllRemoteEnabledPlugins();

    console.log("Plugin registry state:", {
      totalPlugins: allPlugins.length,
      remoteEnabledPlugins: remotePlugins.length,
      plugins: allPlugins.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        enabled: p.enabled,
        url: p.url,
      })),
    });

    const syncState = useSyncStore.getState();
    console.log("Sync state:", {
      isActive: syncState.isActive,
      nostrStatus: syncState.nostrStatus,
      identity: !!syncState.identity,
      relays: syncState.nostrRelays.length,
    });

    if (syncState.identity) {
      console.log("Identity public key:", syncState.identity.nostrPublicKey);
    }

    console.log("=== End Debug ===");
  }

  private async startSync() {
    const { collections } = useSyncStore.getState();

    console.log("Starting sync for collections:", collections);

    for (const collection of collections) {
      if (!collection.enabled) {
        console.log(`Collection ${collection.name} is disabled, skipping`);
        continue;
      }

      const documents = await this.getCollectionDocuments(collection.name);
      console.log(
        `Collection ${collection.name} has ${documents.length} documents:`,
        documents
      );

      if (collection.nostrEnabled && this.nostrWorker) {
        console.log(
          `Starting Nostr sync for ${collection.name} with ${documents.length} documents`
        );
        const syncMessage: NostrWorkerSyncMessage = {
          type: "sync",
          payload: {
            collection: collection.name,
            documents,
          },
        };
        this.nostrWorker.postMessage(syncMessage);
      }
    }

    await this.syncPlugins();
  }

  private async syncPlugins() {
    const isEnabled = this.isPluginSyncEnabled();
    if (!isEnabled) return;

    if (!this.isRunning) {
      console.error("Sync engine is not running - call start() first");
      return;
    }

    console.log("Current sync engine state:", {
      isRunning: this.isRunning,
      hasNostrWorker: !!this.nostrWorker,
    });

    const plugins = usePluginRegistry
      .getState()
      .getAllRemoteEnabledPlugins()
      .map((p) => ({ ...p, handler: undefined }));

    console.log(`Syncing ${plugins.length} plugins...`);
    console.log(
      "Plugins to sync:",
      plugins.map((p) => `${p.name} (${p.id})`)
    );

    if (this.nostrWorker) {
      console.log("Starting Nostr plugin sync...");
      const syncPluginsMessage: NostrWorkerSyncPluginsMessage = {
        type: "sync-plugins",
        payload: plugins,
      };
      this.nostrWorker.postMessage(syncPluginsMessage);
    } else {
      console.log("Nostr worker not available, skipping Nostr plugin sync");
    }
  }

  private async getCollectionDocuments(collectionName: string) {
    try {
      console.log(`Getting documents for collection: ${collectionName}`);
      const db = await getDb();
      console.log("Database instance:", db);

      const collection = db[collectionName as keyof typeof db];
      console.log(`Collection ${collectionName}:`, collection);

      if (!collection) {
        console.error(`Collection ${collectionName} not found in database`);
        return [];
      }

      const docs = await collection.find().exec();
      console.log(`Found ${docs.length} documents in ${collectionName}:`, docs);

      const jsonDocs = docs.map((doc: any) => doc.toJSON());
      console.log(`Converted to JSON:`, jsonDocs);

      return jsonDocs;
    } catch (error) {
      console.error("Failed to get collection documents:", error);
      return [];
    }
  }

  private handlePluginSyncResult(
    payload: IPlugin[],
    source: "nostr" = "nostr"
  ) {
    console.log(`Plugin sync result from ${source}:`, payload);

    const result: SyncResult = {
      collection: "plugins",
      type: source,
      success: payload.length > 0,
      synced: payload.length,
      errors: [],
    };

    console.log(`Plugin sync result summary from ${source}:`, result);

    if (payload.length === 0) {
      console.log(`No plugins received from ${source}, nothing to merge`);
      return;
    }

    // Merge plugins into local registry
    const pluginRegistry = usePluginRegistry.getState();
    console.log(`Current local plugins: ${pluginRegistry.plugins.length}`);

    payload.forEach(async (plugin, index) => {
      try {
        console.log(
          `Processing plugin ${index + 1}/${payload.length}: ${plugin.name} (${
            plugin.id
          })`
        );
        const existing = pluginRegistry.getPlugin(plugin.id);
        if (!existing) {
          console.log(`Adding ne
            ew plugin from ${source} sync: ${plugin.name}`);
          pluginRegistry.addPlugin(plugin);
        } else {
          console.log(
            `Plugin already exists locally, skipping: ${plugin.name}`
          );
        }
      } catch (error) {
        console.error(`Failed to register plugin ${plugin.name}:`, error);
        result.errors.push(`Failed to register ${plugin.name}: ${error}`);
      }
    });
  }

  private handleSyncResult(type: "nostr", payload: any) {
    const result: SyncResult = {
      collection: payload.collection,
      type,
      success: payload.published > 0 || payload.fetched > 0,
      synced: payload.published || 0,
      errors:
        payload.publishResults
          ?.filter((r: any) => !r.success)
          .map((r: any) => r.error) || [],
    };

    console.log("Sync result:", result);

    // Handle incoming remote data
    if (payload.remoteData && payload.remoteData.length > 0) {
      this.mergeRemoteData(payload.collection, payload.remoteData);
    }
  }

  private async mergeRemoteData(collectionName: string, remoteData: any[]) {
    try {
      console.log(
        `Merging ${remoteData.length} remote documents into ${collectionName}`
      );
      const db = await getDb();
      const collection = db[collectionName as keyof typeof db];

      if (!collection) {
        console.error(`Collection ${collectionName} not found`);
        return;
      }

      for (const remoteDoc of remoteData) {
        try {
          // Check if document already exists locally
          const existingDoc = await collection
            .findOne({
              selector: { id: remoteDoc.data.id },
            })
            .exec();

          if (existingDoc) {
            // Conflict resolution: use the most recently synced version
            const existingData = existingDoc.toJSON();
            const existingSyncTime = existingData.syncedAt || 0;
            const remoteSyncTime = remoteDoc.data.syncedAt || 0;

            console.log(
              `Conflict for document ${remoteDoc.data.id}: existing syncedAt=${existingSyncTime}, remote syncedAt=${remoteSyncTime}`
            );

            console.log("Remote document:", remoteDoc);

            if (remoteSyncTime > existingSyncTime) {
              console.log(
                `Updating local document ${remoteDoc.data.id} with remote version`
              );
              await existingDoc.update({
                $set: {
                  ...remoteDoc.data,
                  syncedAt: remoteSyncTime,
                },
              });
            } else {
              console.log(
                `Local document ${remoteDoc.data.id} is newer, keeping local version`
              );
            }
          } else {
            // Document doesn't exist locally, insert it
            console.log(`Inserting new remote document ${remoteDoc.data.id}`);
            const { ...docData } = remoteDoc.data;
            await collection.insert({
              ...docData,
              syncedAt: remoteDoc.syncedAt,
            });
          }
        } catch (error) {
          console.error(`Failed to merge document ${remoteDoc.id}:`, error);
        }
      }

      console.log(`Successfully merged remote data for ${collectionName}`);
    } catch (error) {
      console.error("Failed to merge remote data:", error);
    }
  }
}

export const syncEngine = new SyncEngine();
