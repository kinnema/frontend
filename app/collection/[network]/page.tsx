import getQueryClient from "@/lib/getQueryClient";
import {
  TmdbNetworks,
  fetchNetworkSeries,
} from "@/lib/services/series.service";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { CollectionSeries } from "./series";

interface IProps {
  params: {
    network: string;
  };
}

export default async function Page({ params }: IProps) {
  const queryClient = getQueryClient();
  const network =
    TmdbNetworks[params.network.toUpperCase() as keyof typeof TmdbNetworks];

  await queryClient.prefetchQuery({
    queryKey: ["network-series", network],
    queryFn: () => fetchNetworkSeries(network),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CollectionSeries network={network} />
    </HydrationBoundary>
  );
}
