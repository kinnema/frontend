import { CollectionSeries } from "@/app/collection/[network]/series";
import { TmdbNetworks } from "@/lib/types/networks";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/collection/$network")({
  beforeLoad: ({ params }) => {
    // Add validation if needed
    const validNetworks = ["blutv", "gain", "exxen", "netflix", "disney"];
    if (!validNetworks.includes(params.network)) {
      throw redirect({ to: "/" });
    }
  },
  component: () => {
    const { network } = Route.useParams();
    const networkAsTmdbKey = network.toUpperCase() as keyof typeof TmdbNetworks;

    if (!Object.values(TmdbNetworks).includes(networkAsTmdbKey)) {
      return redirect({
        to: "/",
      });
    }

    const networkk = TmdbNetworks[networkAsTmdbKey];

    return (
      <div className="container mx-auto px-4 py-8">
        <Suspense>
          <CollectionSeries network={networkk} />
        </Suspense>
      </div>
    );
  },
});
