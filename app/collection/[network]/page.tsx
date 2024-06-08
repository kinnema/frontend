import getQueryClient from "@/lib/getQueryClient";
import { fetchNetworkSeries } from "@/lib/services/series.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { CollectionSeries } from "./series";

interface IProps {
  params: {
    network: string;
  };
}

export default async function Page({ params }: IProps) {
  const queryClient = getQueryClient();
  const networkAsTmdbKey =
    params.network.toUpperCase() as keyof typeof TmdbNetworks;

  if (!Object.values(TmdbNetworks).includes(networkAsTmdbKey)) {
    return redirect("/");
  }

  const network = TmdbNetworks[networkAsTmdbKey];

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
