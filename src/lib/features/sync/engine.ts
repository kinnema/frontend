import { getDb } from "@/lib/database/rxdb";
import { lastSyncedAt$, syncingStatus$ } from "./observables";
import { useSyncStore } from "./store";
import { ConnectionStatus, SyncResult } from "./types";

export class SyncEngine {
  private nostrWorker: Worker | null = null;
  private webrtcWorker: Worker | null = null;
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
    1;
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
      hasWebRTCWorker: !!this.webrtcWorker,
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

    if (this.webrtcWorker) {
      console.log("Terminating WebRTC worker");
      this.webrtcWorker.terminate();
      this.webrtcWorker = null;
    }

    useSyncStore.getState().setNostrStatus(ConnectionStatus.DISCONNECTED);
    useSyncStore.getState().setWebRTCStatus(ConnectionStatus.DISCONNECTED);
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
    // Sync every 5 minutes to fetch remote updates
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
        this.initWebRTCWorker(identity.p2pId),
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
        const { type, payload } = event.data;

        switch (type) {
          case "sync-start":
            syncingStatus$.next(true);
            break;
          case "sync-complete":
            syncingStatus$.next(false);
            lastSyncedAt$.next(new Date());
            break;
          case "merged-deletions":
            const { deletedIds } = payload;
            console.log(
              `Received ${deletedIds.length} merged deleted IDs from Nostr worker`
            );
            this.handleDeletedIds(deletedIds);
            break;
          case "relay-status":
            const { relay, status } = payload;
            useSyncStore.getState().setRelayStatus(relay, status);
            console.log(`Relay ${relay} status: ${status}`);
            break;
          case "status":
            useSyncStore.getState().setNostrStatus(payload.status);
            if (payload.status === ConnectionStatus.CONNECTED) {
              console.log("Nostr worker initialization completed");
              resolve();
            }
            break;
          case "result":
            this.handleSyncResult("nostr", payload);
            break;
          case "partial-sync":
            await this.mergeRemoteData(payload.collection, payload.documents);
            break;
          case "error":
            console.error("Nostr worker error:", payload.error);
            useSyncStore.getState().setNostrStatus(ConnectionStatus.ERROR);

            if (payload.error.includes("Initialization failed")) {
              reject(new Error(payload.error));
            }
            break;
        }
      };

      this.nostrWorker!.postMessage({
        type: "init",
        payload: {
          privateKeyHex: privateKey,
          publicKeyHex: publicKey,
          relays,
        },
      });

      setTimeout(() => {
        reject(new Error("Nostr worker initialization timeout"));
      }, 10000);
    });
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

  public async deleteNostrEvent(documentId: string) {
    if (!this.nostrWorker) {
      console.error("Nostr worker is not initialized");
      return;
    }

    this.nostrWorker.postMessage({
      type: "delete",
      payload: documentId,
    });
  }

  private async initWebRTCWorker(peerId: string) {
    const WebRTCWorker = await import("./workers/webrtc.worker?worker");
    this.webrtcWorker = new WebRTCWorker.default();

    return new Promise<void>((resolve, reject) => {
      this.webrtcWorker!.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
          case "status":
            useSyncStore.getState().setWebRTCStatus(payload.status);
            // Resolve when worker is connected
            if (payload.status === ConnectionStatus.CONNECTED) {
              console.log("WebRTC worker initialization completed");
              resolve();
            }
            break;
          case "result":
            this.handleSyncResult("webrtc", payload);
            break;
          case "peer":
            console.log("Peer event:", payload);
            break;
          case "error":
            console.error("WebRTC worker error:", payload.error);
            useSyncStore.getState().setWebRTCStatus(ConnectionStatus.ERROR);
            // Reject on initialization error
            if (payload.error.includes("Initialization failed")) {
              reject(new Error(payload.error));
            }
            break;
        }
      };

      this.webrtcWorker!.postMessage({
        type: "init",
        payload: { peerId },
      });

      // Add timeout for initialization
      setTimeout(() => {
        reject(new Error("WebRTC worker initialization timeout"));
      }, 10000); // 10 second timeout
    });
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
        this.nostrWorker.postMessage({
          type: "sync",
          payload: {
            collection: collection.name,
            documents,
          },
        });
      }

      if (collection.webrtcEnabled && this.webrtcWorker) {
        console.log(
          `Starting WebRTC sync for ${collection.name} with ${documents.length} documents`
        );
        this.webrtcWorker.postMessage({
          type: "sync",
          payload: {
            collection: collection.name,
            documents,
          },
        });
      }
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

  private handleSyncResult(type: "nostr" | "webrtc", payload: any) {
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
