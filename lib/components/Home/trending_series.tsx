"use client";

import { Loading } from "@/lib/components/Loading";
import TmdbService from "@/lib/services/tmdb.service";
import { useQuery } from "@tanstack/react-query";
import { SerieCard } from "./SerieCard";

export function HomeTrendingSeries() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["home-data"],
    queryFn: () => TmdbService.fetchHomeData(),
  });

  if (isPending) return <Loading />;

  if (isError) return <div>Error</div>;

  return (
    <section className="mt-9">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700 text-base dark:text-white">
          Trend Diziler
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-y-5 sm:grid-cols-3 gap-x-5">
        {isPending ? (
          <Loading />
        ) : (
          data.trending.results.slice(0, 5).map((serie) => (
            <SerieCard
              key={serie.id}
              serie={{
                image: serie.poster_path!,
                name: serie.original_name,
                tmdb_id: serie.id,
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}
