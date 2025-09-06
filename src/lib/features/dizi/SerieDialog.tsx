"use client";

import SeasonEpisodes from "@/app/dizi/[slug]/components/SeasonEpisodes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TmdbImage } from "@/lib/components/Image";
import { Loading } from "@/lib/components/Loading";
import { FavoriteButton } from "@/lib/components/User/FavoriteButton";
import TmdbService from "@/lib/services/tmdb.service";
import { TurkishProviderIds } from "@/lib/types/networks";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useQuery } from "@tanstack/react-query";
// Image component replaced with img tag
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  params: {
    slug: string;
    tmdbId: number;
  };
}

export function SerieDialogFeature({ params }: IProps) {
  const { t } = useTranslation();
  const tmdbDetailsData = useQuery<ITmdbSerieDetails>({
    queryKey: ["tmdb-details-with-season", params.slug, params.tmdbId],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchSerie(params.tmdbId);

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

  const [activeSeasonTab, setActivateSeasonTab] = useState<number>(1);

  const renderSeasonTab = useCallback(() => {
    if (!tmdbDetailsData.isSuccess) return;

    return (
      <SeasonEpisodes
        season={activeSeasonTab}
        id={tmdbDetailsData.data.id}
        isTurkishProvider={isTurkishProvider!}
        serieNetwork={serieNetwork!}
        serie_name={tmdbDetailsData.data.original_name}
      />
    );
  }, [activeSeasonTab, tmdbDetailsData, isTurkishProvider, serieNetwork]);

  if (tmdbDetailsData.isError) return <div>{t("common.error")}</div>;

  if (tmdbDetailsData.isPending) return <Loading fullscreen />;

  return (
    <>
      <div className="relative h-[50vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
        <TmdbImage
          className="w-full h-full object-cover"
          src={tmdbDetailsData.data.poster_path!}
          alt={tmdbDetailsData.data.overview}
          width={600}
          height={500}
          loading="eager"
        />

        <div className="absolute bottom-6 left-6 z-20">
          <span className="text-emerald-400 text-sm mb-2 gap-1 flex ">
            {tmdbDetailsData.data.networks.map((network) => (
              <p key={network.id}>{network.name}</p>
            ))}
            {t("series.originalSeries")}
          </span>
          <h1 className="text-4xl font-bold mb-2">
            {tmdbDetailsData.data.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            {tmdbDetailsData.data.genres.map((genre, index) => {
              if (index !== tmdbDetailsData.data.genres.length - 1) {
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

          <div className="mt-10">
            {/* {isAuthenticated && ( */}
            <FavoriteButton tmdbData={tmdbDetailsData.data} />
            {/* )} */}
          </div>
        </div>
      </div>

      <Tabs
        defaultValue={activeSeasonTab.toString()}
        className="w-full"
        onValueChange={(tab) => setActivateSeasonTab(parseInt(tab))}
      >
        <TabsList className="w-full justify-start h-16 rounded-none border-b border-zinc-800 bg-black">
          {tmdbDetailsData.data.seasons.map((season) => (
            <TabsTrigger
              value={season?.season_number.toString()}
              className="data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-emerald-400"
            >
              {season.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeSeasonTab.toString()} className="mt-0">
          <div className="p-6">
            <div className="space-y-4">
              <ScrollArea className="h-[26vh]">{renderSeasonTab()}</ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
