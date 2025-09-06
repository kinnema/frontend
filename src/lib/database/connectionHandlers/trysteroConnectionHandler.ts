import { useSyncStore } from "@/lib/stores/sync.store";
import { RxError } from "rxdb";
import type {
  PeerWithMessage,
  PeerWithResponse,
  WebRTCConnectionHandler,
  WebRTCConnectionHandlerCreator,
  WebRTCMessage,
} from "rxdb/plugins/replication-webrtc";
import { Subject } from "rxjs";
import type { BaseRoomConfig, Room } from "trystero/torrent";
import { joinRoom } from "trystero/torrent";

type PeerId = string;

interface HandlerConfig {
  config: BaseRoomConfig;
}

/**
 * Returns a WebRTC connection handler creator that uses peer ids (string)
 * as the peer type. This is easy to adapt to other transports:
 * - emit whatever you want on connect$ (peer object / id)
 * - implement send(peer, message) accordingly
 */
export function getTrysteroConnectionHandler({
  config,
}: HandlerConfig): WebRTCConnectionHandlerCreator<PeerId> {
  const creator: WebRTCConnectionHandlerCreator<PeerId> = async (options) => {
    const connect$ = new Subject<PeerId>();
    const disconnect$ = new Subject<PeerId>();
    const message$ = new Subject<PeerWithMessage<string>>();
    const response$ = new Subject<PeerWithResponse<string>>();
    const error$ = new Subject<RxError>();
    const addPeer = useSyncStore.getState().addPeer;
    const removePeer = useSyncStore.getState().removePeer;

    let closed = false;
    console.log("Trystero connection handler created with options:", options);
    const room: Room = joinRoom(config, options.topic);
    const [sendMessage, getMessage] = room.makeAction("MESSAGE");

    // Trystero: notify about peer joins/leaves using peer id strings
    room.onPeerJoin((peerId: PeerId) => {
      console.log("Peer joined:", peerId);
      addPeer(peerId);
      connect$.next(peerId);
    });
    room.onPeerLeave((peerId: PeerId) => {
      console.log("Peer left:", peerId);
      removePeer(peerId);
      disconnect$.next(peerId);
    });

    // Trystero: handle incoming messages
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
      // send will be called by RxDB replication with whatever peer value you emitted on connect$
      async send(peer: PeerId, message: WebRTCMessage) {
        // Using Trystero send to a specific peer:
        // room.send(serializedMessage, peer);
        // If you want broadcast to all peers, call room.broadcast(...)
        try {
          sendMessage(JSON.stringify(message), peer);
        } catch (err) {
          //   error$.next(err instanceof Error ? err : new Error(String(err)));
        }
      },
      async close() {
        if (!closed) {
          closed = true;
          try {
            room.leave();
          } catch (e) {
            /* ignore leave errors */
          }
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
