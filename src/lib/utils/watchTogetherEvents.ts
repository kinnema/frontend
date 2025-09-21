import { Subject } from "rxjs";
import { Commands, Status } from "../types/watchTogether.types";

type P2PEvents = {
  status: (status: Status, peerId: string) => void;
  command: (command: Commands, payload: unknown) => void;
  loadedVideo: (videoUrl?: string) => void;
};

const status$ = new Subject<{ status: Status; peerId: string }>();
const command$ = new Subject<{ command: Commands; payload: unknown }>();
const loadedVideo$ = new Subject<{ videoUrl?: string }>();

export const watchTogetherEvents = {
  status$,
  command$,
  loadedVideo$,
};
