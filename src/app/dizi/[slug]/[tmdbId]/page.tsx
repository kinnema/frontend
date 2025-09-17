import { SerieDialogFeature } from "@/lib/features/dizi/SerieDialog";
import TmdbService from "@/lib/services/tmdb.service";
import { QueryClient } from "@tanstack/react-query";

export default async function SeriePage(props: {
  params: Promise<{ slug: string; tmdbId: string }>;
}) {
  const params = await props.params;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tmdb-details-with-season", params.slug, params.tmdbId],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchSerie(parseInt(params.tmdbId));

      return tmdbData;
    },
  });

  return (
    <SerieDialogFeature
      params={{ ...params, tmdbId: parseInt(params.tmdbId) }}
    />
  );
}
