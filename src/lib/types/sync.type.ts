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
