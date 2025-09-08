"use client";

import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/lib/components/Loading";
import { Providers } from "@/lib/components/Providers";
import { SubtitleSelectDialog } from "@/lib/components/Watch/SubtitleSelectDialog";
import { WatchTogether } from "@/lib/components/Watch/WatchTogether";
import { WatchVideoPlayer } from "@/lib/components/Watch/WatchVideoPlayer";
import { tmdbPosterResponsive } from "@/lib/helpers";
import { useLastWatched } from "@/lib/hooks/database/useLastWatched";
import TmdbService from "@/lib/services/tmdb.service";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
// import { useLastWatchedStore } from "@/lib/stores/lastWatched.store";
import { useWatchStore } from "@/lib/stores/watch.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import { Episode, ITmdbSerieDetails } from "@/lib/types/tmdb";
import { isNativePlatform } from "@/lib/utils/native";
import { loadedVideoUrl$ } from "@/lib/utils/videoEvents";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 } from "uuid";
interface IProps {
  params: {
    slug: string;
    season: number;
    chapter: number;
    tmdbId: number;
    network?: string;
    videoRef: React.RefObject<HTMLVideoElement | null>;
  };
}

export default function ChapterPage({
  params: { videoRef, ...params },
}: IProps) {
  const { t } = useTranslation();
  const season = params.season;
  const chapter = params.chapter;
  const [isPlaying, setIsPlaying] = useState(false);
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);
  const isWatchTogetherFeatureEnabled = useExperimentalStore((state) =>
    state.isFeatureEnabled(ExperimentalFeature.WatchTogether)
  );
  const clearWatchLink = useWatchStore((state) => state.clearWatchLink);
  const clearSubtitles = useWatchStore((state) => state.clearSubtitles);
  const isWatched = useRef<boolean>(false);
  const toast = useToast();
  const {
    getSingleLastWatched,
    updateLastWatched,
    addLastWatched,
    getSingleLastWatchedWithDetails,
  } = useLastWatched();

  useEffect(() => {
    if (selectedWatchLink) {
      loadedVideoUrl$.next(selectedWatchLink);
    }
  }, [selectedWatchLink]);

  useEffect(() => {
    return () => {
      clearWatchLink();
      clearSubtitles();
    };
  }, []);

  const handleLoadedData = () => {
    resumeFromWhereLeft();
  };

  const tmdbData = useQuery<ITmdbSerieDetails>({
    queryKey: ["tmdb-details-with-season", params.slug, params.tmdbId],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchSerie(params.tmdbId);

      return tmdbData;
    },
  });

  const tmdbEpisodeData = useQuery<Episode>({
    queryKey: ["tmdb-detail-episode", params.tmdbId, season, chapter],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchEpisode(
        params.tmdbId,
        season,
        chapter
      );

      return tmdbData;
    },
  });

  const handleProgress = async (
    event: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    if (!tmdbData.data) return;
    const playedSeconds = event.currentTarget.currentTime;
    const totalSeconds = videoRef.current?.duration || 0;

    if (playedSeconds >= totalSeconds - 120 && !isWatched.current) {
      await updateLastWatched(
        params.tmdbId,
        {
          isWatched: true,
        },
        season,
        chapter
      );

      isWatched.current = true;
    }

    // Only update every 10 seconds to avoid too many requests
    if (Math.floor(playedSeconds) % 10 === 0) {
      try {
        const lastWatched = await getSingleLastWatched(params.tmdbId);
        const lastWatchedWithDetails = await getSingleLastWatchedWithDetails(
          params.tmdbId,
          season,
          chapter
        );

        if (
          lastWatched &&
          lastWatched.season_number !== season &&
          lastWatchedWithDetails
        ) {
          // If the user started a new episode, mark the previous one as watched
          await updateLastWatched(
            params.tmdbId,
            {
              isWatched: true,
            },
            lastWatched.season_number,
            lastWatched.episode_number,
            lastWatched
          );
        }

        if (lastWatched) {
          console.log("Updating last watched:", { atSecond: playedSeconds });
          await updateLastWatched(
            params.tmdbId,
            {
              season_number: season,
              episode_number: chapter,
              totalSeconds: totalSeconds,
              atSecond: playedSeconds,
            },
            season,
            chapter,
            lastWatched
          );
        } else {
          await addLastWatched({
            id: v4(),
            name: tmdbData.data.name,
            posterPath: tmdbEpisodeData.data!.still_path,
            tmdbId: tmdbData.data.id,
            season_number: season,
            episode_number: chapter,
            atSecond: playedSeconds,
            totalSeconds: totalSeconds,
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
    return <div className="text-red-500">{t("watch.seriesNotFound")}</div>;
  }

  if (tmdbData.isPending || tmdbEpisodeData.isPending) {
    return <Loading fullscreen />;
  }

  function onPlay(): void {
    setIsPlaying(true);
  }

  function onPause(): void {
    setIsPlaying(false);
  }
  async function resumeFromWhereLeft(): Promise<void> {
    const lastWatched = await getSingleLastWatchedWithDetails(
      params.tmdbId,
      season,
      chapter
    );
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
                <WatchVideoPlayer
                  videoRef={videoRef}
                  handleLoadedData={handleLoadedData}
                  posterPath={
                    tmdbPosterResponsive(tmdbEpisodeData.data.still_path).src
                  }
                  onPlay={onPlay}
                  onPause={onPause}
                  handleProgress={handleProgress}
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
          <div className="flex gap-5 mb-5">
            {isNativePlatform() && (
              <SubtitleSelectDialog
                tmdbId={tmdbData.data.id}
                season={season}
                episode={chapter}
              />
            )}

            {selectedWatchLink && isWatchTogetherFeatureEnabled && (
              <WatchTogether
                videoRef={videoRef}
                episodeData={tmdbEpisodeData.data}
                tmdbData={tmdbData.data}
              />
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            {tmdbData.data.name}
          </h1>
          {
            <div className="text-sm text-gray-300 my-4">
              {tmdbData.data.overview}
            </div>
          }
          <h3 className="text-xl mb-2 ">{tmdbEpisodeData.data.name}</h3>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
            {tmdbData.data.genres.map((genre, index) => {
              if (index !== tmdbData.data.genres.length - 1) {
                return (
                  <div key={genre.name}>
                    <span>{genre.name}</span>
                    <span> •</span>
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
