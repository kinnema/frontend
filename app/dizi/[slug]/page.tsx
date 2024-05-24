"use client";

import { Loading } from "@/lib/components/Loading";
import { slugify } from "@/lib/helpers";
import {
  fetchSerieDetailsWithSeasonsFromTmdb,
  fetchSerieFromTMDB,
  searchSerieOnTMDB,
} from "@/lib/services/series.service";
import {
  ITmdbSearchResults,
  ITmdbSerieDetails,
  Season,
} from "@/lib/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

export default function SeriePage({ params }: { params: { slug: string } }) {
  const tmdbSearch = useQuery<ITmdbSearchResults>({
    queryKey: ["tmdb-search", params.slug],
    queryFn: () => searchSerieOnTMDB(params.slug),
  });

  const tmdbData = useQuery<ITmdbSerieDetails>({
    enabled: tmdbSearch.isSuccess && tmdbSearch.data.total_results > 0,
    queryKey: ["tmdb-details", params.slug],
    queryFn: () => fetchSerieFromTMDB(tmdbSearch.data!.results[0].id),
  });

  const tmdbDetailsData = useQuery<ITmdbSerieDetails>({
    enabled: tmdbData.isSuccess,
    queryKey: ["tmdb-details-with-season", params.slug],
    queryFn: () => {
      const seasons = tmdbData.data!.number_of_seasons;
      return fetchSerieDetailsWithSeasonsFromTmdb(tmdbData.data!.id, seasons);
    },
  });

  const numberOfSeasons = useMemo<number[] | undefined>(() => {
    if (!tmdbData.isSuccess) return;

    const _seasons = [];
    for (let i = 1; i < tmdbData.data!.number_of_seasons + 1; i++) {
      const seasonQuery = i;

      _seasons.push(seasonQuery);
    }

    return _seasons;
  }, [tmdbData]);

  if (tmdbSearch.isSuccess && tmdbSearch.data.total_results < 1) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  const [activeTab, setActiveTab] = useState<number>(1);

  const renderSeasonTab = useCallback(() => {
    if (!tmdbDetailsData.isSuccess) return;

    const seasonKey = `season/${activeTab}`;
    const data = tmdbDetailsData.data[seasonKey] as Season;

    return data.episodes?.map((episode) => (
      <Link
        href={`/dizi/${slugify(
          tmdbDetailsData.data!.original_name
        )}/sezon-${activeTab}/bolum-${episode.episode_number}`}
      >
        <div
          key={episode.id}
          className="flex items-center justify-between p-4 mb-2 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
        >
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-sm font-medium">
                {episode.season_number}:{episode.episode_number} -{" "}
                {episode.name}
              </div>
            </div>
          </div>
        </div>
      </Link>
    ));
  }, [activeTab, tmdbDetailsData]);

  if (tmdbDetailsData.isError) return <div>Error</div>;

  if (tmdbDetailsData.isPending) return <Loading />;

  return (
    <>
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8 md:flex-row">
        <div className="bg-stone-900 overflow-hidden animate-none aspect-[2/3] rounded w-full max-w-[300px]">
          <img
            src={`https://image.tmdb.org/t/p/original/${tmdbDetailsData.data?.poster_path}`}
            alt={tmdbDetailsData.data?.original_name}
            className="duration-300 object-cover h-full w-full opacity-100 blur-none "
            width={300}
            height={450}
            loading="lazy"
            draggable="false"
          />
        </div>
        <div className="w-full">
          <h2 className="text-4xl font-extrabold lg:text-5xl dark:text-white">
            {tmdbDetailsData.data.original_name}
          </h2>
          <div className="font-medium flex flex-col gap-5 my-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-white px-2.5 py-1 text-black dark:text-white dark:bg-black">
                Full
              </span>
              <span className="border-2 border-white px-2.5 py-0.5 dark:text-white dark:border-gray-400">
                HD
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-sm max-h-80 overflow-auto movie-content dark:text-white">
              {tmdbDetailsData.data.overview}
            </div>
          </div>
        </div>
      </div>

      <div id="container" className="mt-10">
        <div className="md:flex">
          <ul className="flex-column space-y space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:me-4 mb-4 md:mb-0">
            {numberOfSeasons?.map((season) => (
              <li
                className="cursor-pointer"
                key={season}
                onClick={() => setActiveTab(season)}
              >
                <a
                  className={classNames(
                    activeTab === season
                      ? "bg-red-600  dark:bg-red-600"
                      : "bg-gray-300 dark:bg-gray-800",
                    "inline-flex items-center px-4 py-3 text-white  rounded-lg active w-full"
                  )}
                  aria-current="page"
                >
                  {season + ". Sezon"}
                </a>
              </li>
            ))}
          </ul>
          <div className="text-medium text-gray-500 dark:text-gray-400 rounded-lg w-full max-h-96 overflow-scroll overflow-x-hidden px-5">
            {renderSeasonTab()}
          </div>
        </div>
      </div>
    </>
  );
}
