import { ShowCard } from "@/components/show-card";
import { ShowCarousel } from "@/components/show-carousel";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/helpers";
import UserService from "@/lib/services/user.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loading } from "../Loading";

export function LastWatchedSeries() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const lastWatched = useQuery({
    queryKey: ["lastWatched"],
    queryFn: () => UserService.fetchLastWatched(),
  });

  const deleteLastWatched = useMutation({
    mutationFn: (id: string) => UserService.deleteLastWatched(id),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["lastWatched"] });
      toast.toast({
        title: "İzleme listesinden kaldırıldı",
        description: "İzleme listesinden kaldırıldı",
      });
    },
  });

  const handleRemove = async (id: string) => {
    await deleteLastWatched.mutateAsync(id);
  };

  if (lastWatched.isPending) return <Loading />;

  if (lastWatched.isError) return <div>Error</div>;

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
