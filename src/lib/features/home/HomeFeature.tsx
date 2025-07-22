"use client";

import { FeaturedCarousel } from "@/components/featured-carousel";
import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { LastWatchedSeries } from "@/lib/components/User/LastWatchedSeries";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { useQuery } from "@tanstack/react-query";

export function HomeFeature() {
  const networks = [TmdbNetworks.BLUTV, TmdbNetworks.GAIN, TmdbNetworks.EXXEN];
  const { data: networkData, isPending: isNetworkPending } = useQuery({
    queryKey: ["home", "networks"],
    queryFn: () => TmdbService.fetchMultipleNetworksSeries(networks),
  });

  return (
    <>
      <FeaturedCarousel />
      <LastWatchedSeries />

      <ShowCarousel
        title="BluTV"
        shows={
          networkData?.[TmdbNetworks.BLUTV]?.results.map((s) => (
            <ShowCard
              show={{ id: s.id, image: s.poster_path, title: s.name }}
              key={s.id}
            />
          )) ?? []
        }
        maxCards={5}
        largeCards={true}
        isLoading={isNetworkPending}
      />
      <ShowCarousel
        title="GainTV"
        shows={
          networkData?.[TmdbNetworks.GAIN]?.results.map((s) => (
            <ShowCard
              show={{ id: s.id, image: s.poster_path, title: s.name }}
              key={s.id}
            />
          )) ?? []
        }
        maxCards={5}
        largeCards={true}
        isLoading={isNetworkPending}
      />
      <ShowCarousel
        title="Exxen"
        shows={
          networkData?.[TmdbNetworks.EXXEN]?.results.map((s) => (
            <ShowCard
              show={{ id: s.id, image: s.poster_path, title: s.name }}
              key={s.id}
            />
          )) ?? []
        }
        maxCards={5}
        largeCards={true}
        isLoading={isNetworkPending}
      />
    </>
  );
}
