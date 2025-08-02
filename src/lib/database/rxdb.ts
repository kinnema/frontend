import { createRxDatabase, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

import { addRxPlugin } from "rxdb/plugins/core";
import { FavoritedCollection, favoriteSchema } from "./favorites.schema";
import { LastWatchedCollection, lastWatchedSchema } from "./lastWatched.schema";

export type KinnemaCollections = {
  lastWatched: LastWatchedCollection;
  favorite: FavoritedCollection;
};

let db: Promise<RxDatabase<KinnemaCollections>> | null = null;

const collections = {
  lastWatched: {
    schema: lastWatchedSchema,
    migrationStrategies: {},
  },
  favorite: {
    schema: favoriteSchema,
    migrationStrategies: {},
  },
};

async function _create(): Promise<RxDatabase<KinnemaCollections>> {
  if (import.meta.env.DEV) {
    const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode");
    addRxPlugin(RxDBDevModePlugin);
  }
  const { RxDBUpdatePlugin } = await import("rxdb/plugins/update");
  addRxPlugin(RxDBUpdatePlugin);

  const db = await createRxDatabase<KinnemaCollections>({
    name: "kinnema",
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie(),
    }),
  });

  await db.addCollections(collections);

  return db;
}

export function getDb(): Promise<RxDatabase<KinnemaCollections>> {
  if (!db) {
    db = _create();
  }
  return db;
}
