import { ConnectionStatus, useSyncStore } from "@/lib/features/sync";
import { isSyncActive$, onlinePeers$ } from "@/lib/features/sync/observables";
import { getWatchTogetherConfig } from "@/lib/utils/watchTogether/config";
import { RxDatabase } from "rxdb";
import {
  replicateWebRTC,
  RxWebRTCReplicationPool,
} from "rxdb/plugins/replication-webrtc";
import { KinnemaCollections } from "../rxdb";
import { getTrysteroConnectionHandler } from "../webrtc.connection";

export async function setupWebrtcReplication(
  db: RxDatabase<KinnemaCollections>
) {
  isSyncActive$.subscribe(async (isActive) => {
    const enabledReplications: Map<
      string,
      RxWebRTCReplicationPool<unknown, string>
    > = new Map();

    if (!isActive) {
      enabledReplications?.forEach((replication) => {
        replication.cancel();
      });
      enabledReplications?.clear();
      useSyncStore.getState().setWebRTCStatus(ConnectionStatus.DISCONNECTED);
      console.log("WebRTC replication disabled.");
      return;
    }

    observeConnectionStatus();

    useSyncStore.getState().setWebRTCStatus(ConnectionStatus.IDLE);

    const p2pConfig = getWatchTogetherConfig();
    const connectionHandler = getTrysteroConnectionHandler({
      config: p2pConfig,
    });
    const p2pId = useSyncStore.getState().identity?.p2pId;
    const availableCollections = useSyncStore
      .getState()
      .collections.filter((col) => col.isRxdb);

    if (!p2pId || !availableCollections) {
      console.warn(
        "P2P ID or available collections are not set. Skipping WebRTC replication setup."
      );
      return;
    }

    for (const collection of availableCollections) {
      const collectionName = collection.name as keyof KinnemaCollections;
      if (collection.webrtcEnabled) {
        try {
          console.log(
            "Setting up WebRTC replication. Sync active:",
            p2pId,
            db[collectionName].name
          );

          const replication = await replicateWebRTC({
            collection: db[collectionName],
            connectionHandlerCreator: connectionHandler,
            topic: `kinnema-${p2pId}-${db[collectionName].name}`,
            pull: {},
            push: {},
          });
          enabledReplications.set(collectionName, replication);
        } catch (error) {
          continue;
        }
      }
    }

    if (enabledReplications.size > 0) {
      console.log(
        "Enabled WebRTC replications for collections:",
        enabledReplications
      );
    }
  });
}

function observeConnectionStatus() {
  onlinePeers$.subscribe((peers) => {
    const status =
      peers.length > 0
        ? ConnectionStatus.CONNECTED
        : ConnectionStatus.DISCONNECTED;
    useSyncStore.getState().setWebRTCStatus(status);
  });
}
