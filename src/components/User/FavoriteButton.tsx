import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useFavorites } from "@/lib/hooks/database/useFavorites";
import { ITmdbSerieDetails } from "@/lib/types/tmdb";
import { Heart, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 } from "uuid";

interface IProps {
  tmdbData: ITmdbSerieDetails;
}

export function FavoriteButton({ tmdbData }: IProps) {
  const { t } = useTranslation();
  const { addFavorite, getFavorite, removeFavorite, getFavoriteByTmdb } =
    useFavorites(tmdbData.id);

  const [favorites, setFavorites] = useState<any>(null);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const data = await getFavoriteByTmdb(tmdbData.id);
        setFavorites(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setFavoritesLoading(false);
      }
    }
    fetchFavorites();
  }, [tmdbData.id, getFavoriteByTmdb]);

  async function onAddFavorite() {
    setAddLoading(true);
    try {
      await addFavorite({
        name: tmdbData.name,
        posterPath: tmdbData.poster_path,
        tmdbId: tmdbData.id,
        createdAt: new Date().toISOString(),
        id: v4(),
      });
      toast({
        title: t("favorites.added"),
        variant: "success",
      });
      // Refetch favorites
      const data = await getFavoriteByTmdb(tmdbData.id);
      setFavorites(data);
    } catch (error) {
      toast({
        title: t("favorites.addError"),
        variant: "destructive",
      });
    } finally {
      setAddLoading(false);
    }
  }

  async function onRemoveFavorite() {
    if (!favorites) return;
    setRemoveLoading(true);
    try {
      await removeFavorite(favorites.id);
      toast({
        title: "Favorilerden kaldirildi",
        variant: "success",
      });
      // Refetch favorites
      const data = await getFavoriteByTmdb(tmdbData.id);
      setFavorites(data);
    } catch (error) {
      toast({
        title: t("favorites.removeError"),
        variant: "destructive",
      });
    } finally {
      setRemoveLoading(false);
    }
  }

  const isFavorite = favorites ? true : false;

  return (
    <Button
      variant="outline"
      onClick={isFavorite ? onRemoveFavorite : onAddFavorite}
    >
      {addLoading || favoritesLoading || removeLoading ? (
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
