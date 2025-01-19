"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/lib/components/Loading";
import { Providers } from "@/lib/components/Providers";
import { ILastWatched, ILastWatchedMutation } from "@/lib/models";
import AppService from "@/lib/services/app.service";
import TmdbService from "@/lib/services/tmdb.service";
import UserService from "@/lib/services/user.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useWatchStore } from "@/lib/stores/watch.store";

import { TurkishProviderIds } from "@/lib/types/networks";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Volume2, VolumeX, X } from "lucide-react";
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
  const season = parseInt(params.season.replace("sezon-", ""));
  const chapter = parseInt(params.chapter.replace("bolum-", ""));
  const [isPlaying, setIsPlaying] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const searchParams = useSearchParams();
  const videoPlayerRef = useRef<ReactHlsPlayer>(null);
  const [isMuted, setIsMuted] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const watchLinks = useWatchStore((state) => state.links);
  const clear = useWatchStore((state) => state.clear);
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);

  const tmdbData = useQuery<ITmdbSerieDetails>({
    queryKey: ["tmdb-details-with-season", params.slug, params.tmdbId],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchSerie(parseInt(params.tmdbId));

      return tmdbData;
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

  const isTurkishProvider = useMemo(() => {
    const network = searchParams.get("network");

    return TurkishProviderIds.includes(parseInt(network!));
  }, []);

  useEffect(() => {
    AppService.fetchSeries(params.slug, season, chapter);

    return () => {
      clear();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!tmdbData.data) {
      return;
    }

    setInterval(async () => {
      await addToLastWatched.mutateAsync({
        name: tmdbData.data.name,
        posterPath: tmdbData.data.poster_path,
        tmdbId: tmdbData.data.id,
        season,
        episode: chapter,
        atSecond: videoPlayerRef.current?.getCurrentTime() ?? 0,
      });
    }, 10_000);
  }, [isAuthenticated, tmdbData]);

  if (tmdbData.isError) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  if (tmdbData.isPending) {
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

  return (
    <div className="fixed inset-0 bg-black/95 z-50">
      <div className="relative h-full">
        <div className="w-full h-full flex">
          {!isTurkishProvider ? (
            <iframe
              className="w-full h-full"
              src={`https://vidsrc.to/embed/tv/${tmdbData.data.id}/${season}/${chapter}`}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          ) : watchLinks.length === 0 ? (
            <div className="m-auto">
              <Loading />
            </div>
          ) : (
            <>
              {!selectedWatchLink ? (
                <Providers data={watchLinks} />
              ) : (
                <ReactHlsPlayer
                  url={selectedWatchLink?.url}
                  width={"100%"}
                  height={"100%"}
                  stopOnUnmount
                  playing
                  ref={videoPlayerRef}
                  muted={isMuted}
                  style={{
                    backgroundColor: "black",
                    width: "100%",
                    height: "100%",
                  }}
                  light={`https://image.tmdb.org/t/p/original/${tmdbData.data.poster_path}`}
                  controls
                  onPlay={onPlay}
                  onPause={onPause}
                />
              )}
            </>
          )}
        </div>
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/10 text-white"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
          <Button
            onClick={onClickClose}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10 text-white"
          >
            <X className="h-6 w-6" />
          </Button>
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
            {tmdbData.data.original_name}
          </h1>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
            {tmdbData.data.genres.map((genre, index) => {
              if (index !== tmdbData.data.genres.length) {
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
