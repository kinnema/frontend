"use client";

import { Loading } from "@/lib/components/Loading";
import { slugify, tmdbPoster } from "@/lib/helpers";
import { fetchHomeData } from "@/lib/services/series.service";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import Link from "next/link";

export function HomePopularSeries() {
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
          Gözde Diziler
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-y-5 sm:grid-cols-3 gap-x-5">
        {data.popular.results.slice(0, 5).map((serie) => (
          <Link href={`/dizi/${slugify(serie.original_name)}`} key={serie.id}>
            <div
              className={classNames(
                "flex flex-col rounded-xl overflow-hidden cursor-pointer group select-none relative",
                serie.name && "border dark:border-zinc-600"
              )}
            >
              <div className="absolute inset-0 bg-black/60 none flex-col items-center justify-center gap-4 text-sm font-bold opacity-0 group-hover:opacity-100 duration-300 text-center hidden md:flex  ">
                <div className="self-center flex flex-col items-center space-y-2">
                  <span className="capitalize text-white font-medium drop-shadow-md">
                    {serie.original_name}
                  </span>
                </div>
              </div>

              <img
                src={tmdbPoster(serie.poster_path ?? "")}
                className="h-full w-full"
                alt={serie.original_name}
              />

              {serie.original_name && (
                <div className="w-full bg-white dark:bg-zinc-800 dark:text-white px-3 flex py-5 items-center justify-between border-t-2 border-t-red-600">
                  <span className="capitalize  font-medium truncate">
                    {serie.original_name}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
