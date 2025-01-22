import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { slugify } from "@/lib/helpers";
import UserService from "@/lib/services/user.service";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../Loading";

export function LastWatchedSeries() {
  const lastWatched = useQuery({
    queryKey: ["lastWatched"],
    queryFn: () => UserService.fetchLastWatched(),
  });

  const tmdbData = useQuery({
    enabled: lastWatched.isSuccess,
    queryKey: ["lastWatchedTmdb"],
    // queryFn: () => TmdbService.fetchSeasonEpisodes(),
  });

  if (lastWatched.isPending) return <Loading />;

  if (lastWatched.isError) return <div>Error</div>;

  if (lastWatched.data!.length === 0) return <div>No last watched series</div>;

  return (
    <ShowCarousel
      title="Izlemeye devam et"
      shows={lastWatched.data!.map((s) => {
        return (
          <ShowCard
            show={{
              id: s.tmdbId,
              image: s.posterPath,
              title: s.name,
              subTitle: `${s.season} Sezon ${s.episode} Bölüm`,
            }}
            key={s.tmdbId}
            withTimeline={true}
            progress={Math.floor((s.atSecond / s.totalSeconds) * 100)}
            href={`/dizi/${slugify(s.name)}/${s.tmdbId}/sezon-${
              s.season
            }/bolum-${s.episode}?network=${s.network}`}
          />
        );
      })}
    />
  );
}
