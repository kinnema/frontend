import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/lib/components/Loading";
import PeersList from "@/lib/components/Watch/PeersList";
import WatchPage from "@/lib/features/watch/WatchPage";
import { useP2P } from "@/lib/hooks/useP2P";
import { useWatchStore } from "@/lib/stores/watch.store";
import { p2pEventEmitter } from "@/lib/utils/p2pEvents";
import { Share } from "@capacitor/share";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import z from "zod";

const searchSchema = z.object({
  slug: z.string(),
  tmdbId: z.number(),
  season: z.number(),
  chapter: z.number(),
  created: z.boolean().optional(),
});

export const Route = createFileRoute("/room/$roomId")({
  validateSearch: zodValidator(searchSchema),
  component: RouteComponent,
});

function RouteComponent() {
  const { createRoom, leaveRoom, joinRoom } = useP2P();
  const [peers, setPeers] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { slug, tmdbId, season, chapter, created } = Route.useSearch();
  const { roomId } = Route.useParams();
  const { toast } = useToast();
  const router = useRouterState();
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);
  const setSelectedWatchLink = useWatchStore(
    (state) => state.setSelectedWatchLink
  );

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
    const currentParams = router.location.search as Record<
      string,
      string | undefined | null
    >;
    const paramsWithRoom = { ...currentParams };

    const searchParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(paramsWithRoom).filter(([, value]) => value != null)
      ) as Record<string, string>
    );
    const url = `${
      window.location.origin
    }/room/${roomId}?${searchParams.toString()}`;

    return url;
  }

  async function onClickShare() {
    const url = _createUrl(roomId);

    const canShare = await Share.canShare();

    if (canShare.value) {
      try {
        await Share.share({
          url,
          title: "Hadi gel beraber izleyelim!",
          dialogTitle: "Hadi gel beraber izleyelim!",
        });
      } catch (error) {
        toast({
          title: "Kopyaladim!",
          description: "URL Kopyalandi!",
        });
        window.navigator.clipboard.writeText(url);
      }
    } else {
      toast({
        title: "Kopyaladim!",
        description: "URL Kopyalandi!",
      });
      window.navigator.clipboard.writeText(url);
    }
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
        case "RETRIEVE_URL":
          setSelectedWatchLink(payload as string);
          videoRef.current?.play();
          break;

        default:
          break;
      }
    });

    p2pEventEmitter.addListener("loadedVideo", (loaded) => {
      if (loaded) {
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
  }

  function commanderEvents() {
    const { sendAction } = createRoom(roomId);

    sendAction({
      command: "CHECK_ADMIN",
      payload: null,
    });

    p2pEventEmitter.addListener("loadedVideo", (videoUrl) => {
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
        setPeers((prev) => [...prev, peerId]);
      } else {
        onPeerLeave(peerId);
      }
    });

    p2pEventEmitter.addListener("command", (command, payload) => {
      switch (command) {
        case "CHECK_ADMIN":
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

        default:
          break;
      }
    });
  }

  useEffect(() => {
    if (created) {
      commanderEvents();
    } else {
      slaveEvents();
    }

    return () => {
      setPeers([]);
      leaveRoom();
      p2pEventEmitter.removeAllListeners();
    };
  }, []);

  function waitForPeers() {
    return (
      <Loading
        fullscreen
        description="Kullanicilarin baglanmasi bekleniyor.."
      />
    );
  }

  return (
    <div className="flex flex-col flex-wrap">
      <div className="container mx-auto px-4 py-8">
        {peers.length < 1 ? (
          waitForPeers()
        ) : (
          <div>
            <Button onClick={onClickShare}>
              <Share2 />
              Paylas
            </Button>
            <WatchPage
              params={{
                chapter,
                season,
                slug,
                tmdbId,
                isInRoom: true,
                videoRef,
              }}
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
