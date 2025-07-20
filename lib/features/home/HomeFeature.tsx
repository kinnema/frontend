"use client";

import { FeaturedCarousel } from "@/components/featured-carousel";
import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { useToast } from "@/hooks/use-toast";
import { LastWatchedSeries } from "@/lib/components/User/LastWatchedSeries";
import TmdbService from "@/lib/services/tmdb.service";
import UserService from "@/lib/services/user.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { TmdbNetworks } from "@/lib/types/networks";
import { useQuery } from "@tanstack/react-query";

export function HomeFeature() {
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);

  const lastWatched = useQuery({
    enabled: isAuthenticated,
    queryKey: ["last-watched"],
    queryFn: () => UserService.fetchLastWatched(),
  });

  const networks = [TmdbNetworks.BLUTV, TmdbNetworks.GAIN, TmdbNetworks.EXXEN];
  const { data: networkData, isPending: isNetworkPending } = useQuery({
    queryKey: ["home", "networks"],
    queryFn: () => TmdbService.fetchMultipleNetworksSeries(networks),
  });

  return (
    <>
      <FeaturedCarousel />

      {isAuthenticated &&
        lastWatched.isSuccess &&
        lastWatched.data!.length > 0 && <LastWatchedSeries />}

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
