import getQueryClient from "@/lib/getQueryClient";
import TmdbService from "@/lib/services/tmdb.service";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { HomeAiringToday } from "../lib/components/Home/airing_today";
import { HomePopularSeries } from "../lib/components/Home/popular_series";
import { HomeTrendingSeries } from "../lib/components/Home/trending_series";

export default async function Home() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["home-data"],
    queryFn: () => TmdbService.fetchHomeData(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePopularSeries />
      <HomeAiringToday />
      <HomeTrendingSeries />
      {/* <HomeMovieCategory categoryName="Trendler"  />
      <HomeMovieCategory categoryName="Yeni Diziler" data={data.new_series} />
      <HomeMovieCategory
        categoryName="Son Bölümler"
        data={data.last_episodes}
      /> */}
    </HydrationBoundary>
  );
}
