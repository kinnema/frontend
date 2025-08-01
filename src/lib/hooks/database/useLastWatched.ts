import { db } from "@/lib/database/rxdb";
import { ILastWatched } from "@/lib/types/lastWatched.type";
import { RxDocument } from "rxdb";

export function useLastWatched() {
  async function getAllLastWatched() {
    const lastWatchedQuery = db.lastWatched?.find();

    return lastWatchedQuery?.exec();
  }
  function getAllLastWatched$() {
    const lastWatchedQuery = db.lastWatched?.find().$;

    return lastWatchedQuery;
  }
  async function getSingleLastWatched(tmdbId: number) {
    const lastWatchedQuery = db.lastWatched?.findOne({
      index: "tmdbId",
      selector: {
        tmdbId: tmdbId,
      },
    });

    const lastWatched = await lastWatchedQuery?.exec();

    return lastWatched;
  }

  async function updateLastWatched(
    tmdbId: number,
    data: Partial<ILastWatched>,
    doc?: RxDocument<ILastWatched>
  ) {
    const lastWatched = doc ?? (await getSingleLastWatched(tmdbId));

    if (lastWatched) {
      await lastWatched.update({
        $set: data,
      });
    }
  }

  async function addLastWatched(data: ILastWatched) {
    await db.lastWatched?.insert(data);
  }

  async function removeLastWatched(id: number) {
    const doc = await getSingleLastWatched(id);

    await doc?.remove();
  }

  return {
    getSingleLastWatched,
    updateLastWatched,
    addLastWatched,
    getAllLastWatched,
    getAllLastWatched$,
    removeLastWatched,
  };
}
