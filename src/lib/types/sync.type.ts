export interface IRelay {
  id: string;
  url: string;
  status: "connected" | "disconnected";
}

export enum SYNC_STATUS {
  IDLE = "IDLE",
  SYNCING = "SYNCING",
  ERROR = "ERROR",
  COMPLETE = "COMPLETE",
}

export enum SYNC_CONNECTION_STATUS {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
}
