"use client";

import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/lib/components/Loading";
import { Providers } from "@/lib/components/Providers";
import { useHlsPlayer } from "@/lib/hooks/useHlsPlayer";
import TmdbService from "@/lib/services/tmdb.service";
import { useLastWatchedStore } from "@/lib/stores/lastWatched.store";
import { useWatchStore } from "@/lib/stores/watch.store";
import { TurkishProviderIds } from "@/lib/types/networks";
import { Episode, ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
    tmdbId: string;
    network?: string;
  };
}

export default function ChapterPage({ params }: IProps) {
  const season = parseInt(params.season.replace("sezon-", ""));
  const chapter = parseInt(params.chapter.replace("bolum-", ""));
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();
  const clear = useWatchStore((state) => state.clear);
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const toast = useToast();
  const getLastWatched = useLastWatchedStore((state) => state.getSerie);
  const updateLastWatched = useLastWatchedStore((state) => state.updateSerie);
  const addLastWatched = useLastWatchedStore((state) => state.addSerie);

  // Initialize HLS player with CapacitorHTTP integration
  const { destroy, loadSource } = useHlsPlayer({
    videoRef,
    onReady: () => {
      console.log("HLS player ready");
    },
    onError: (error) => {
      console.error("HLS player error:", error);
    },
  });

  // Cleanup when component unmounts or selectedWatchLink changes
  useEffect(() => {
    if (!selectedWatchLink) return;

    loadSource(selectedWatchLink);

    const handleLoadedData = () => {
      resumeFromWhereLeft();
    };

    videoRef.current?.addEventListener("loadeddata", handleLoadedData);

    return () => {
      videoRef.current?.removeEventListener("loadeddata", handleLoadedData);
      destroy();
      clear();
    };
  }, [selectedWatchLink]);

  const tmdbData = useQuery<ITmdbSerieDetails>({
    queryKey: ["tmdb-details-with-season", params.slug, params.tmdbId],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchSerie(parseInt(params.tmdbId));

      return tmdbData;
    },
  });

  const tmdbEpisodeData = useQuery<Episode>({
    queryKey: ["tmdb-detail-episode", params.tmdbId, season, chapter],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchEpisode(
        parseInt(params.tmdbId),
        season,
        chapter
      );

      return tmdbData;
    },
  });

  const isTurkishProvider = useMemo(() => {
    const network = params?.network;

    return network ? TurkishProviderIds.includes(parseInt(network)) : false;
  }, []);

  useEffect(() => {
    if (!isTurkishProvider) {
      setIsPlaying(true);
    }
  }, [isTurkishProvider]);

  const handleProgress = async (
    event: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    if (!tmdbData.data) return;
    const playedSeconds = event.currentTarget.currentTime;
    console.log(playedSeconds);
    // Only update every 10 seconds to avoid too many requests
    if (Math.floor(playedSeconds) % 10 === 0) {
      try {
        const lastWatched = getLastWatched(params.tmdbId);

        if (lastWatched) {
          updateLastWatched(params.tmdbId, {
            atSecond: playedSeconds,
          });
        } else {
          const minutesToSeconds = Math.floor(
            tmdbEpisodeData.data!.runtime * 60
          );

          addLastWatched({
            id: params.tmdbId,
            name: tmdbData.data.name,
            posterPath: tmdbEpisodeData.data!.still_path,
            tmdbId: tmdbData.data.id,
            season,
            episode: chapter,
            atSecond: playedSeconds,
            totalSeconds: minutesToSeconds,
            episodeName: tmdbEpisodeData.data!.name,
            network: params?.network ? parseInt(params.network) : 0,
          });
        }
      } catch (error) {
        console.error("Failed to update last watched:", error);
      }
    }
  };

  if (tmdbData.isError || tmdbEpisodeData.isError) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  if (tmdbData.isPending || tmdbEpisodeData.isPending) {
    return <Loading fullscreen />;
  }

  function onClickClose(): void {
    navigate({ to: "/" });
  }

  function onPlay(): void {
    setIsPlaying(true);
  }

  function onPause(): void {
    setIsPlaying(false);
  }
  function resumeFromWhereLeft(): void {
    const lastWatched = getLastWatched(params.tmdbId);
    if (lastWatched) {
      const secondsToMinutes = Math.floor(lastWatched.atSecond / 60);
      toast.toast({
        title: "İzlemeye devam ediyorsunuz",
        description: `İzlemeye devam ediyorsunuz. ${secondsToMinutes}.dakika da devam ediyorsunuz.`,
        duration: 1000,
      });

      if (videoRef.current) videoRef.current.currentTime = lastWatched.atSecond;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50">
      <div className="relative h-full">
        <div className="w-full h-full flex">
          <>
            {!selectedWatchLink ? (
              <Providers
                params={{
                  id: tmdbData.data.id.toString(),
                  season,
                  chapter,
                }}
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  style={{
                    backgroundColor: "black",
                    width: "100%",
                    height: "100%",
                  }}
                  poster={`https://image.tmdb.org/t/p/original/${tmdbEpisodeData.data.still_path}`}
                  controls
                  onPlay={onPlay}
                  onPause={onPause}
                  onTimeUpdate={handleProgress}
                />
              </>
            )}
          </>
        </div>

        <div
          className="absolute bottom-0 left-0 p-10 z-20 bg-gradient-to-t from-black to-transparent w-full"
          style={{
            visibility: isPlaying ? "hidden" : "visible",
          }}
        >
          <span className="text-emerald-400 text-sm mb-2 gap-1 flex ">
            {tmdbData.data.networks.map((network) => (
              <p key={network.name}>{network.name}</p>
            ))}
            orijinal dizisi
          </span>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            {tmdbData.data.name}
          </h1>
          <h3 className="text-xl mb-2">{tmdbEpisodeData.data.name}</h3>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
            {tmdbData.data.genres.map((genre, index) => {
              if (index !== tmdbData.data.genres.length - 1) {
                return (
                  <div key={genre.name}>
                    <span>{genre.name}</span>
                    <span>•</span>
                  </div>
                );
              }

              return <span>{genre.name}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
