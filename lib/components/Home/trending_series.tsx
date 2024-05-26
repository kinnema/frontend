"use client";

import { Loading } from "@/lib/components/Loading";
import { fetchHomeData } from "@/lib/services/series.service";
import { useQuery } from "@tanstack/react-query";
import { SerieCard } from "./SerieCard";

export function HomeTrendingSeries() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["home-data"],
    queryFn: () => fetchHomeData(),
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
          data.airToday.results
            .slice(0, 5)
            .map((serie) => <SerieCard key={serie.id} serie={serie} />)
        )}
      </div>
    </section>
  );
}
