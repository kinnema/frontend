import { FeaturedCarousel } from "@/components/featured-carousel";
import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { LastWatchedSeries } from "@/components/User/LastWatchedSeries";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { useQuery } from "@tanstack/react-query";

export default function HomeFeature() {
  const networks = [TmdbNetworks.NETFLIX, TmdbNetworks.HBO];
  const { data: networkData, isPending: isNetworkPending } = useQuery({
    queryKey: ["home", "networks"],
    queryFn: () => TmdbService.fetchMultipleNetworksSeries(networks),
  });

  const { data: popularData, isPending: isPopularPending } = useQuery({
    queryKey: ["home", "popular"],
    queryFn: () => TmdbService.fetchHomePopular(),
  });

  return (
    <>
      <FeaturedCarousel />
      <LastWatchedSeries />

      <ShowCarousel
        titleTranslationKey="home.topRatedSeries"
        shows={
          popularData?.results.slice(0, 15).map((s) => (
            <ShowCard
              show={{
                id: s.id,
                image: s.poster_path,
                title: s.original_name,
              }}
              key={s.id}
            />
          )) ?? []
        }
        maxCards={10}
        largeCards={true}
        isLoading={isPopularPending}
      />

      <ShowCarousel
        titleTranslationKey="home.networkSeries"
        shows={
          networkData?.[TmdbNetworks.NETFLIX]?.results.map((s) => (
            <ShowCard
              show={{ id: s.id, image: s.poster_path, title: s.original_name }}
              key={s.id}
            />
          )) ?? []
        }
        maxCards={5}
        largeCards={true}
        isLoading={isNetworkPending}
      />
      <ShowCarousel
        titleTranslationKey="home.networkSeries"
        shows={
          networkData?.[TmdbNetworks.HBO]?.results.map((s) => (
            <ShowCard
              show={{ id: s.id, image: s.poster_path, title: s.original_name }}
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
