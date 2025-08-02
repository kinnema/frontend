import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { useToast } from "@/hooks/use-toast";
import { useLastWatched } from "@/lib/hooks/database/useLastWatched";
import { ILastWatched } from "@/lib/types/lastWatched.type";
import { useEffect, useState } from "react";
import slugify from "slugify";
// import { useLastWatchedStore } from "@/lib/stores/lastWatched.store";

export function LastWatchedSeries() {
  const toast = useToast();
  const { getAllLastWatched$, removeLastWatched } = useLastWatched();
  const [lastWatched, setLastWatched] = useState<ILastWatched[]>([]);

  useEffect(() => {
    async function getLastWatched() {
      const query = await getAllLastWatched$();

      const unsubscribe = query.subscribe((data) => {
        setLastWatched(data);
      });

      return () => {
        unsubscribe.unsubscribe();
      };
    }
    const s = getLastWatched();

    return () => {
      s.then((r) => r());
    };
  }, []);

  // async function getLastWatched() {
  function handleRemove(id: number) {
    removeLastWatched(id);
    toast.toast({
      title: "İzleme listesinden kaldırıldı",
      description: "İzleme listesinden kaldırıldı",
    });
  }

  if (lastWatched?.length < 1) return;

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
              subTitle: `${s.season_number} Sezon ${s.episode_number} Bölüm`,
            }}
            key={s.tmdbId}
            withTimeline={true}
            progress={Math.floor((s.atSecond / s.totalSeconds) * 100)}
            onRemove={() => handleRemove(s.tmdbId)}
            href={`/dizi/${slugify(s.name)}/${s.tmdbId}/sezon-${
              s.season_number
            }/bolum-${s.episode_number}?network=${s.network}`}
          />
        );
      })}
    />
  );
}
// }
