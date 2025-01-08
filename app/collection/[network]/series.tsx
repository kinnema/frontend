"use client";

import { Loading } from "@/lib/components/Loading";
import { slugify, tmdbPoster } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import Link from "next/link";

interface IProps {
  network: TmdbNetworks;
}

export function CollectionSeries({ network }: IProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["network-series", network],
    queryFn: () => TmdbService.fetchNetworkSeries(network),
  });

  if (isPending) return <Loading fullscreen />;

  if (isError) return <div>Error</div>;

  return (
    <section className="p-10">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-2xl text-white">
          {TmdbNetworks[network].toLocaleUpperCase()}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-5">
        {data.results.map((serie) => (
          <Link
            href={`/dizi/${slugify(serie.original_name)}`}
            key={serie.id}
            className="overflow-hidden"
          >
            <div
              className={classNames(
                "flex flex-col rounded-xl overflow-hidden cursor-pointer group select-none relative w-60 h-80 ",
                serie.original_name && "border border-zinc-600"
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
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
