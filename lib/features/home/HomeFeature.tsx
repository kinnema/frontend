"use client";

import { FeaturedCarousel } from "@//components/featured-carousel";
import { ShowCarousel } from "@/components/show-carousel";
import TmdbService from "@/lib/services/tmdb.service";
import UserService from "@/lib/services/user.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { TmdbNetworks } from "@/lib/types/networks";
import { Result } from "@/lib/types/tmdb";
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
        lastWatched.data!.length > 0 && (
          <ShowCarousel
            title="Izlemeye devam et"
            shows={
              lastWatched.data?.map(
                (s) =>
                  ({
                    name: `${s.name} - ${s.season}:${s.episode}`,
                    original_name: `${s.name}`,
                    poster_path: s.poster_path,
                  } as Result)
              ) ?? []
            }
            maxCards={5}
            largeCards={true}
            isLoading={bluTvShows.isPending}
          />
        )}

      <ShowCarousel
        title="BluTV"
        shows={bluTvShows.data?.results ?? []}
        maxCards={5}
        largeCards={true}
        isLoading={bluTvShows.isPending}
      />
      <ShowCarousel
        title="GainTV"
        shows={gainTvShows.data?.results ?? []}
        maxCards={5}
        largeCards={true}
        isLoading={gainTvShows.isPending}
      />
      <ShowCarousel
        title="Exxen"
        shows={exxenShows.data?.results ?? []}
        maxCards={5}
        largeCards={true}
        isLoading={exxenShows.isPending}
      />
    </>
  );
}
