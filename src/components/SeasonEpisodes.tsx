import { TmdbImage } from "@/components/Image";
import { Loading } from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/helpers";
import { useLastWatched } from "@/lib/hooks/database/useLastWatched";
import TmdbService from "@/lib/services/tmdb.service";
import { ILastWatched } from "@/lib/types/lastWatched.type";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RxDocument } from "rxdb";

interface IProps {
  id: number;
  season: number;
  serie_name: string;
  isTurkishProvider: boolean;
  serieNetwork: number[];
}

export default function SeasonEpisodes({ id, season, serie_name }: IProps) {
  const { getAllLastWatched } = useLastWatched();
  const [lastWatched, setLastWatched] = useState<
    RxDocument<ILastWatched, {}>[]
  >([]);
  const { data, isPending, isError } = useQuery({
    queryKey: ["season-episodes", id, season],
    queryFn: () => TmdbService.fetchSeasonEpisodes(id, season),
  });

  useEffect(() => {
    getAllLastWatched().then((r) => {
      setLastWatched(r);
    });
  }, []);

  if (isError) {
    return <div>Error</div>;
  }

  if (isPending) {
    return <Loading />;
  }
  if (!data || !data.episodes) {
    return <div>No episodes found</div>;
  }

  return (
    <>
      {data.episodes?.map((episode) => {
        return (
          <Link
            key={episode.id}
            to="/"
            search={{
              watchSlug: slugify(serie_name),
              watchTmdbId: id,
              watchSeason: season,
              watchChapter: episode.episode_number,
            }}
            className="flex w-full gap-4 p-4 hover:bg-white/5 rounded-lg transition-colors text-left"
          >
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden">
              <TmdbImage
                src={episode.still_path ?? ""}
                alt={episode.name}
                className="object-cover w-full h-full"
                loading="lazy"
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

              {lastWatched.filter(
                (r) =>
                  r.tmdbId === episode.show_id &&
                  r.season_number === episode.season_number &&
                  r.episode_number === episode.episode_number &&
                  r.isWatched == true
              ).length > 0 && <Badge variant="default">Izlendi</Badge>}
            </div>
          </Link>
        );
      })}
    </>
  );
}
