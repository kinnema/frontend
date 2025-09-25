import { RxError } from "rxdb";
import type {
  PeerWithMessage,
  PeerWithResponse,
  WebRTCConnectionHandler,
  WebRTCConnectionHandlerCreator,
  WebRTCMessage,
} from "rxdb/plugins/replication-webrtc";
import { Subject } from "rxjs";
import type { BaseRoomConfig, Room } from "trystero";
import { joinRoom } from "trystero";
import { onlinePeers$ } from "../features/sync/observables";

type PeerId = string;

interface HandlerConfig {
  config: BaseRoomConfig;
}
export function getTrysteroConnectionHandler({
  config,
}: HandlerConfig): WebRTCConnectionHandlerCreator<PeerId> {
  const creator: WebRTCConnectionHandlerCreator<PeerId> = async (options) => {
    const connect$ = new Subject<PeerId>();
    const disconnect$ = new Subject<PeerId>();
    const message$ = new Subject<PeerWithMessage<string>>();
    const response$ = new Subject<PeerWithResponse<string>>();
    const error$ = new Subject<RxError>();

    let closed = false;
    console.log("Trystero connection handler created with options:", options);
    const room: Room = joinRoom(config, options.topic);
    const [sendMessage, getMessage] = room.makeAction("MESSAGE");

    room.onPeerJoin((peerId: PeerId) => {
      console.log("Peer joined:", peerId);
      onlinePeers$.next(
        Object.keys(room.getPeers()).map((id) => id.toString())
      );
      connect$.next(peerId);
    });
    room.onPeerLeave((peerId: PeerId) => {
      console.log("Peer left:", peerId);
      onlinePeers$.next(
        Object.keys(room.getPeers()).map((id) => id.toString())
      );
      disconnect$.next(peerId);
    });

    getMessage((data: any, peerId: PeerId) => {
      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed && parsed.result) {
          response$.next({ peer: peerId, response: parsed });
        } else {
          message$.next({ peer: peerId, message: parsed });
        }
      } catch (err) {
        console.error("Error processing incoming message", err);
      }
    });

    const handler: WebRTCConnectionHandler<PeerId> = {
      connect$,
      disconnect$,
      error$,
      message$,
      response$,
      async send(peer: PeerId, message: WebRTCMessage) {
        try {
          sendMessage(JSON.stringify(message), peer);
        } catch (err) {}
      },
      async close() {
        if (!closed) {
          closed = true;
          try {
            room.leave();
          } catch (e) {}
          error$.complete();
          connect$.complete();
          disconnect$.complete();
          message$.complete();
          response$.complete();
        }
        return Promise.resolve();
      },
    };

    return handler;
  };

  return creator;
}
