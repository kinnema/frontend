import { CollectionSeries } from "@/app/collection/[network]/series";
import { TmdbNetworks } from "@/lib/types/networks";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Suspense } from "react";
import z from "zod";

const collectionSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/collection/$network")({
  beforeLoad: ({ params }) => {
    // Add validation if needed
    const validNetworks = ["blutv", "gain", "exxen", "netflix", "disney"];
    if (!validNetworks.includes(params.network)) {
      throw redirect({ to: "/" });
    }
  },
  validateSearch: zodValidator(collectionSearchSchema),
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
