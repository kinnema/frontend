import { Loading } from "@/lib/components/Loading";
import { slugify } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

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

  if (isPending) {
    return <Loading />;
  }

  return (
    <>
      {data.episodes?.map((episode) => {
        if (episode.runtime !== null) {
          let episodeHref = `/dizi/${slugify(
            serie_name
          )}/sezon-${season}/bolum-${episode.episode_number}`;

          if (isTurkishProvider) {
            episodeHref += `?network=${serieNetwork?.at(0)}`;
          }
          return (
            <Link key={episode.id} href={episodeHref}>
              <div className="flex items-center justify-between p-4 mb-2  bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex gap-3 flex-col text-sm font-medium text-gray-800 dark:text-gray-400">
                      {episode.season_number}:{episode.episode_number} -{" "}
                      {episode.name}
                      <span className="text-xs text-gray-500">
                        {episode.overview}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        }

        return null;
      })}
    </>
  );
}
