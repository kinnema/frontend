import { HomeFeature } from "@/lib/features/home/HomeFeature";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["home", "blutv"],
    queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.BLUTV),
  });

  await queryClient.prefetchQuery({
    queryKey: ["home", "gain"],
    queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.GAIN),
  });

  await queryClient.prefetchQuery({
    queryKey: ["home", "exxen"],
    queryFn: () => TmdbService.fetchNetworkSeries(TmdbNetworks.EXXEN),
  });

  await queryClient.prefetchQuery({
    queryKey: ["home-data"],
    queryFn: () => TmdbService.fetchHomeData(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <HomeFeature />
      </Suspense>
    </HydrationBoundary>
  );
}
