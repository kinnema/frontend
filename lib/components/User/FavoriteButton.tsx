import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  ApiFavoritesGet200ResponseInner,
  ApiFavoritesIdDeleteRequest,
  ApiFavoritesPostRequest,
} from "@/lib/api";
import UserService from "@/lib/services/user.service";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";

interface IProps {
  tmdbData: ITmdbSerieDetails;
}

export function FavoriteButton({ tmdbData }: IProps) {
  const queryClient = useQueryClient();

  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: () => UserService.fetchFavorites(),
  });

  const removeFavorite = useMutation<
    ApiFavoritesGet200ResponseInner,
    void,
    ApiFavoritesIdDeleteRequest
  >({
    mutationFn: (data: ApiFavoritesIdDeleteRequest) =>
      UserService.removeFromFavorites(data.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });

      toast({
        title: "Favorilerden kaldirildi",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Favorilerden kaldirilirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const addToFavorites = useMutation<
    ApiFavoritesGet200ResponseInner,
    void,
    ApiFavoritesPostRequest
  >({
    mutationFn: (data: ApiFavoritesPostRequest) =>
      UserService.addToFavorites(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });

      toast({
        title: "Favorilere eklendi",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Favorilere eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  async function onAddFavorite() {
    await addToFavorites.mutateAsync({
      name: tmdbData.name,
      posterPath: tmdbData.poster_path,
      tmdbId: tmdbData.id,
    });
  }

  async function onRemoveFavorite() {
    const favoriteId = favorites.data
      ?.filter((fav) => fav.tmdbId === tmdbData.id)
      .at(0);

    if (!favoriteId) return;

    await removeFavorite.mutateAsync({
      id: favoriteId.id!,
    });
  }

  const isFavorite = favorites.data?.some((fav) => fav.tmdbId === tmdbData.id);

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() =>
        addToFavorites.mutate({
          name: tmdbData.name,
          posterPath: tmdbData.poster_path,
          tmdbId: tmdbData.id,
        })
      }
    >
      {addToFavorites.isPending ||
      favorites.isPending ||
      removeFavorite.isPending ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <>
          {isFavorite ? (
            <span
              onClick={onRemoveFavorite}
              className="flex gap-2 items-center"
            >
              <Heart className="w-6 h-6 text-primary fill-primary" />
              Favorilerden cikar
            </span>
          ) : (
            <span onClick={onAddFavorite} className="flex gap-2 items-center">
              <Heart className="h-6 w-6" />
              Favorilere ekle
            </span>
          )}
        </>
      )}
    </Button>
  );
}
