import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useFavorites } from "@/lib/hooks/database/useFavorites";
import { IAddFavorite, IRemoveFavorite } from "@/lib/types/favorite.type";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
import { QUERY_KEYS } from "@/lib/utils/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { v4 } from "uuid";

interface IProps {
  tmdbData: ITmdbSerieDetails;
}

export function FavoriteButton({ tmdbData }: IProps) {
  const { t } = useTranslation();
  const { addFavorite, getFavorite, removeFavorite, getFavoriteByTmdb } =
    useFavorites(tmdbData.id);

  const favorites = useQuery({
    queryKey: [...QUERY_KEYS.Favorites, tmdbData.id],
    queryFn: () => getFavoriteByTmdb(tmdbData.id),
  });

  const removeFavoriteMutation = useMutation<void, void, IRemoveFavorite>({
    mutationFn: (data: IRemoveFavorite) => removeFavorite(data.id),
    onSuccess: async () => {
      toast({
        title: "Favorilerden kaldirildi",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: t("favorites.removeError"),
        variant: "destructive",
      });
    },
  });

  const addToFavorites = useMutation<void, void, IAddFavorite>({
    mutationFn: (data: IAddFavorite) => addFavorite(data),
    onSuccess: async () => {
      toast({
        title: t("favorites.added"),
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: t("favorites.addError"),
        variant: "destructive",
      });
    },
  });

  async function onAddFavorite() {
    await addToFavorites.mutateAsync({
      name: tmdbData.name,
      posterPath: tmdbData.poster_path,
      tmdbId: tmdbData.id,
      createdAt: new Date().toISOString(),
      id: v4(),
    });
  }

  async function onRemoveFavorite() {
    if (!favorites.data) return;

    await removeFavoriteMutation.mutateAsync({
      id: favorites.data?.id,
    });
  }

  const isFavorite = favorites.data ? true : false;

  return (
    <Button
      variant="outline"
      onClick={isFavorite ? onRemoveFavorite : onAddFavorite}
    >
      {addToFavorites.isPending ||
      favorites.isPending ||
      removeFavoriteMutation.isPending ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <AnimatePresence mode="wait">
          {isFavorite ? (
            <motion.span
              key="remove"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-center"
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -15, 15, -15, 0],
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              >
                <Heart className="w-6 h-6 text-primary fill-primary" />
              </motion.div>
              Favorilerden cikar
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-center"
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -15, 15, -15, 0],
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              >
                <Heart className="h-6 w-6" />
              </motion.div>
              {t("favorites.addToFavorites")}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </Button>
  );
}
