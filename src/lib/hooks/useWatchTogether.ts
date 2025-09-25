import { useRef } from "react";
import { joinRoom as joinChannel, Room } from "trystero/torrent";
import { v4 as uuid } from "uuid";
import {
  Commands,
  IP2PCommand,
  P2PAction,
  P2PCreateAction,
} from "../types/watchTogether.types";
import { getWatchTogetherConfig } from "../utils/watchTogether/config";
import { watchTogetherEvents } from "../utils/watchTogether/watchTogetherEvents";

export function useWatchTogether() {
  const room = useRef<Room | undefined>(undefined);

  function createRoomId(): string {
    return uuid();
  }

  function createAction<T = Commands>(
    action: P2PAction | string,
    roomi?: Room
  ): P2PCreateAction<T> {
    if (roomi) {
      const _action = roomi.makeAction(action) as unknown as P2PCreateAction<T>;

      return _action;
    }

    return room.current?.makeAction(action) as P2PCreateAction<T>;
  }

  function createRoom(roomId: string) {
    const p2pConfig = getWatchTogetherConfig();
    const _room = joinChannel(p2pConfig, roomId);
    room.current = _room;
    const [sendAction, getAction] = room.current?.makeAction("WATCH");

    _room.onPeerJoin((peerId: string) => {
      console.log("Peer joined");
      watchTogetherEvents.status$.next({ status: "JOINED", peerId });
    });

    _room.onPeerLeave((peerId: string) => {
      console.log("Peer left");
      watchTogetherEvents.status$.next({ status: "LEAVED", peerId });
    });

    getAction((data) => {
      const _data = data as unknown as IP2PCommand;
      console.log(_data);

      watchTogetherEvents.command$.next({
        command: _data.command,
        payload: _data.payload,
      });
    });

    return { sendAction, getAction, room: _room };
  }

  function joinRoom(roomId: string) {
    const p2pConfig = getWatchTogetherConfig();
    const _room = joinChannel(p2pConfig, roomId);
    room.current = _room;
    const [sendAction, getAction] = room.current?.makeAction("WATCH");

    getAction((data) => {
      const _data = data as unknown as IP2PCommand;
      console.log(_data);

      watchTogetherEvents.command$.next({
        command: _data.command,
        payload: _data.payload,
      });
    });

    _room.onPeerJoin((peerId: string) => {
      console.log("Peer joined");
      watchTogetherEvents.status$.next({ status: "JOINED", peerId });
    });

    _room.onPeerLeave((peerId: string) => {
      console.log("Peer left");

      watchTogetherEvents.status$.next({ status: "LEAVED", peerId });
    });

    return { sendAction };
  }

  function leaveRoom() {
    room.current?.leave();
  }

  return {
    createRoom,
    joinRoom,
    createRoomId,
    leaveRoom,
    createAction,
  };
}
