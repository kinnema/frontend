import EventEmitter from "eventemitter3";
import TypedEmitter from "typed-emitter";
import { Commands, Status } from "../types/p2p.types";

type P2PEvents = {
  status: (status: Status, peerId: string) => void;
  command: (command: Commands, payload: unknown) => void;
  loadedVideo: (videoUrl?: string) => void;
};

export const p2pEventEmitter = new EventEmitter() as TypedEmitter<P2PEvents>;
