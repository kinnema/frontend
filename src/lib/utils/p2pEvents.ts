import { Subject } from "rxjs";
import { Commands, Status } from "../types/watchTogether.types";

const status$ = new Subject<{ status: Status; peerId: string }>();
const command$ = new Subject<{ command: Commands; payload: unknown }>();
const loadedVideo$ = new Subject<{ videoUrl?: string }>();

export const p2pEvents = {
  status$,
  command$,
  loadedVideo$,
};
