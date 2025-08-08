import EventEmitter from "events";
import TypedEmitter from "typed-emitter";

type VideoEvents = {
  loadVideo: (videoUrl: string) => void;
};

export const videoEventEmitter =
  new EventEmitter() as TypedEmitter<VideoEvents>;
