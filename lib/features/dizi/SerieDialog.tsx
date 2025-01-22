"use client";

import SeasonEpisodes from "@/app/dizi/[slug]/components/SeasonEpisodes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/lib/components/Loading";
import { FavoriteButton } from "@/lib/components/User/FavoriteButton";
import { tmdbPoster } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { TurkishProviderIds } from "@/lib/types/networks";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface IProps {
  params: {
    slug: string;
    tmdbId: number;
  };
  isClient?: boolean;
}

export function SerieDialogFeature({ params, isClient }: IProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);

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

  if (tmdbDetailsData.isError) return <div>Error</div>;

  if (tmdbDetailsData.isPending) return <Loading fullscreen />;

  return (
    <>
      <div className="relative h-[50vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
        <Image
          className="w-full h-full object-cover"
          src={tmdbPoster(tmdbDetailsData.data.poster_path!)}
          alt={tmdbDetailsData.data.overview}
          width={600}
          height={500}
          priority
        />
        {isClient && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 text-white"
              onClick={() => router.back()}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="absolute bottom-6 left-6 z-20">
          <span className="text-emerald-400 text-sm mb-2 gap-1 flex ">
            {tmdbDetailsData.data.networks.map((network) => (
              <p key={network.id}>{network.name}</p>
            ))}
            orijinal dizisi
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
            {isAuthenticated && (
              <FavoriteButton tmdbData={tmdbDetailsData.data} />
            )}
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
              value={season?.season_number.toString() ?? 1}
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
