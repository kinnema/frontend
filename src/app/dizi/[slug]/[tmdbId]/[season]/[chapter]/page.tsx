import WatchPage from "@/lib/features/watch/WatchPage";
import TmdbService from "@/lib/services/tmdb.service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";

interface IProps {
  params: Promise<{
    slug: string;
    tmdbId: string;
    season: string;
    chapter: string;
  }>;
}

export default async function ChapterPage(props: IProps) {
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <WatchPage params={params} />
      </Suspense>
    </HydrationBoundary>
  );
}
