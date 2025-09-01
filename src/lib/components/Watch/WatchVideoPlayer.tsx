import { useHlsPlayer } from "@/lib/hooks";
import { useWatchStore } from "@/lib/stores/watch.store";
import { isNativePlatform } from "@/lib/utils/native";
import { videoEventEmitter } from "@/lib/utils/videoEvents";
import MediaThemeSutro from "player.style/sutro/react";
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
  const subtitles = useWatchStore((state) => state.subtitles);
  const setSubtitles = useWatchStore((state) => state.setSubtitles);
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
    const pipMode = async () => {
      if (document.visibilityState === "hidden") {
        await videoRef.current?.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    };
    videoEventEmitter.addListener("loadVideo", async (url) => {
      await loadSource(url);

      videoRef.current?.addEventListener("loadeddata", handleLoadedData);
    });

    document.addEventListener("visibilitychange", pipMode);

    return () => {
      document.exitPictureInPicture();
      document.removeEventListener("visibilitychange", pipMode);
      videoEventEmitter.removeAllListeners();
      videoRef.current?.removeEventListener("loadeddata", handleLoadedData);
      destroy();
    };
  }, []);

  return (
    <>
      <MediaThemeSutro className="w-full h-full object-contain">
        <video
          slot="media"
          className="w-full h-full object-contain"
          ref={videoRef}
          poster={posterPath}
          onPlay={onPlay}
          onPause={onPause}
          onTimeUpdate={handleProgress}
          disablePictureInPicture={false}
          playsInline
        >
          {subtitles?.map((subtitle) => {
            if (isNativePlatform()) {
              return (
                <track
                  default
                  kind="subtitles"
                  label={subtitle.lang}
                  srcLang={subtitle.lang}
                  src={subtitle.url}
                />
              );
            }
          })}
        </video>
      </MediaThemeSutro>
    </>
  );
}
