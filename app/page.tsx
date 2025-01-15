import { HomeFeature } from "@/lib/features/home/HomeFeature";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeFeature />
    </HydrationBoundary>
  );
}
