import { getDb } from "@/lib/database/rxdb";
import { useDeleteNostrEvents } from "@/lib/features/sync/hooks";
import { IAddFavorite } from "@/lib/types/favorite.type";
import { QUERY_KEYS } from "@/lib/utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

export function useFavorites(tmdbId?: number) {
  const { deleteNostrEvents } = useDeleteNostrEvents();

  const queryClient = useQueryClient();

  async function getAllFavorites() {
    const db = await getDb();

    const query = db.favorite.find();

    return query.exec();
  }

  async function addFavorite(payload: IAddFavorite) {
    const db = await getDb();

    const query = await db.favorite.insert(payload);

    await queryClient.invalidateQueries({
      queryKey: [...QUERY_KEYS.Favorites, tmdbId],
    });
  }

  async function getFavorite(id: string) {
    const db = await getDb();

    const query = db.favorite.findOne({
      index: "id",
      selector: {
        id: id,
      },
    });

    return query.exec();
  }
  async function getFavoriteByTmdb(id: number) {
    const db = await getDb();

    const query = db.favorite.findOne({
      index: "tmdbId",
      selector: {
        tmdbId: id,
      },
    });

    return query.exec();
  }

  async function removeFavorite(payload: string) {
    await deleteNostrEvents(payload);
    const data = await getFavorite(payload);

    await data?.remove();

    await queryClient.invalidateQueries({
      queryKey: [...QUERY_KEYS.Favorites, tmdbId],
    });
  }

  return {
    getAllFavorites,
    addFavorite,
    getFavorite,
    removeFavorite,
    getFavoriteByTmdb,
  };
}
