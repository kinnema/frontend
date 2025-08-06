export type Commands =
  | "CHECK_ADMIN"
  | "SYNC"
  | "PLAY"
  | "PAUSE"
  | "DATA"
  | "RETRIEVE_URL";
export type Status = "JOINED" | "LEAVED";

export interface IP2PCommand {
  command: Commands;
  payload: unknown;
}
