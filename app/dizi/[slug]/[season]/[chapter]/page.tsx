"use client";

import { Loading } from "@/lib/components/Loading";
import { IWatchResult } from "@/lib/models";
import {
  fetchSerieFromTMDB,
  fetchSerieWatchLink,
  searchSerieOnTMDB,
} from "@/lib/services/series.service";
import { ITmdbSearchResults, ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import ReactPlayer from "react-player";

interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
  };
}

export default function ChapterPage({ params }: IProps) {
  const season = parseInt(params.season.replace("sezon-", ""));
  const chapter = parseInt(params.chapter.replace("bolum-", ""));
  const tmdbSearch = useQuery<ITmdbSearchResults>({
    queryKey: ["tmdb-search", params.slug],
    queryFn: () => searchSerieOnTMDB(params.slug),
  });

  const tmdbData = useQuery<ITmdbSerieDetails>({
    enabled: tmdbSearch.isSuccess && tmdbSearch.data.total_results > 0,
    queryKey: ["tmdb-details", params.slug],
    queryFn: () => fetchSerieFromTMDB(tmdbSearch.data!.results[0].id),
  });

  if (tmdbSearch.isSuccess && tmdbSearch.data.total_results < 1) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  const serieWatchLink = useQuery<IWatchResult>({
    enabled: tmdbData.isSuccess,
    networkMode: "offlineFirst",
    queryKey: ["dizi-watch", params.slug, season, chapter],
    queryFn: () => fetchSerieWatchLink(params.slug, season, chapter),
    retry: false,
  });

  if (tmdbData.isError) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  if (tmdbData.isPending) {
    return <Loading fullscreen />;
  }

  return (
    <div>
      {tmdbData?.data.name}

      {serieWatchLink.isPending ? (
        <Loading />
      ) : (
        <ReactPlayer url={serieWatchLink.data?.url} controls playing />
      )}
    </div>
  );
}
