import { useHlsPlayer } from "@/lib/hooks";
import { videoEventEmitter } from "@/lib/utils/videoEvents";
import { useEffect } from "react";

interface IProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  handleLoadedData: () => void;
  posterPath: string;
  onPlay: React.ReactEventHandler<HTMLVideoElement>;
  onPause: React.ReactEventHandler<HTMLVideoElement>;
  handleProgress: React.ReactEventHandler<HTMLVideoElement>;
}

export function WatchVideoPlayer({
  videoRef,
  handleLoadedData,
  posterPath,
  onPlay,
  onPause,
  handleProgress,
}: IProps) {
  const { destroy, loadSource } = useHlsPlayer({
    videoRef,
    onReady: () => {
      console.log("HLS player ready");
    },
    onError: (error) => {
      console.error("HLS player error:", error);
    },
  });

  useEffect(() => {
    videoEventEmitter.addListener("loadVideo", async (url) => {
      console.log("loadVideo", url);
      await loadSource(url);

      videoRef.current?.addEventListener("loadeddata", handleLoadedData);
    });

    return () => {
      videoEventEmitter.removeAllListeners();
      videoRef.current?.removeEventListener("loadeddata", handleLoadedData);
      destroy();
    };
  }, []);

  return (
    <>
      <video
        className="w-full h-full object-contain"
        ref={videoRef}
        poster={posterPath}
        controls
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={handleProgress}
      />
    </>
  );
}
