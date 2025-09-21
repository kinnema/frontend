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
  payload: any;
}

export interface NostrWorkerMessage extends WorkerMessage {
  type: "init" | "sync" | "status" | "result" | "delete";
}

export interface WebRTCWorkerMessage extends WorkerMessage {
  type: "init" | "sync" | "peer" | "status" | "result";
}

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
