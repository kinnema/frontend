import { createRxDatabase, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

import { addRxPlugin } from "rxdb/plugins/core";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
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
    addRxPlugin(RxDBDevModePlugin);
  }
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
