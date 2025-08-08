import { useRef } from "react";
import {
  BaseRoomConfig,
  joinRoom as joinChannel,
  RelayConfig,
  Room,
  TurnConfig,
} from "trystero/torrent";
import { v4 as uuid } from "uuid";
import {
  Commands,
  IP2PCommand,
  P2PAction,
  P2PCreateAction,
} from "../types/p2p.types";
import { p2pEventEmitter } from "../utils/p2pEvents";

const password = import.meta.env.VITE_P2P_KEY;
type P2PConfig = BaseRoomConfig & RelayConfig & TurnConfig;
const p2pConfig: P2PConfig = {
  appId: "com.kinnema",
  password,
  turnConfig: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
    {
      urls: "turn:161.35.65.1:3478",
      username: "username",
      credential: "password",
    },
  ],
};

export function useP2P() {
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
    const _room = joinChannel(p2pConfig, roomId);
    room.current = _room;
    const [sendAction, getAction] = room.current?.makeAction("WATCH");

    _room.onPeerJoin((peerId: string) => {
      console.log("Peer joined");
      p2pEventEmitter.emit("status", "JOINED", peerId);
    });

    _room.onPeerLeave((peerId: string) => {
      console.log("Peer left");
      p2pEventEmitter.emit("status", "LEAVED", peerId);
    });

    getAction((data) => {
      const _data = data as unknown as IP2PCommand;
      console.log(_data);

      p2pEventEmitter.emit("command", _data.command, _data.payload);
    });

    return { sendAction, getAction, room: _room };
  }

  function joinRoom(roomId: string) {
    const _room = joinChannel(p2pConfig, roomId);
    room.current = _room;
    const [sendAction, getAction] = room.current?.makeAction("WATCH");

    getAction((data) => {
      const _data = data as unknown as IP2PCommand;
      console.log(_data);

      p2pEventEmitter.emit("command", _data.command, _data.payload);
    });

    _room.onPeerJoin((peerId: string) => {
      console.log("Peer joined");
      p2pEventEmitter.emit("status", "JOINED", peerId);
    });

    _room.onPeerLeave((peerId: string) => {
      console.log("Peer left");

      p2pEventEmitter.emit("status", "LEAVED", peerId);
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
