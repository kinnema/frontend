import { IPlugin } from "@/lib/types/plugin.type";
import { ConnectionStatus, WebRTCWorkerMessage } from "../types";

let peerId: string;
let isInitialized = false;
let peers: Set<string> = new Set();
let syncedPlugins: IPlugin[] = [];

self.onmessage = async (event: MessageEvent<WebRTCWorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case "init":
        handleInit(payload);
        break;
      case "sync":
        await handleSync(payload);
        break;
      case "sync-plugins":
        await handleSyncPlugins(payload);
        break;
      case "peer":
        handlePeerEvent(payload);
        break;
      default:
        console.warn("Unknown message type:", type);
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      payload: { error: error?.toString() },
    });
  }
};

async function handleSyncPlugins(plugins: IPlugin[]) {
  console.log("WebRTC Worker: Syncing plugins...", plugins);

  if (!isInitialized) {
    throw new Error("Worker not initialized");
  }

  self.postMessage({
    type: "result-plugins",
    payload: [], //
  });

  syncedPlugins = plugins;

  console.log(`WebRTC Worker: Stored ${plugins.length} plugins for P2P sync`);
}

function handleInit(payload: any) {
  peerId = payload.peerId;

  self.postMessage({
    type: "status",
    payload: { status: ConnectionStatus.CONNECTING },
  });

  isInitialized = true;

  self.postMessage({
    type: "status",
    payload: { status: ConnectionStatus.CONNECTED },
  });
}

function handlePeerEvent(payload: any) {
  const { event, peer } = payload;

  switch (event) {
    case "connect":
      peers.add(peer);
      break;
    case "disconnect":
      peers.delete(peer);
      break;
  }

  self.postMessage({
    type: "peer",
    payload: {
      peers: Array.from(peers),
      event,
      peer,
    },
  });
}

async function handleSync(payload: any) {
  if (!isInitialized) {
    throw new Error("Worker not initialized");
  }

  const { collection, documents } = payload;

  self.postMessage({
    type: "result",
    payload: {
      collection,
      synced: documents.length,
      total: documents.length,
      peers: Array.from(peers),
    },
  });
}
