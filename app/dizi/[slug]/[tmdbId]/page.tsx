import { SerieDialogFeature } from "@/lib/features/dizi/SerieDialog";
import TmdbService from "@/lib/services/tmdb.service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function SeriePage({
  params,
}: {
  params: { slug: string; tmdbId: string };
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tmdb-details-with-season", params.slug, params.tmdbId],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchSerie(parseInt(params.tmdbId));

      return tmdbData;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SerieDialogFeature
        params={{ ...params, tmdbId: parseInt(params.tmdbId) }}
      />
    </HydrationBoundary>
  );
}
