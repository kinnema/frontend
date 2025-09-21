import { getDb } from "@/lib/database/rxdb";
import { useDeleteNostrEvents } from "@/lib/features/sync/hooks";
import { ILastWatched } from "@/lib/types/lastWatched.type";
import { RxDocument } from "rxdb";

export function useLastWatched() {
  const { deleteNostrEvents } = useDeleteNostrEvents();

  async function getAllLastWatched() {
    const db = await getDb();

    const lastWatchedQuery = db.lastWatched?.find();

    return lastWatchedQuery?.exec();
  }

  async function getAllLastWatched$() {
    const db = await getDb();

    const lastWatchedQuery = db.lastWatched?.find().where({
      isWatched: false,
    }).$;

    return lastWatchedQuery;
  }
  async function getSingleLastWatched(tmdbId: number) {
    const db = await getDb();

    const lastWatchedQuery = db.lastWatched?.findOne({
      index: "tmdbId",
      selector: {
        tmdbId: tmdbId,
      },
    });

    const lastWatched = await lastWatchedQuery?.exec();

    return lastWatched;
  }

  async function getSingleLastWatchedWithDetails(
    tmdbId: number,
    seasonNumber: number,
    episodeNumber: number
  ) {
    const db = await getDb();

    const lastWatchedQuery = db.lastWatched?.findOne({
      index: "tmdbId",
      selector: {
        tmdbId: tmdbId,
        season_number: seasonNumber,
        episode_number: episodeNumber,
      },
    });

    const lastWatched = await lastWatchedQuery?.exec();

    return lastWatched;
  }

  async function updateLastWatched(
    tmdbId: number,
    data: Partial<ILastWatched>,
    seasonNumber: number,
    episodeNumber: number,
    doc?: RxDocument<ILastWatched>
  ) {
    const lastWatched =
      doc ??
      (await getSingleLastWatchedWithDetails(
        tmdbId,
        seasonNumber,
        episodeNumber
      ));

    if (lastWatched) {
      await lastWatched.update({
        $set: data,
      });
    }
  }

  async function addLastWatched(data: ILastWatched) {
    const db = await getDb();

    await db.lastWatched?.insert(data);
  }

  async function removeLastWatched(
    tmdbId: number,
    id: string,
    seasonNumber: number,
    episodeNumber: number
  ) {
    await deleteNostrEvents(id);

    const doc = await getSingleLastWatchedWithDetails(
      tmdbId,
      seasonNumber,
      episodeNumber
    );

    await doc?.remove();
  }

  return {
    getSingleLastWatched,
    updateLastWatched,
    addLastWatched,
    getAllLastWatched,
    getAllLastWatched$,
    removeLastWatched,
    getSingleLastWatchedWithDetails,
  };
}
