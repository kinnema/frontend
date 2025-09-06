import { useSyncStore } from "@/lib/stores/sync.store";
import { getP2pConfig } from "@/lib/utils/p2p/config";
import { produce } from "immer";
import { replicateWebRTC } from "rxdb/plugins/replication-webrtc";
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

interface ReplicationOptions {
  enabled: boolean;
  type: string;
  options: any;
}

class RxdbReplicationFactory {
  private syncStore = useSyncStore.getState();
  private _replications = new Map<string, ReplicationInstance>();
  private replicationOptions = new Map<string, ReplicationOptions>();

  public async initialize() {
    await this.initializeReplications();
    this.initializeObservable();
  }

  private initializeObservable() {
    availableCollectionsForSync$.subscribe(async (collections) => {
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

    availableCollections.forEach(async (collection) => {
      collection.replicationTypes.forEach(async (type) => {
        let options: any;
        switch (type) {
          case "webrtc":
            options = {
              collection: db[collection.key as keyof typeof db],
              topic: `kinnema-${this.syncStore.syncId}-${collection.key}`,
              connectionHandlerCreator: connectionHandler,
              pull: {},
              push: {},
            };
            break;
          case "nostr":
            options = {
              collection: db[collection.key as keyof typeof db],
              collectionName: collection.key,
            };
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
        this.add(key, replication);
      });

      if (collection.enabled) {
        await this.enableReplication(collection.key);
      }
    });
  }

  public async enableReplication(collectionKey: AvailableCollectionForSync) {
    const collection = this.syncStore.availableCollections.find(
      (c) => c.key === collectionKey
    );
    if (collection) {
      for (const type of collection.replicationTypes) {
        await this.enableReplicationForType(collectionKey, type);
      }
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
      this.updateReplicationStore(collectionKey, true);
      let instance: ReplicationInstance;
      switch (replication.type) {
        case "webrtc":
          instance = await replicateWebRTC(replication.options);
          break;
        case "nostr":
          instance = new NostrReplicationManager() as ReplicationInstance;
          break;
        default:
          throw new Error(`Unsupported replication type: ${replication.type}`);
      }
      this._replications.set(key, instance);
    }
  }

  public async disableReplication(collectionKey: AvailableCollectionForSync) {
    const collection = this.syncStore.availableCollections.find(
      (c) => c.key === collectionKey
    );
    if (collection) {
      for (const type of collection.replicationTypes) {
        await this.disableReplicationForType(collectionKey, type);
      }
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
      this.updateReplicationStore(collectionKey, false);
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
    enabled: boolean
  ) {
    const syncStore = useSyncStore.getState();
    const updatedCollections = produce(
      syncStore.availableCollections,
      (draft) => {
        draft.find((c) => c.key === id)!.enabled = enabled;

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
    this._replications.forEach((value, key) => {
      const collectionKey = key.split("-")[0] as AvailableCollectionForSync;
      this.updateReplicationStore(collectionKey, false);
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
