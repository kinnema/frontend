import { useRef } from "react";
import {
  BaseRoomConfig,
  joinRoom as joinChannel,
  RelayConfig,
  Room,
  TurnConfig,
} from "trystero";
import { v4 as uuid } from "uuid";
import { IP2PCommand } from "../types/p2p.types";
import { p2pEventEmitter } from "../utils/p2pEvents";

const password = import.meta.env.VITE_P2P_KEY;
type P2PConfig = BaseRoomConfig & RelayConfig & TurnConfig;
const p2pConfig: P2PConfig = {
  appId: "com.kinnema",
  password,
  turnConfig: [
    {
      urls: [
        "turn:eu-0.turn.peerjs.com:3478",
        "turn:us-0.turn.peerjs.com:3478",
      ],
      username: "peerjs",
      credential: "peerjsp",
      credentialType: "password",
    },
  ],
  rtcConfig: {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  },
};

export function useP2P() {
  const room = useRef<Room | undefined>(undefined);

  function createRoomId(): string {
    return uuid();
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

    return { sendAction };
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
  };
}
