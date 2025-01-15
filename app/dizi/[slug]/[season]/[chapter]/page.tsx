import WatchPage from "@/lib/features/watch/WatchPage";
import AppService from "@/lib/services/app.service";
import TmdbService from "@/lib/services/tmdb.service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
  };
}

export default async function ChapterPage({ params }: IProps) {
  const queryClient = new QueryClient();
  const season = parseInt(params.season.replace("sezon-", ""));
  const chapter = parseInt(params.chapter.replace("bolum-", ""));

  await queryClient.prefetchQuery({
    queryKey: ["tmdb-details-with-season", params.slug],
    queryFn: async () => {
      const tmdbSearch = await TmdbService.searchSeries(params.slug);
      const tmdbData = await TmdbService.fetchSerie(tmdbSearch.results[0].id);

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
