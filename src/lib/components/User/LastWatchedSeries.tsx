import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { useToast } from "@/hooks/use-toast";
import { useLastWatched } from "@/lib/hooks/database/useLastWatched";
import { ILastWatched } from "@/lib/types/lastWatched.type";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import slugify from "slugify";
// import { useLastWatchedStore } from "@/lib/stores/lastWatched.store";

export function LastWatchedSeries() {
  const { t } = useTranslation();
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
  function handleRemove(tmdbId: number, id: string) {
    removeLastWatched(tmdbId, id);
    toast.toast({
      title: "İzleme listesinden kaldırıldı",
      description: "İzleme listesinden kaldırıldı",
    });
  }

  if (lastWatched?.length < 1) return;

  return (
    <ShowCarousel
      titleTranslationKey="home.continueWatching"
      shows={lastWatched.map((s) => {
        return (
          <ShowCard
            show={{
              id: s.tmdbId,
              image: s.posterPath,
              title: s.name,
              subTitle: `${s.season_number}.${t("common.season")} ${
                s.episode_number
              }.${t("common.episode")}`,
            }}
            key={s.tmdbId}
            withTimeline={true}
            progress={Math.floor((s.atSecond / s.totalSeconds) * 100)}
            onRemove={() => handleRemove(s.tmdbId, s.id)}
            linkProps={{
              search: {
                watchSlug: slugify(s.name),
                watchTmdbId: s.tmdbId,
                watchSeason: s.season_number,
                watchChapter: s.episode_number,
              },
            }}
          />
        );
      })}
    />
  );
}
// }
