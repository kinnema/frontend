import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { joinRoom, Room, selfId } from "trystero";

export const Route = createFileRoute("/test-room")({
  component: RouteComponent,
});

function RouteComponent() {
  const room = useRef<Room | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isAdmin = useRef<string | null>(selfId);

  useEffect(() => {
    console.log("IPD", selfId);
    const _room = joinRoom(
      {
        appId: "testo",
      },
      "testo"
    );

    room.current = _room;
    const [send, get] = room.current?.makeAction("test") || [];

    _room.onPeerJoin((peerId) => console.log(`hoppa: ${peerId} joined`));
    _room.onPeerLeave((peerId) => console.log(`${peerId} left`));

    get((data) => {
      const _data = data as { command: string; payload?: unknown };

      console.log(_data);

      if (_data.command === "im_admin") {
        isAdmin.current = _data.payload as string;
      }

      if (_data.command === "play") {
        videoRef.current?.play();
      }
      if (_data.command === "pause") {
        videoRef.current?.pause();
      }

      if (_data.command === "sync") {
        console.log("sync", _data.payload, videoRef.current?.currentTime);
        if (Math.floor(videoRef.current?.currentTime ?? 0) !== _data.payload) {
          videoRef.current!.currentTime = _data.payload as number;
        }
      }
    });

    videoRef.current?.addEventListener("play", () => {
      send({
        command: "play",
      });
    });

    setInterval(() => {
      console.log("IS ADMIN?", isAdmin, isAdmin.current !== selfId);
      if (isAdmin.current !== selfId) return;
      const currentTime = Math.floor(videoRef.current?.currentTime ?? 0);

      send({
        command: "sync",
        payload: currentTime,
      });
    }, 10000);
  }, []);

  function sendTest() {
    const [send, _get] = room.current!.makeAction("test");

    send({
      command: "im_admin",
      payload: selfId,
    });
  }

  return (
    <div>
      <h1>Test Room</h1>
      ID: {selfId}
      <video
        src="https://www.tekeye.uk/html/images/Joren_Falls_Izu_Jap.webm"
        controls
        playsInline
        ref={videoRef}
        muted
      ></video>
      <Button onClick={sendTest}> send test message</Button>
    </div>
  );
}
