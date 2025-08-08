import { ActionProgress, ActionReceiver, ActionSender } from "trystero";

export type Commands =
  | "CHECK_ADMIN"
  | "SYNC"
  | "PLAY"
  | "PAUSE"
  | "RETRIEVE_URL";
export type Status = "JOINED" | "LEAVED";

export interface IP2PCommand<T = Commands> {
  command: T;
  payload: unknown;
}

export enum P2PAction {
  INFO = "INFO",
}

export type P2PCreateAction<T> =
  | [
      ActionSender<IP2PCommand<T>>,
      ActionReceiver<IP2PCommand<T>>,
      ActionProgress
    ]
  | undefined;

export type InfoActionCommands = "ROOM_DETAILS" | "DATA";

export interface IRoomDetails {
  access: boolean;
  adminId: string;
}
