import WatchPage from "@/lib/features/watch/WatchPage";
import AppService from "@/lib/services/app.service";
import TmdbService from "@/lib/services/tmdb.service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

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
  const season = parseInt(params.season.replace("sezon-", ""));
  const chapter = parseInt(params.chapter.replace("bolum-", ""));

  await queryClient.prefetchQuery({
    queryKey: ["tmdb-details-with-season", params.slug, params.tmdbId],
    queryFn: async () => {
      const tmdbData = await TmdbService.fetchSerie(parseInt(params.tmdbId));

      return tmdbData;
    },
  });

  await queryClient.prefetchQuery({
    networkMode: "offlineFirst",
    queryKey: ["dizi-watch", params.slug, season, chapter],
    queryFn: async () => {
      return AppService.fetchSeries(params.slug, season, chapter);
    },
    retry: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WatchPage params={params} />
    </HydrationBoundary>
  );
}
