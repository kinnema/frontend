"use client";

import { FeaturedCarousel } from "@/components/featured-carousel";
import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { LastWatchedSeries } from "@/lib/components/User/LastWatchedSeries";
import TmdbService from "@/lib/services/tmdb.service";
import UserService from "@/lib/services/user.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { TmdbNetworks } from "@/lib/types/networks";
import { useQuery } from "@tanstack/react-query";

export function HomeFeature() {
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const bluTvShows = useQuery({
    queryKey: ["home", "blutv"],
    queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.BLUTV),
  });
  const gainTvShows = useQuery({
    queryKey: ["home", "gain"],
    queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.GAIN),
  });
  const exxenShows = useQuery({
    queryKey: ["home", "exxen"],
    queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.EXXEN),
  });
  const lastWatched = useQuery({
    enabled: isAuthenticated,
    queryKey: ["last-watched"],
    queryFn: () => UserService.fetchLastWatched(),
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
          bluTvShows.data?.results.map((s) => (
            <ShowCard
              show={{ id: s.id, image: s.poster_path, title: s.name }}
              key={s.id}
            />
          )) ?? []
        }
        maxCards={5}
        largeCards={true}
        isLoading={bluTvShows.isPending}
      />
      <ShowCarousel
        title="GainTV"
        shows={
          gainTvShows.data?.results.map((s) => (
            <ShowCard
              show={{ id: s.id, image: s.poster_path, title: s.name }}
              key={s.id}
            />
          )) ?? []
        }
        maxCards={5}
        largeCards={true}
        isLoading={gainTvShows.isPending}
      />
      <ShowCarousel
        title="Exxen"
        shows={
          exxenShows.data?.results.map((s) => (
            <ShowCard
              show={{ id: s.id, image: s.poster_path, title: s.name }}
              key={s.id}
            />
          )) ?? []
        }
        maxCards={5}
        largeCards={true}
        isLoading={exxenShows.isPending}
      />
    </>
  );
}
