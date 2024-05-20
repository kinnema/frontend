"use client";

import { Loading } from "@/lib/components/Loading";
import { ISeriePage } from "@/lib/models";
import {
  fetchSerieFromTMDB,
  fetchSeriePage,
  searchSerieOnTMDB,
} from "@/lib/services/series.service";
import { ITmdbSearchResults, ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";

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

  if (tmdbSearch.isSuccess && tmdbSearch.data.total_results < 1) {
    return <div className="text-red-500">Dizi bulunamadı</div>;
  }

  const { data, isPending, isError } = useQuery<ISeriePage>({
    enabled: tmdbData.isSuccess,
    queryKey: ["dizi", params.slug],
    queryFn: () => fetchSeriePage(params.slug),
  });
  const [activeTab, setActiveTab] = useState<number>(1);

  if (tmdbData.isError) return <div>Error</div>;

  if (tmdbData.isPending) return <Loading fullscreen />;

  return (
    <>
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8 md:flex-row">
        <div className="bg-stone-900 overflow-hidden animate-none aspect-[2/3] rounded w-full max-w-[300px]">
          <img
            src={`https://image.tmdb.org/t/p/original/${tmdbData.data?.poster_path}`}
            alt="Mèo Điên"
            className="duration-300 object-cover h-full w-full opacity-100 blur-none "
            width={300}
            height={450}
            loading="lazy"
            draggable="false"
          />
        </div>
        <div className="w-full">
          <h2 className="text-4xl font-extrabold lg:text-5xl dark:text-white">
            {tmdbData.data.name}
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
              {tmdbData.data.overview}
            </div>
          </div>
        </div>
      </div>

      {isPending ? (
        <Loading />
      ) : (
        <div id="container" className="mt-10">
          <div className="md:flex">
            <ul className="flex-column space-y space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:me-4 mb-4 md:mb-0">
              {Object.keys(data!.episodes.episodes).map((season) => (
                <li
                  className="cursor-pointer"
                  key={season}
                  onClick={() => setActiveTab(parseInt(season))}
                >
                  <a
                    className={classNames(
                      activeTab === parseInt(season)
                        ? "bg-red-600  dark:bg-red-600"
                        : "bg-gray-300 dark:bg-gray-300",
                      "inline-flex items-center px-4 py-3 text-white  rounded-lg active w-full"
                    )}
                    aria-current="page"
                  >
                    {season + ". Sezon"}
                  </a>
                </li>
              ))}
            </ul>
            <div className=" bg-gray-50 text-medium text-gray-500 dark:text-gray-400 dark:bg-gray-800 rounded-lg w-full">
              {data?.episodes.episodes[activeTab.toString()]?.map((episode) => (
                <Link href={episode.href}>
                  <div
                    key={episode.href}
                    className="flex items-center justify-between p-4 mb-2 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-sm font-medium">
                          {episode.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
