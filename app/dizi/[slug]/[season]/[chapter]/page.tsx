"use client";

import { Loading } from "@/lib/components/Loading";
import { IWatchResult } from "@/lib/models";
import {
  fetchSerieDetailsWithSeasonsFromTmdb,
  fetchSerieFromTMDB,
  fetchSerieWatchLink,
  searchSerieOnTMDB,
} from "@/lib/services/series.service";
import { ITmdbSearchResults, ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useQuery } from "@tanstack/react-query";

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
    networkMode: "offlineFirst",
    queryFn: () => searchSerieOnTMDB(params.slug),
  });

  const tmdbData = useQuery<ITmdbSerieDetails>({
    enabled: tmdbSearch.isSuccess && tmdbSearch.data.total_results > 0,
    queryKey: ["tmdb-details", params.slug],
    networkMode: "offlineFirst",
    queryFn: () => fetchSerieFromTMDB(tmdbSearch.data!.results[0].id),
  });

  const tmdbDetailsData = useQuery<ITmdbSerieDetails>({
    enabled: tmdbData.isSuccess,
    queryKey: ["tmdb-details-with-season", params.slug],
    networkMode: "offlineFirst",
    queryFn: () => {
      const seasons = tmdbData.data!.number_of_seasons;
      return fetchSerieDetailsWithSeasonsFromTmdb(tmdbData.data!.id, seasons);
    },
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

  // https://developer.themoviedb.org/reference/tv-episode-details
  return <div>{tmdbData?.data.name}</div>;
}
