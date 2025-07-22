import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/helpers";
import { useLastWatchedStore } from "@/lib/stores/lastWatched.store";

export function LastWatchedSeries() {
  const toast = useToast();
  const lastWatched = useLastWatchedStore((state) => state.series);
  const removeLastWatched = useLastWatchedStore((state) => state.removeSerie);

  function handleRemove(id: string) {
    removeLastWatched(id);
    toast.toast({
      title: "İzleme listesinden kaldırıldı",
      description: "İzleme listesinden kaldırıldı",
    });
  }

  if (lastWatched.length < 1) return;

  return (
    <ShowCarousel
      title="İzlemeye devam et"
      shows={lastWatched.map((s) => {
        return (
          <ShowCard
            show={{
              id: s.id,
              image: s.posterPath,
              title: s.name,
              subTitle: `${s.season} Sezon ${s.episode} Bölüm`,
            }}
            key={s.tmdbId}
            withTimeline={true}
            progress={Math.floor((s.atSecond / s.totalSeconds) * 100)}
            onRemove={() => handleRemove(s.id)}
            href={`/dizi/${slugify(s.name)}/${s.tmdbId}/sezon-${
              s.season
            }/bolum-${s.episode}?network=${s.network}`}
          />
        );
      })}
    />
  );
}
