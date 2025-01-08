"use client";

import SeasonEpisodes from "@/app/dizi/[slug]/components/SeasonEpisodes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/lib/components/Loading";
import { tmdbPoster } from "@/lib/helpers";
import AppService from "@/lib/services/app.service";
import TmdbService from "@/lib/services/tmdb.service";
import { TurkishProviderIds } from "@/lib/types/networks";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Episode {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
}

export function SerieDialogFeature({ params }: { params: { slug: string } }) {
  const router = useRouter();
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
    <Dialog open={true}>
      <DialogContent className="max-w-6xl p-0 h-[90vh] bg-black/95 text-white border-zinc-800">
        <VisuallyHidden>
          <DialogTitle>{tmdbDetailsData.data.name}</DialogTitle>
        </VisuallyHidden>

        <div className="relative h-[50vh] bg-black">
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
          <Image
            className="w-full h-full object-cover"
            src={tmdbPoster(tmdbDetailsData.data.poster_path!)}
            alt={tmdbDetailsData.data.overview}
            width={600}
            height={500}
          />
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
          <div className="absolute bottom-6 left-6 z-20">
            <span className="text-emerald-400 text-sm mb-2 gap-1 flex ">
              {tmdbDetailsData.data.networks.map((network) => (
                <p>{network.name}</p>
              ))}
              orijinal dizisi
            </span>
            <h1 className="text-4xl font-bold mb-2">
              {tmdbDetailsData.data.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              {tmdbDetailsData.data.genres.map((genre, index) => {
                if (index !== tmdbDetailsData.data.genres.length) {
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

        <Tabs
          defaultValue={activeSeasonTab.toString()}
          className="w-full overflow-y-scroll scrollbar-hide scroll-smooth"
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
              <div className="space-y-4">{renderSeasonTab()}</div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
