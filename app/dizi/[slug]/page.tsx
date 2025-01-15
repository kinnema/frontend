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
  params: { slug: string };
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tmdb-details-with-season", params.slug],
    queryFn: async () => {
      const tmdbSearch = await TmdbService.searchSeries(params.slug);
      const tmdbData = TmdbService.fetchSerie(tmdbSearch.results[0].id);

      return tmdbData;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SerieDialogFeature params={params} />
    </HydrationBoundary>
  );
}
