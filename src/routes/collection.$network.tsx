import { Loading } from "@/components/Loading";
import { CollectionSeries } from "@/components/series";
import getQueryClient from "@/lib/getQueryClient";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

function validateNetwork(network: string) {
  const validNetworks = ["blutv", "gain", "exxen", "netflix", "disney"];
  return validNetworks.includes(network);
}

function mapToTmdbNetwork(network: string) {
  const networkAsTmdbKey = network.toUpperCase() as keyof typeof TmdbNetworks;

  return TmdbNetworks[networkAsTmdbKey] || null;
}

type SearchParams = {
  page?: number;
};

export const Route = createFileRoute("/collection/$network")({
  beforeLoad: ({ params }) => {
    if (!validateNetwork(params.network)) {
      throw redirect({ to: "/", search: {} });
    }
  },
  validateSearch: (search): SearchParams => {
    return {
      page: search.page ? Number(search.page) : 1,
    };
  },
  loader: async ({ params }) => {
    const queryClient = getQueryClient();
    const network = mapToTmdbNetwork(params.network);
    await queryClient.prefetchQuery({
      queryKey: ["network-series", network, 1],
      queryFn: () => TmdbService.fetchNetworkSeries(network, 1),
    });

    return { network: params.network };
  },
  component: () => {
    const { network: _network } = Route.useParams();
    const network = mapToTmdbNetwork(_network);

    return (
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<Loading fullscreen />}>
          <CollectionSeries network={network} />
        </Suspense>
      </div>
    );
  },
});
