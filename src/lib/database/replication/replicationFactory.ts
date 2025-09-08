import { useSyncStore } from "@/lib/stores/sync.store";
import { getP2pConfig } from "@/lib/utils/p2p/config";
import { produce } from "immer";
import { replicateWebRTC, SyncOptionsWebRTC } from "rxdb/plugins/replication-webrtc";
import { Subscription } from "rxjs";
import { getTrysteroConnectionHandler } from "../connectionHandlers/trysteroConnectionHandler";
import { getDb } from "../rxdb";
import {
  AvailableCollectionForSync,
  availableCollectionsForSync$,
} from "./availableReplications";
import { NostrReplicationManager } from "./nostrReplication";

interface ReplicationInstance {
  cancel?(): void;
  connectionHandler?: { close(): void };
}

interface WebRTCReplicationOptions {
  collection: any; // RxCollection type
  topic: string;
  connectionHandlerCreator: any;
  pull: Record<string, unknown>;
  push: Record<string, unknown>;
}

interface NostrReplicationOptions {
  collection: any; // RxCollection type
  collectionName: string;
}

type ReplicationOptionTypes = WebRTCReplicationOptions | NostrReplicationOptions;

interface ReplicationOptions {
  enabled: boolean;
  type: string;
  options: ReplicationOptionTypes;
}

class RxdbReplicationFactory {
  private syncStore = useSyncStore.getState();
  private _replications = new Map<string, ReplicationInstance>();
  private replicationOptions = new Map<string, ReplicationOptions>();
  private observableSubscription: Subscription | null = null;

  public async initialize() {
    await this.initializeReplications();
    this.initializeObservable();
  }

  private initializeObservable() {
    // Clean up existing subscription if any
    if (this.observableSubscription) {
      this.observableSubscription.unsubscribe();
    }
    
    this.observableSubscription = availableCollectionsForSync$.subscribe(async (collections) => {
      this.syncStore.setAvailableCollections(collections);
      await this.initializeReplications();
    });
  }

  private async initializeReplications() {
    const db = await getDb();
    const availableCollections = this.syncStore.availableCollections;

    const p2pConfig = getP2pConfig({
      password: this.syncStore.syncId,
    });
    const connectionHandler = getTrysteroConnectionHandler({
      config: p2pConfig,
    });

    // Process collections sequentially to avoid race conditions
    for (const collection of availableCollections) {
      for (const type of collection.replicationTypes) {
        let options: ReplicationOptionTypes;
        switch (type) {
          case "webrtc":
            options = {
              collection: db[collection.key as keyof typeof db],
              topic: `kinnema-${this.syncStore.syncId}-${collection.key}`,
              connectionHandlerCreator: connectionHandler,
              pull: {},
              push: {},
            } as WebRTCReplicationOptions;
            break;
          case "nostr":
            options = {
              collection: db[collection.key as keyof typeof db],
              collectionName: collection.key,
            } as NostrReplicationOptions;
            break;
          default:
            throw new Error(`Unsupported replication type: ${type}`);
        }

        const replication = {
          enabled: collection.enabled,
          type,
          options,
        };

        const key = `${collection.key}-${type}`;
        await this.add(key, replication);
      }

      if (collection.enabled) {
        await this.enableReplication(collection.key);
      }
    }
  }

  public async enableReplication(
    collectionKey: AvailableCollectionForSync,
    type: "nostr" | "webrtc" | "all" = "all"
  ) {
    const collection = this.syncStore.availableCollections.find(
      (c) => c.key === collectionKey
    );
    if (collection) {
      if (type === "all") {
        for (const t of collection.replicationTypes) {
          await this.enableReplicationForType(collectionKey, t);
        }
        return;
      }

      await this.enableReplicationForType(collectionKey, type);
    }
  }

  private async enableReplicationForType(
    collectionKey: AvailableCollectionForSync,
    type: string
  ) {
    const key = `${collectionKey}-${type}`;
    const replication = this.get(key);
    if (replication) {
      replication.enabled = true;
      this.updateReplicationStore(collectionKey, type, true);
      let instance: ReplicationInstance;
      switch (replication.type) {
        case "webrtc":
          instance = await replicateWebRTC(replication.options);
          break;
        case "nostr":
          const currentState = useSyncStore.getState();
          const relayUrls = currentState.nostrRelayUrls?.map(r => r.url) || [];
          instance = new NostrReplicationManager({
            secretKey: currentState.nostrSecretKey,
            relayUrls: relayUrls,
          }) as ReplicationInstance;
          break;
        default:
          throw new Error(`Unsupported replication type: ${replication.type}`);
      }
      this._replications.set(key, instance);
    }
  }

  public async disableReplication(
    collectionKey: AvailableCollectionForSync,
    type: "nostr" | "webrtc" | "all" = "all"
  ) {
    const collection = this.syncStore.availableCollections.find(
      (c) => c.key === collectionKey
    );
    if (collection) {
      if (type === "all") {
        for (const t of collection.replicationTypes) {
          await this.disableReplicationForType(collectionKey, t);
        }
        return;
      }
      await this.disableReplicationForType(collectionKey, type);
    }
  }

  private async disableReplicationForType(
    collectionKey: AvailableCollectionForSync,
    type: string
  ) {
    const key = `${collectionKey}-${type}`;
    const replication = this.get(key);

    if (replication) {
      replication.enabled = false;
      this.updateReplicationStore(collectionKey, type, false);
      const instance = this._replications.get(key);
      if (instance) {
        if (instance.cancel) {
          instance.cancel();
        }
        this._replications.delete(key);
      }
    }
  }
  private updateReplicationStore(
    id: AvailableCollectionForSync,
    type: string,
    enabled: boolean
  ) {
    const syncStore = useSyncStore.getState();
    const updatedCollections = produce(
      syncStore.availableCollections,
      (draft) => {
        const coll = draft.find((c) => c.key === id);
        if (coll) {
          coll.enabled = enabled;

          if (type === "all") {
            if (enabled) {
              coll.enabledReplicationTypes = [...coll.replicationTypes];
            } else {
              coll.enabledReplicationTypes = [];
            }

            return draft;
          }

          const doesExists = coll.enabledReplicationTypes.find(
            (t) => t === type
          );
          if (doesExists && !enabled) {
            coll.enabledReplicationTypes = coll.enabledReplicationTypes.filter(
              (t) => t !== type
            );
          } else if (!doesExists && enabled) {
            coll.enabledReplicationTypes.push(type);
          }
        }

        return draft;
      }
    );

    this.syncStore.setAvailableCollections(updatedCollections);
  }

  public async add(id: string, replication: ReplicationOptions) {
    this.replicationOptions.set(id, replication);
  }

  public remove(id: string) {
    this.replicationOptions.delete(id);
  }

  public get(id: string) {
    return this.replicationOptions.get(id);
  }

  public disable() {
    // Clean up observable subscription
    if (this.observableSubscription) {
      this.observableSubscription.unsubscribe();
      this.observableSubscription = null;
    }
    
    this._replications.forEach((value, key) => {
      const collectionKey = key.split("-")[0] as AvailableCollectionForSync;
      this.updateReplicationStore(collectionKey, "all", false);
      if (value.connectionHandler) {
        value.connectionHandler.close();
      }
      if (value.cancel) {
        value.cancel();
      }
    });
    this._replications.clear();
    this.syncStore.clearPeers();
  }
}

export const rxdbReplicationFactory = new RxdbReplicationFactory();
