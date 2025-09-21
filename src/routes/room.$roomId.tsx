import { Button } from "@/components/ui/button";
import { WaitPeers } from "@/components/Watch/WaitPeers";
import { WatchVideoPlayer } from "@/components/Watch/WatchVideoPlayer";
import { useWatchTogether } from "@/lib/hooks/useWatchTogether";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { IWatchTogetherRoom, useWatchStore } from "@/lib/stores/watch.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import {
  Commands,
  InfoActionCommands,
  IP2PCommand,
  IRoomDetails,
  P2PAction,
  P2PCreateAction,
} from "@/lib/types/watchTogether.types";
import { loadedVideoUrl$ } from "@/lib/utils/videoEvents";
import { watchTogetherEvents } from "@/lib/utils/watchTogetherEvents";
import { createFileRoute, redirect, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Subscription } from "rxjs";
import {
  ActionReceiver,
  ActionSender,
  DataPayload,
  Room,
  selfId,
} from "trystero/torrent";

export const Route = createFileRoute("/room/$roomId")({
  component: RouteComponent,
  loader: async () => {
    const isWatchTogetherFeatureEnabled = useExperimentalStore
      .getState()
      .isFeatureEnabled(ExperimentalFeature.WatchTogether);

    if (!isWatchTogetherFeatureEnabled) {
      return redirect({
        from: "/room/$roomId",
        to: "/settings/experimental",
      });
    }
  },
});

function RouteComponent() {
  const { createRoom, leaveRoom, joinRoom, createAction } = useWatchTogether();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [peers, setPeers] = useState<string[]>([]);
  const roomStore = useWatchStore((state) => state.room);
  const clear = useWatchStore((state) => state.clear);
  const isRoomCreator = useMemo(() => roomStore !== undefined, [roomStore]);
  const infoAction =
    useRef<P2PCreateAction<InfoActionCommands | string>>(undefined);
  const roomDetails = useRef<IRoomDetails | undefined>(undefined);
  const [roomDetailsState, setRoomDetailsState] = useState<
    IRoomDetails | undefined
  >(undefined);
  const roomId = useParams({ from: "/room/$roomId" }).roomId;
  const room = useRef<Room | undefined>(undefined);
  const sendRoomAction = useRef<ActionSender<DataPayload>>(undefined);
  const getRoomAction = useRef<ActionReceiver<DataPayload>>(undefined);
  const [videoRoomDetails, setVideoRoomDetails] = useState<
    IWatchTogetherRoom | undefined
  >();
  const [currentVideoTime, setCurrentVideoTime] = useState<string>("00:00");

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return (
      String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0")
    );
  }

  function addPeer(peerId: string) {
    setPeers((peers) => [...peers, peerId]);
  }

  function removePeer(peerId: string) {
    setPeers((peers) => peers.filter((peer) => peer !== peerId));
  }

  function setRoomDetails(payload: IRoomDetails) {
    roomDetails.current = payload;
    setRoomDetailsState(roomDetails.current);
  }

  async function sendRoomDetails(peerId: string) {
    if (!roomDetails) return;
    console.log(
      "SENDING ROOM DETAILS TO PEER: ",
      peerId,
      "ROOM DETAILS: ",
      roomDetails
    );

    await sendDataToPeer(peerId, "ROOM_DETAILS", roomDetails);
  }

  async function sendDataToPeer(
    peerId: string,
    command: InfoActionCommands,
    payload: unknown
  ) {
    if (!infoAction.current) return;

    const [sendAction] = infoAction.current;

    await sendAction({
      command: `TO:${peerId}:${command}`,
      payload,
    });
  }

  async function listenPeerData(peerId: string, data: IP2PCommand<string>) {
    if (data.command.startsWith("TO:" + peerId)) {
      console.log("P2P: COMMAND TO PEER: ", peerId, data);
      const [HEAD, USERID, COMMAND] = data.command.split(":");

      if (COMMAND === "ROOM_DETAILS") {
        setRoomDetails(data.payload as IRoomDetails);
      }
    }
  }

  async function sendInfo(command: InfoActionCommands, payload: unknown) {
    if (!infoAction.current) return;

    const [sendAction] = infoAction.current;
    console.log("P2P: SENDING INFO", command, payload);
    await sendAction({
      command,
      payload,
    });
  }

  async function slave_handleRoomCommands(payload: IP2PCommand<Commands>) {
    const { command, payload: data } = payload;

    if (!videoRef.current) return;

    switch (command) {
      case "PAUSE":
        videoRef.current?.pause();
        break;

      case "PLAY":
        videoRef.current.currentTime = data as number;
        await videoRef.current?.play();

        break;

      case "SYNC":
        videoRef.current.currentTime = data as number;
        break;

      default:
        break;
    }
  }

  function commander_OnVideoPlay() {
    if (!sendRoomAction.current || !videoRef.current) return;

    sendRoomAction.current({
      command: "PLAY",
      payload: videoRef.current?.currentTime ?? 0,
    });
  }

  function commander_OnVideoPause() {
    if (!sendRoomAction.current) return;

    sendRoomAction.current({
      command: "PAUSE",
    });
  }

  function handleTimeUpdate() {
    if (!sendRoomAction.current || !videoRef.current) return;

    sendRoomAction.current({
      command: "PLAY",
      payload: videoRef.current?.currentTime ?? 0,
    });
    setCurrentVideoTime(formatTime(videoRef.current?.currentTime ?? 0));
  }

  useEffect(() => {
    const { sendAction, getAction, room: _room } = createRoom(roomId);
    room.current = _room;
    sendRoomAction.current = sendAction;
    getRoomAction.current = getAction;

    const _infoAction = createAction<InfoActionCommands | string>(
      P2PAction.INFO,
      _room
    );
    let statusSubscription: Subscription;
    let loadedVideoSubscription: Subscription;
    let commandSubscription: Subscription;

    if (!_infoAction) return;

    infoAction.current = _infoAction;
    const [_, getInfo] = _infoAction;

    if (isRoomCreator) {
      setRoomDetails({
        access: false,
        adminId: selfId,
      });

      statusSubscription = watchTogetherEvents.status$.subscribe(
        async ({ status, peerId }) => {
          if (status === "JOINED") {
            addPeer(peerId);
            await sendRoomDetails(peerId);
          }

          if (status === "LEAVED") {
            removePeer(peerId);
          }
        }
      );

      loadedVideoSubscription = watchTogetherEvents.loadedVideo$.subscribe(
        async (url) => {
          videoRef.current?.addEventListener("timeupdate", handleTimeUpdate);

          videoRef.current?.addEventListener("play", commander_OnVideoPlay);

          videoRef.current?.addEventListener("pause", commander_OnVideoPause);
        }
      );
    } else {
      commandSubscription = watchTogetherEvents.command$.subscribe(
        ({ command, payload }) => slave_handleRoomCommands({ command, payload })
      );

      loadedVideoSubscription = watchTogetherEvents.loadedVideo$.subscribe(
        async (url) => {
          videoRef.current?.addEventListener("timeupdate", handleTimeUpdate);
        }
      );

      getInfo((data) => {
        listenPeerData(selfId, data);

        console.log("P2P: RECEIVED INFO", data);
        if (data.command === "DATA") {
          setVideoRoomDetails(data.payload as IWatchTogetherRoom);
          loadedVideoUrl$.next(
            (data.payload as IWatchTogetherRoom).watchLink ?? ""
          );
        }
      });

      statusSubscription = watchTogetherEvents.status$.subscribe(
        async ({ status, peerId }) => {
          if (status === "JOINED") {
            addPeer(peerId);
          }

          if (status === "LEAVED") {
            removePeer(peerId);
          }
        }
      );
    }

    return () => {
      statusSubscription?.unsubscribe();
      loadedVideoSubscription?.unsubscribe();
      commandSubscription?.unsubscribe();

      videoRef.current?.removeEventListener("play", commander_OnVideoPlay);
      videoRef.current?.removeEventListener("pause", commander_OnVideoPause);
      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      leaveRoom();
      setPeers([]);
    };
  }, []);

  useEffect(() => {
    if (roomDetailsState && !isRoomCreator) {
      if (!roomDetailsState.access) {
        console.log("You don't have access");
        // TODO: We may leave the room here.
      }
    }
  }, [roomDetailsState]);

  useEffect(() => {
    if (peers.length > 0 && isRoomCreator && roomStore) {
      console.log("P2P VIDEO", "Loading video", roomStore.watchLink);
      loadedVideoUrl$.next(roomStore.watchLink);
    }
  }, [peers, roomStore, isRoomCreator]);

  useEffect(() => {
    if (roomStore && isRoomCreator && peers.length > 0) {
      sendInfo("DATA", roomStore);
    }
  }, [roomStore, isRoomCreator, peers]);

  return (
    <>
      <div className="flex flex-col flex-wrap">
        <div className="container mx-auto px-4 py-8">
          {peers.length < 1 ? (
            <WaitPeers roomId={roomId} />
          ) : (
            <div>
              <div className="h-screen bg-gray-900 text-white flex">
                {/* Main Video Area */}
                <div className="flex-1 flex flex-col">
                  {/* Video Player */}
                  <div className="flex-1 bg-black relative">
                    <WatchVideoPlayer
                      videoRef={videoRef}
                      handleLoadedData={() => {
                        watchTogetherEvents.loadedVideo$.next({
                          videoUrl: "qwe",
                        });
                      }}
                      posterPath=""
                      onPlay={() => {}}
                      onPause={() => {}}
                      handleProgress={() => {}}
                    />

                    {/* Video Overlay Controls */}
                    <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">Canli</span>
                      </div>
                    </div>

                    {/* Sync Status */}
                    <div className="absolute top-4 right-4 bg-black/50 rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Synced</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background p-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold mb-1">
                          {isRoomCreator
                            ? `${roomStore?.tmdbData.original_name} ${roomStore?.tmdbEpisodeData.season_number}.Sezon ${roomStore?.tmdbEpisodeData.episode_number}.Bölum`
                            : `${videoRoomDetails?.tmdbData.original_name} ${videoRoomDetails?.tmdbEpisodeData.season_number}.Sezon ${videoRoomDetails?.tmdbEpisodeData.episode_number}.Bölum`}
                        </h2>
                      </div>

                      {/* Playback Controls Info */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Zaman:</span>
                          <span className="font-mono">{currentVideoTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Durum:</span>
                          <span className="text-green-400">{"Playing"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-background border-l border-border flex flex-col">
                  {/* Room Header */}
                  <div className="p-4 border-b border-border">
                    <h1 className="text-xl font-bold mb-2">Oda ismi</h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>Oda ID'si:</span>
                      <code className="bg-gray-700 px-2 py-1 rounded text-xs">
                        room-abc123
                      </code>
                    </div>
                  </div>

                  {/* Connected Peers */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Baglanan esler</h3>
                        <span className="bg-primary text-xs px-2 py-1 rounded-full">
                          4 online
                        </span>
                      </div>

                      {/* Peer List */}
                      <div className="space-y-3">
                        {/* Host */}
                        <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            A
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {selfId} (You)
                              </span>
                              {isRoomCreator && (
                                <span className="bg-yellow-600 text-xs px-1.5 py-0.5 rounded">
                                  HOST
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Baglandi</span>
                            </div>
                          </div>
                        </div>

                        {peers.map((peer) => (
                          <div
                            className="flex items-center space-x-3 p-2 hover:bg-gray-900 rounded-lg transition-colors"
                            key={peer}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {peer.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{peer}</div>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Baglandi</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Room Controls */}
                  <div className="p-4 border-t border-border">
                    <div className="flex">
                      <Button
                        onClick={() => redirect({ to: "/" })}
                        className="bg-red-600 w-full hover:bg-red-700 px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Odadan ayril
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
