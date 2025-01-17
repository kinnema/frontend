import { Loading } from "@/lib/components/Loading";
import { slugify, tmdbPoster } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { TurkishProviderIds } from "@/lib/types/networks";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface IProps {
  id: number;
  season: number;
  serie_name: string;
  isTurkishProvider: boolean;
  serieNetwork: number[];
}

export default function SeasonEpisodes({
  id,
  season,
  serie_name,
  isTurkishProvider,
  serieNetwork,
}: IProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["season-episodes", id, season],
    queryFn: () => TmdbService.fetchSeasonEpisodes(id, season),
  });

  if (isError) {
    return <div>Error</div>;
  }

  const network = useMemo(() => {
    return serieNetwork.findIndex((n) => {
      const s = TurkishProviderIds.findIndex((i) => n === i);

      if (s !== -1) {
        return s;
      }
    });
  }, [serieNetwork]);

  if (isPending) {
    return <Loading />;
  }

  return (
    <>
      {data.episodes?.map((episode) => {
        if (episode.runtime !== null) {
          let episodeHref = `/dizi/${slugify(
            serie_name
          )}/${id}/sezon-${season}/bolum-${episode.episode_number}`;

          if (isTurkishProvider) {
            episodeHref += `?network=${serieNetwork?.at(network)}`;
          }

          return (
            <Link
              key={episode.id}
              href={episodeHref}
              className="flex w-full gap-4 p-4 hover:bg-white/5 rounded-lg transition-colors text-left"
            >
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden">
                <Image
                  src={tmdbPoster(episode.still_path)}
                  alt={episode.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{episode.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {episode.overview}
                </p>
              </div>
            </Link>
          );
        }

        return null;
      })}
    </>
  );
}
