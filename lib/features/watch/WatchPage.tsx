"use client";

import { useToast } from "@/hooks/use-toast";
import {
  ApiLastWatchedIdPatchRequest,
  LastWatchedPatchSchemaOutputType,
  LastWatchedSchemaOutputType,
} from "@/lib/api";
import { Loading } from "@/lib/components/Loading";
import { Providers } from "@/lib/components/Providers";
import { ILastWatched, ILastWatchedMutation } from "@/lib/models";
import TmdbService from "@/lib/services/tmdb.service";
import UserService from "@/lib/services/user.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useWatchStore } from "@/lib/stores/watch.store";

import { TurkishProviderIds } from "@/lib/types/networks";
import { Episode, ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Hls from "hls.js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
    tmdbId: string;
  };
}

class ResponseUrlFixLoader extends Hls.DefaultConfig.loader {
  load(context: any, config: any, callbacks: any) {
    const originalSuccess = callbacks.onSuccess;

    callbacks.onSuccess = (
      response: any,
      stats: any,
      context: any,
      networkDetails: any
    ) => {
      console.log(response.url, context.url);
      response.url = context.url;
      originalSuccess(response, stats, context, networkDetails);
    };

    super.load(context, config, callbacks);
  }
}
const src = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export default function ChapterPage({ params }: IProps) {
  const queryClient = useQueryClient();
  const season = parseInt(params.season.replace("sezon-", ""));
  const chapter = parseInt(params.chapter.replace("bolum-", ""));
  const [isPlaying, setIsPlaying] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const searchParams = useSearchParams();
  const router = useRouter();
  const clear = useWatchStore((state) => state.clear);
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toast = useToast();

  useEffect(() => {
    const el = videoRef.current;
    console.log("video not element found", el);

    if (!el || !selectedWatchLink) return;

    console.log("video element found", el);

    if (Hls.isSupported()) {
      console.log("initialising hls.js");
      const hls = new Hls({ debug: true, loader: ResponseUrlFixLoader }); // debug logs every step
      hls.loadSource(selectedWatchLink);
      hls.attachMedia(el);
      hls.on(Hls.Events.MANIFEST_PARSED, () => console.log("manifest loaded"));
      hls.on(Hls.Events.ERROR, (e, data) => {
        toast.toast({
          title: "Error",
          description: `Yukleyemedim videoyu be.`,
          variant: "destructive",
        });
        console.error("hls error", data);
      });
      videoRef.current?.play();

      return () => {
        hls.destroy();
        clear();
      };
    } else {
      console.log("native HLS");
      el.src = src;
      el.play().catch(() => {});
    }

    return () => {
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

  const lastWatched = useQuery<LastWatchedSchemaOutputType>({
    queryKey: ["last-watched", tmdbData.data?.id],
    retry: 1,
    queryFn: async () => {
      const lastWatched = await UserService.fetchSingleLastWatched(
        tmdbData.data?.id!
      );

      return lastWatched;
    },
  });

  const addToLastWatched = useMutation<
    ILastWatched,
    void,
    ILastWatchedMutation
  >({
    mutationFn: async (data: ILastWatchedMutation) => {
      const response = await UserService.addLastWatch(data);

      return response;
    },
  });

  const patchLastWatched = useMutation<
    LastWatchedPatchSchemaOutputType,
    void,
    ApiLastWatchedIdPatchRequest
  >({
    mutationFn: async (data: ApiLastWatchedIdPatchRequest) => {
      const response = await UserService.patchLastWatch(data);

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["last-watched", tmdbData.data?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["lastWatched"],
      });
    },
  });

  const isTurkishProvider = useMemo(() => {
    const network = searchParams.get("network");

    return TurkishProviderIds.includes(parseInt(network!));
  }, []);

  useEffect(() => {
    if (!isTurkishProvider) {
      setIsPlaying(true);
    }
  }, [isTurkishProvider]);

  const handleProgress = async (state: { playedSeconds: number }) => {
    if (!isAuthenticated || !tmdbData.data) return;

    // Only update every 10 seconds to avoid too many requests
    if (Math.floor(state.playedSeconds) % 10 === 0) {
      try {
        if (lastWatched.data) {
          await patchLastWatched.mutateAsync({
            id: lastWatched.data.id,
            lastWatchedPatchSchemaInputType: {
              atSecond: state.playedSeconds,
            },
          });
        } else {
          const minutesToSeconds = Math.floor(
            tmdbEpisodeData.data!.runtime * 60
          );

          await addToLastWatched.mutateAsync({
            name: tmdbData.data.name,
            posterPath: tmdbEpisodeData.data!.still_path,
            tmdbId: tmdbData.data.id,
            season,
            episode: chapter,
            atSecond: state.playedSeconds,
            totalSeconds: minutesToSeconds,
            episodeName: tmdbEpisodeData.data!.name,
            network: parseInt(searchParams.get("network")!),
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
    router.back();
  }

  function onPlay(): void {
    setIsPlaying(true);
  }

  function onPause(): void {
    setIsPlaying(false);
  }
  function onStart(): void {
    if (lastWatched.data) {
      const secondsToMinutes = Math.floor(lastWatched.data.atSecond / 60);
      toast.toast({
        title: "İzlemeye devam ediyorsunuz",
        description: `İzlemeye devam ediyorsunuz. ${secondsToMinutes}.dakika da devam ediyorsunuz.`,
        duration: 1000,
      });
      if (!videoRef.current) return;

      videoRef.current.fastSeek(lastWatched.data.atSecond);
    }
  }

  function openInExternalPlayer(url: string) {
    // List of common video player protocols
    var protocols = ["vlc://", "potplayer://", "mpc-hc://", "wmplayer://"];

    // Try to open the URL with each protocol
    var success = false;
    for (var i = 0; i < protocols.length; i++) {
      try {
        window.open(protocols[i] + url, "_blank");
        success = true;
        break;
      } catch (e) {
        // Protocol not supported, try the next one
      }
    }

    if (!success) {
      // If no protocols worked, open the URL directly
      window.open(url, "_blank");
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
