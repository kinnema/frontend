import { useSyncStore } from "@/lib/stores/sync.store";
import { getP2pConfig } from "@/lib/utils/p2p/config";
import { produce } from "immer";
import {
  replicateWebRTC,
  RxWebRTCReplicationPool,
  SyncOptionsWebRTC,
} from "rxdb/plugins/replication-webrtc";
import { getTrysteroConnectionHandler } from "../connectionHandlers/trysteroConnectionHandler";
import { getDb } from "../rxdb";
import {
  AvailableCollectionForSync,
  availableCollectionsForSync$,
} from "./availableReplications";

interface ReplicationOptions {
  enabled: boolean;
  options: SyncOptionsWebRTC<unknown, string>;
}

class RxdbReplicationFactory {
  private syncStore = useSyncStore.getState();
  private _replications = new Map<
    AvailableCollectionForSync,
    RxWebRTCReplicationPool<unknown, string>
  >();
  private replicationOptions = new Map<
    AvailableCollectionForSync,
    ReplicationOptions
  >();

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
      const replication = {
        enabled: collection.enabled,
        options: {
          collection: db[collection.key as keyof typeof db],
          topic: `kinnema-${this.syncStore.syncId}-${collection.key}`,
          connectionHandlerCreator: connectionHandler,
          pull: {},
          push: {},
        },
      };

      if (collection.enabled) {
        await this.enableReplication(collection.key);
      }

      this.add(collection.key, replication);
    });
  }

  public async enableReplication(id: AvailableCollectionForSync) {
    const replication = this.get(id);
    if (replication) {
      replication.enabled = true;
      this.updateReplicationStore(id, true);
      const instance = await replicateWebRTC(replication.options);
      this._replications.set(id, instance);
    }
  }

  public async disableReplication(id: AvailableCollectionForSync) {
    const replication = this.get(id);
    if (replication) {
      replication.enabled = false;
      this.updateReplicationStore(id, false);
      const instance = this._replications.get(id);
      if (instance) {
        instance.cancel();
        this._replications.delete(id);
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

  public async add(
    id: AvailableCollectionForSync,
    replication: ReplicationOptions
  ) {
    this.replicationOptions.set(id, replication);
  }

  public remove(id: AvailableCollectionForSync) {
    this.replicationOptions.delete(id);
  }

  public get(id: AvailableCollectionForSync) {
    return this.replicationOptions.get(id);
  }

  public disable() {
    this._replications.forEach((value, key) => {
      this.updateReplicationStore(key, false);
      value.connectionHandler.close();
      value.cancel();
    });
    this._replications.clear();
    this.syncStore.clearPeers();
  }
}

export const rxdbReplicationFactory = new RxdbReplicationFactory();
