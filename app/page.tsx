"use client";
import { HomeMovieCategory } from "@/lib/components/Home/HomeMovieCategory";
import { IHomeResults } from "@/lib/models";
import { fetchHomeData } from "@/lib/services/series.service";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data, isPending, isError } = useQuery<IHomeResults>({
    queryKey: ["trends"],
    queryFn: () => fetchHomeData(),
  });

  if (isError) return <div>Error</div>;

  if (isPending) return <div>Loading...</div>;

  return (
    <>
      <HomeMovieCategory categoryName="Trendler" data={data.trends} />
      <HomeMovieCategory categoryName="Yeni Diziler" data={data.new_series} />
      <HomeMovieCategory
        categoryName="Son Bölümler"
        data={data.last_episodes}
      />
    </>
  );
}
