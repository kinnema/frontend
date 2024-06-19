"use client";

import { Loading } from "@/lib/components/Loading";
import AppService from "@/lib/services/app.service";
import TmdbService from "@/lib/services/tmdb.service";
import { TurkishProviderIds } from "@/lib/types/networks";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
import { Tab, Tabs } from "@nextui-org/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import SeasonEpisodes from "./components/SeasonEpisodes";

export default function SeriePage({ params }: { params: { slug: string } }) {
  const pathname = usePathname();
  const sendWarmUpPing = useMutation({
    mutationFn: () => AppService.warmUpService(),
  });

  const tmdbDetailsData = useQuery<ITmdbSerieDetails>({
    queryKey: ["tmdb-details-with-season", params.slug],
    queryFn: async () => {
      const tmdbSearch = await TmdbService.searchSeries(params.slug);
      const tmdbData = TmdbService.fetchSerie(tmdbSearch.results[0].id);

      return tmdbData;
    },
  });

  const serieNetwork = useMemo(() => {
    if (!tmdbDetailsData.isSuccess) return;

    return tmdbDetailsData.data?.networks.map((n) => n.id);
  }, [tmdbDetailsData]);

  const isTurkishProvider = useMemo(() => {
    let containsAll = serieNetwork?.some((value) =>
      TurkishProviderIds?.includes(value)
    );

    return containsAll;
  }, [serieNetwork]);

  useEffect(() => {
    if (isTurkishProvider) sendWarmUpPing.mutate();
  }, [isTurkishProvider]);

  const [activeTab, setActiveTab] = useState<any>();

  const renderSeasonTab = useCallback(() => {
    if (!tmdbDetailsData.isSuccess) return;

    return (
      <SeasonEpisodes
        season={parseInt(activeTab!)}
        id={tmdbDetailsData.data.id}
        isTurkishProvider={isTurkishProvider!}
        serieNetwork={serieNetwork!}
        serie_name={tmdbDetailsData.data.original_name}
      />
    );
  }, [activeTab, tmdbDetailsData]);

  if (tmdbDetailsData.isError) return <div>Error</div>;

  if (tmdbDetailsData.isPending) return <Loading fullscreen />;

  return (
    <>
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8 md:flex-row">
        <div className="bg-zinc-900 overflow-hidden animate-none aspect-[2/3] rounded w-full max-w-[300px]">
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
          <Tabs
            aria-label="Options"
            placement="start"
            selectedKey={activeTab}
            onSelectionChange={(e) => setActiveTab(e)}
          >
            {tmdbDetailsData.data.seasons?.map((_season) => {
              const season = _season.season_number;

              if (season === 0) return null;

              return (
                <Tab
                  className="cursor-pointer"
                  key={season}
                  title={season + ". Sezon"}
                >
                  {renderSeasonTab()}
                </Tab>
              );
            })}
          </Tabs>
        </div>
      </div>
    </>
  );
}
