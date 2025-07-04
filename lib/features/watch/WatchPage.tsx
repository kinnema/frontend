"use client";

import { useToast } from "@/hooks/use-toast";
import {
  ApiLastWatchedIdPatchRequest,
  LastWatchedPatchSchemaOutputType,
  LastWatchedSchemaOutputType,
} from "@/lib/api";
import { Loading } from "@/lib/components/Loading";
import { Providers } from "@/lib/components/Providers";
import { OpenInExternalPlayer } from "@/lib/components/Watch/OpenInExternalPlayer";
import { ILastWatched, ILastWatchedMutation } from "@/lib/models";
import TmdbService from "@/lib/services/tmdb.service";
import UserService from "@/lib/services/user.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useWatchStore } from "@/lib/stores/watch.store";

import { TurkishProviderIds } from "@/lib/types/networks";
import { Episode, ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactHlsPlayer from "react-player";

interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
    tmdbId: string;
  };
}

export default function ChapterPage({ params }: IProps) {
  const queryClient = useQueryClient();
  const season = parseInt(params.season.replace("sezon-", ""));
  const chapter = parseInt(params.chapter.replace("bolum-", ""));
  const [isPlaying, setIsPlaying] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const searchParams = useSearchParams();
  const videoPlayerRef = useRef<ReactHlsPlayer>(null);
  const router = useRouter();
  const clear = useWatchStore((state) => state.clear);
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);

  const toast = useToast();

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

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
      videoPlayerRef.current?.seekTo(lastWatched.data.atSecond);
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
                {isTurkishProvider ? (
                  <ReactHlsPlayer
                    url={selectedWatchLink}
                    width={"100%"}
                    height={"100%"}
                    stopOnUnmount
                    playing
                    ref={videoPlayerRef}
                    style={{
                      backgroundColor: "black",
                      width: "100%",
                      height: "100%",
                    }}
                    light={`https://image.tmdb.org/t/p/original/${tmdbEpisodeData.data.still_path}`}
                    controls
                    onPlay={onPlay}
                    onPause={onPause}
                    onProgress={handleProgress}
                    onStart={onStart}
                    pip={true}
                  />
                ) : (
                  <>
                    <OpenInExternalPlayer url={selectedWatchLink} />
                  </>
                )}
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
