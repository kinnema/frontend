import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { joinRoom as joinChannel, Room, selfId } from "trystero/torrent";
import { v4 as uuid } from "uuid";

interface IProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const password = import.meta.env.VITE_P2P_KEY;
const p2pConfig = {
  appId: "com.kinnema",
  password,
};

export interface IP2PCommand {
  command: "CHECK_ADMIN" | "SYNC" | "PLAY" | "PAUSE";
  payload: unknown;
}
interface IProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useP2P({ videoRef }: IProps) {
  const room = useRef<Room | undefined>(undefined);
  const roomAdmin = useRef<string>(selfId);
  const { toast } = useToast();

  function createRoom(): string {
    const roomId = uuid();
    const _room = joinChannel(p2pConfig, roomId);
    room.current = _room;
    const [sendAction, getAction] = room.current?.makeAction("WATCH");

    _room.onPeerJoin(() => {
      console.log("Peer joined");
      sendAction({
        command: "CHECK_ADMIN",
        payload: roomAdmin.current,
      });

      videoRef.current?.addEventListener("play", () => {
        sendAction({
          command: "PLAY",
          payload: videoRef.current?.currentTime ?? 0,
        });
      });

      videoRef.current?.addEventListener("pause", () => {
        sendAction({
          command: "PAUSE",
          payload: null,
        });
      });

      videoRef.current?.addEventListener("playing", (c) => {
        setInterval(() => {
          sendAction({
            command: "SYNC",
            payload: Math.floor(videoRef.current?.currentTime ?? 0),
          });
        }, 10_000);
      });
    });

    _room.onPeerLeave(() => {
      toast({
        title: "2. kisi ayrildi!",
        description: "2. kisi ayrildi!",
      });
      videoRef.current?.pause();
    });

    return roomId;
  }

  function joinRoom(roomId: string) {
    const _room = joinChannel(p2pConfig, roomId);
    room.current = _room;
    const [sendAction, getAction] = room.current?.makeAction("WATCH");

    getAction((data) => {
      const _data = data as unknown as IP2PCommand;
      console.log(_data);

      switch (_data.command) {
        case "CHECK_ADMIN":
          roomAdmin.current = _data.payload as string;
          break;
        case "PAUSE":
          videoRef.current?.pause();
          break;
        case "PLAY":
          videoRef.current!.currentTime = _data.payload as number;
          videoRef.current?.play();
          break;
        case "SYNC":
          if (
            Math.floor(videoRef.current?.currentTime ?? 0) !== _data.payload
          ) {
            videoRef.current!.currentTime = _data.payload as number;
          }
          break;

        default:
          break;
      }
    });
  }

  return {
    createRoom,
    joinRoom,
  };
}
