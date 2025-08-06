import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PeersList from "@/lib/components/Watch/PeersList";
import { WatchVideoPlayer } from "@/lib/components/Watch/WatchVideoPlayer";
import { useP2P } from "@/lib/hooks/useP2P";
import { IWatchTogetherRoom, useWatchStore } from "@/lib/stores/watch.store";
import { p2pEventEmitter } from "@/lib/utils/p2pEvents";
import { share } from "@/lib/utils/share";
import { videoEventEmitter } from "@/lib/utils/videoEvents";
import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { JsonValue, selfId } from "trystero";

export const Route = createFileRoute("/room/$roomId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { createRoom, leaveRoom, joinRoom } = useP2P();
  const [peers, setPeers] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { roomId } = Route.useParams();
  const { toast } = useToast();
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);
  const roomStore = useWatchStore((state) => state.room);
  const isVideoLoaded = useRef<boolean>(false);
  const roomAdmin = useRef<string | null>(null);
  const clear = useWatchStore((state) => state.clear);
  const isAdmin = useMemo(() => {
    return roomAdmin.current === selfId;
  }, [roomAdmin]);

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  const onPeerLeave = (peerId: string) => {
    console.log("Peer left");
    setPeers((prev) => prev.filter((p) => p !== peerId));

    toast({
      title: "2. kisi ayrildi!",
      description: "2. kisi ayrildi!",
    });
    videoRef.current?.pause();
  };

  function _createUrl(roomId: string) {
    const url = `${window.location.origin}/room/${roomId}`;

    return url;
  }

  async function onClickShare() {
    const url = _createUrl(roomId);

    await share({
      url,
      title: "Hadi gel beraber izleyelim!",
      dialogTitle: "Hadi gel beraber izleyelim!",
    });
  }

  function slaveEvents() {
    const { sendAction } = joinRoom(roomId);
    p2pEventEmitter.addListener("status", (status, peerId) => {
      if (status === "JOINED") {
        setPeers((prev) => [...prev, peerId]);
      } else {
        onPeerLeave(peerId);
      }
    });

    p2pEventEmitter.addListener("command", (command, payload) => {
      switch (command) {
        case "CHECK_ADMIN":
          roomAdmin.current = payload as string;
          break;
        case "PAUSE":
          videoRef.current?.pause();
          break;
        case "PLAY":
          videoRef.current!.currentTime = payload as number;
          videoRef.current?.play();
          break;
        case "SYNC":
          if (Math.floor(videoRef.current?.currentTime ?? 0) !== payload) {
            videoRef.current!.currentTime = payload as number;
          }
          break;
        case "DATA":
          const data = payload as IWatchTogetherRoom;
          videoEventEmitter.emit("loadVideo", data.watchLink ?? "");
          break;

        default:
          break;
      }
    });

    p2pEventEmitter.addListener("loadedVideo", (loaded) => {
      if (loaded) {
        videoRef.current?.addEventListener("play", () => {
          if (!isAdmin) return;

          sendAction({
            command: "PLAY",
            payload: videoRef.current?.currentTime ?? 0,
          });
        });

        videoRef.current?.addEventListener("pause", () => {
          if (!isAdmin) return;

          sendAction({
            command: "PAUSE",
            payload: null,
          });
        });

        videoRef.current?.addEventListener("playing", (c) => {
          if (!isAdmin) return;

          setInterval(() => {
            sendAction({
              command: "SYNC",
              payload: Math.floor(videoRef.current?.currentTime ?? 0),
            });
          }, 10_000);
        });
      }
    });
  }

  function commanderEvents() {
    const { sendAction } = createRoom(roomId);

    if (!roomStore) return;

    p2pEventEmitter.addListener("loadedVideo", (videoUrl) => {
      sendAction({
        command: "CHECK_ADMIN",
        payload: selfId,
      });

      sendAction({
        command: "DATA",
        payload: roomStore,
      } as unknown as JsonValue);

      if (videoUrl) {
        console.warn("videoUrl", videoUrl);
        sendAction({
          command: "RETRIEVE_URL",
          payload: videoUrl,
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
      }
    });

    p2pEventEmitter.addListener("status", (status, peerId) => {
      if (status === "JOINED") {
        console.log("Peer joined ve emitliyorum", peerId);

        setPeers((prev) => [...prev, peerId]);

        setTimeout(() => {
          if (!isVideoLoaded.current) {
            videoEventEmitter.emit("loadVideo", roomStore?.watchLink);
          }
        }, 300);
      } else {
        onPeerLeave(peerId);
      }
    });

    p2pEventEmitter.addListener("command", (command, payload) => {
      switch (command) {
        case "CHECK_ADMIN":
          break;
        case "PAUSE":
          // videoRef.current?.pause();
          break;
        case "PLAY":
          // videoRef.current!.currentTime = payload as number;
          // videoRef.current?.play();
          break;
        case "SYNC":
          // if (Math.floor(videoRef.current?.currentTime ?? 0) !== payload) {
          //   videoRef.current!.currentTime = payload as number;
          // }
          break;

        default:
          break;
      }
    });
  }

  useEffect(() => {
    if (roomStore) {
      console.log("ROOM STORE", roomStore);
      commanderEvents();
    } else {
      console.log("ROOM STORE", roomStore);
      slaveEvents();
    }

    return () => {
      setPeers([]);
      leaveRoom();
      p2pEventEmitter.removeAllListeners();
    };
  }, [roomStore, selectedWatchLink]);

  function waitForPeers() {
    return (
      <div className="flex flex-col justify-center items-center h-full m-auto">
        <Button onClick={onClickShare}>
          <Share2 />
          Paylas
        </Button>
        <h1 className="text-center items-center justify-center text-2xl ">
          Kullanicilar bekleniyor...
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-wrap">
      <div className="container mx-auto px-4 py-8">
        {peers.length < 1 ? (
          waitForPeers()
        ) : (
          <div>
            <h1>ID: {selfId}</h1>
            <WatchVideoPlayer
              videoRef={videoRef}
              handleLoadedData={() => {
                p2pEventEmitter.emit("loadedVideo", "qwe");
              }}
              posterPath=""
              onPlay={() => {}}
              onPause={() => {}}
              handleProgress={() => {}}
            />
          </div>
        )}
      </div>

      <div>
        {peers.length > 0 && (
          <PeersList
            peers={peers.map((peer) => ({
              id: peer,
              name: peer,
            }))}
          />
        )}
      </div>
    </div>
  );
}
