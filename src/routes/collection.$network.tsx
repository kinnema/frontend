import { CollectionSeries } from "@/app/collection/[network]/series";
import getQueryClient from "@/lib/getQueryClient";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Suspense } from "react";
import z from "zod";

const collectionSearchSchema = z.object({
  page: z.number().catch(1),
});

function validateNetwork(network: string) {
  const validNetworks = ["blutv", "gain", "exxen", "netflix", "disney"];
  return validNetworks.includes(network);
}

function mapToTmdbNetwork(network: string) {
  const networkAsTmdbKey = network.toUpperCase() as keyof typeof TmdbNetworks;

  return TmdbNetworks[networkAsTmdbKey] || null;
}

export const Route = createFileRoute("/collection/$network")({
  beforeLoad: ({ params }) => {
    if (!validateNetwork(params.network)) {
      throw redirect({ to: "/" });
    }
  },
  validateSearch: zodValidator(collectionSearchSchema),
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
        <Suspense>
          <CollectionSeries network={network} />
        </Suspense>
      </div>
    );
  },
});
