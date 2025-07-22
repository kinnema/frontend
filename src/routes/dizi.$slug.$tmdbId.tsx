import { Dialog } from "@/components/ui/dialog";
import { SerieDialogFeature } from "@/lib/features/dizi/SerieDialog";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/dizi/$slug/$tmdbId")({
  component: () => {
    const { slug, tmdbId } = Route.useParams();

    return (
      <div className="container mx-auto px-4 py-8">
        <Suspense>
          <Dialog>
            <SerieDialogFeature
              params={{
                slug,
                tmdbId: parseInt(tmdbId),
              }}
            />
          </Dialog>
        </Suspense>
      </div>
    );
  },
});
