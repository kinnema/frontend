import { IPlugin } from "@/lib/types/plugin.type";
import { SimplePool } from "nostr-tools";

export interface SyncIdentity {
  mnemonic: string;
  nostrPrivateKey: string;
  nostrPublicKey: string;
  p2pId: string;
  deviceId: string;
}

export interface SyncCollection {
  name: string;
  enabled: boolean;
  nostrEnabled: boolean;
  webrtcEnabled: boolean;
}

export interface SyncState {
  identity: SyncIdentity | null;
  collections: SyncCollection[];
  nostrStatus: ConnectionStatus;
  webrtcStatus: ConnectionStatus;
  nostrRelays: NostrRelay[];
  isActive: boolean;
}

export interface NostrRelay {
  url: string;
  status: ConnectionStatus;
}

export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error",
}

export interface SyncResult {
  collection: string;
  type: "nostr" | "webrtc";
  success: boolean;
  synced: number;
  fetched?: number;
  errors: string[];
}

export interface WorkerMessage {
  type: string;
  payload?: any;
}

export interface NostrWorkerInitMessage {
  type: "init";
  payload: {
    privateKeyHex: string;
    publicKeyHex: string;
    relays: any[];
  };
}

export interface NostrWorkerSyncMessage {
  type: "sync";
  payload: {
    collection: string;
    documents: any[];
  };
}

export interface NostrWorkerDeleteMessage {
  type: "delete";
  payload: {
    type: "plugin" | "document";
    id: string;
  };
}

export interface NostrWorkerSyncPluginsMessage {
  type: "sync-plugins";
  payload: any[];
}

export type NostrWorkerIncomingMessage =
  | NostrWorkerInitMessage
  | NostrWorkerSyncMessage
  | NostrWorkerDeleteMessage
  | NostrWorkerSyncPluginsMessage
  | { type: "status"; payload: any }
  | { type: "result"; payload: any };

export interface NostrWorkerMessage extends WorkerMessage {
  type:
    | "init"
    | "sync"
    | "status"
    | "result"
    | "delete"
    | "sync-plugins"
    | "result-plugins"
    | "deleted-plugins";
  payload: any;
}

export interface WebRTCWorkerInitMessage {
  type: "init";
  payload: {
    peerId: string;
  };
}

export interface WebRTCWorkerSyncMessage {
  type: "sync";
  payload: {
    collection: string;
    documents: any[];
  };
}

export interface WebRTCWorkerSyncPluginsMessage {
  type: "sync-plugins";
  payload: IPlugin[];
}
export interface WebRTCWorkerPeerMessage {
  type: "peer";
  payload: any;
}

export interface WebRTCWorkerStatusMessage {
  type: "status";
  payload: {
    status: ConnectionStatus;
  };
}

export interface WebRTCWorkerResultMessage {
  type: "result";
  payload: {
    collection: string;
    synced: number;
    total: number;
    peers: string[];
  };
}

export interface WebRTCWorkerResultPluginsMessage {
  type: "result-plugins";
  payload: IPlugin[];
}

export interface WebRTCWorkerErrorMessage {
  type: "error";
  payload: {
    error: string;
  };
}

export type WebRTCWorkerOutgoingMessage =
  | WebRTCWorkerStatusMessage
  | WebRTCWorkerResultMessage
  | WebRTCWorkerResultPluginsMessage
  | WebRTCWorkerPeerMessage
  | WebRTCWorkerErrorMessage;

export type WebRTCWorkerIncomingMessage =
  | WebRTCWorkerInitMessage
  | WebRTCWorkerSyncMessage
  | WebRTCWorkerPeerMessage
  | WebRTCWorkerStatusMessage
  | WebRTCWorkerResultMessage
  | WebRTCWorkerSyncPluginsMessage;

export interface WebRTCWorkerMessage extends WorkerMessage {
  type:
    | "init"
    | "sync"
    | "peer"
    | "status"
    | "result"
    | "sync-plugins"
    | "result-plugins";
}

export interface TypedWorker<TIncoming, TOutgoing> extends Worker {
  postMessage(message: TIncoming): void;
  onmessage:
    | ((
        this: TypedWorker<TIncoming, TOutgoing>,
        ev: MessageEvent<TOutgoing>
      ) => any)
    | null;
}

export interface NostrWorkerSyncStartMessage {
  type: "sync-start";
  payload?: undefined;
}

export interface NostrWorkerSyncCompleteMessage {
  type: "sync-complete";
  payload: {
    collection: string;
  };
}

export interface NostrWorkerMergedDeletionsMessage {
  type: "merged-deletions";
  payload: {
    deletedIds: string[];
  };
}
export interface NostrWorkerResultPluginsMessage {
  type: "result-plugins";
  payload: IPlugin[];
}

export interface NostrWorkerDeletedPluginsMessage {
  type: "deleted-plugins";
  payload: { pluginId: string; deletedAt: number }[];
}

export interface NostrWorkerRelayStatusMessage {
  type: "relay-status";
  payload: {
    relay: string;
    status: ConnectionStatus;
  };
}

export interface NostrWorkerStatusMessage {
  type: "status";
  payload: {
    status: ConnectionStatus;
  };
}

export interface NostrWorkerResultMessage {
  type: "result";
  payload: {
    collection: string;
    published: number;
    fetched: number;
    publishResults: Array<{
      id: string;
      success: boolean;
      error: string | null;
    }>;
    remoteData: any[];
    total: number;
  };
}

export interface NostrWorkerPartialSyncMessage {
  type: "partial-sync";
  payload: {
    collection: string;
    documents: any[];
  };
}

export interface NostrWorkerErrorMessage {
  type: "error";
  payload: {
    error: string;
  };
}

export type NostrWorkerOutgoingMessage =
  | NostrWorkerSyncStartMessage
  | NostrWorkerSyncCompleteMessage
  | NostrWorkerMergedDeletionsMessage
  | NostrWorkerRelayStatusMessage
  | NostrWorkerStatusMessage
  | NostrWorkerResultMessage
  | NostrWorkerPartialSyncMessage
  | NostrWorkerErrorMessage
  | NostrWorkerResultPluginsMessage
  | NostrWorkerDeletedPluginsMessage;

export interface SyncStore extends SyncState {
  generateIdentity: () => Promise<void>;
  setIdentity: (mnemonic: string) => Promise<void>;
  clearIdentity: () => void;
  updateCollectionConfig: (
    name: string,
    config: Partial<SyncCollection>
  ) => void;
  setNostrStatus: (status: ConnectionStatus) => void;
  setWebRTCStatus: (status: ConnectionStatus) => void;
  setActive: (active: boolean) => void;
  addRelay: (url: string) => void;
  removeRelay: (url: string) => void;
  setRelayStatus: (url: string, status: ConnectionStatus) => void;
}

export interface IEventOptions {
  privateKey: Uint8Array;
  publicKey: string;
  relays: string[];
  isInitialized: boolean;
  pool: SimplePool;
}
