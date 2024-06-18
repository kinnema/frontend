"use client";

import { slugify } from "@/lib/helpers";
import UserService from "@/lib/services/user.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Loading } from "../Loading";
import { SerieCard } from "./SerieCard";

export function HomeLastWatched() {
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);

  const { data, isPending, isError } = useQuery({
    enabled: isAuthenticated,
    queryKey: ["last-watched"],
    queryFn: () => UserService.fetchLastWatched(),
  });

  if (!isAuthenticated) return null;

  if (isError) return <div>Error</div>;

  if (isPending) return <Loading />;

  if (data && data.length < 1) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-600 pb-10">
      <section className="mt-9">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700 text-base dark:text-white">
            Son izlenen
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-y-5 sm:grid-cols-3 gap-x-5">
          <Suspense fallback={<Loading />}>
            {data?.slice(0, 5).map((serie) => {
              let href = `/dizi/${slugify(serie.name)}/sezon-${
                serie.season
              }/bolum-${serie.episode}`;

              if (serie.network) {
                href += `?network=${serie.network}`;
              }

              const name = `${serie.name} - S:${serie.season} E:${serie.episode}`;
              return (
                <SerieCard
                  key={serie.id}
                  serie={{
                    name: name,
                    tmdb_id: serie.tmdb_id,
                    image: serie.poster_path,
                    href: href,
                  }}
                />
              );
            })}
          </Suspense>
        </div>
      </section>
    </div>
  );
}
