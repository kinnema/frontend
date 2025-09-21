import { createRxDatabase, RxCollectionCreator, RxDatabase } from "rxdb";
import { addRxPlugin } from "rxdb/plugins/core";
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { FavoritedCollection, favoriteSchema } from "./favorites.schema";
import { LastWatchedCollection, lastWatchedSchema } from "./lastWatched.schema";

export type KinnemaCollections = {
  lastWatched: LastWatchedCollection;
  favorite: FavoritedCollection;
};

let db: Promise<RxDatabase<KinnemaCollections>> | null = null;

const collections: { [key in keyof KinnemaCollections]: RxCollectionCreator } =
  {
    lastWatched: {
      schema: lastWatchedSchema,
      migrationStrategies: {
        1: (oldDoc) => ({
          ...oldDoc,
          syncedAt: null,
        }),
      },
    },
    favorite: {
      schema: favoriteSchema,
      migrationStrategies: {
        1: (oldDoc) => ({
          ...oldDoc,
          syncedAt: null,
        }),
      },
    },
  };

async function _create(): Promise<RxDatabase<KinnemaCollections>> {
  const dexieStorage = getRxStorageDexie();
  let wrapped;
  if (import.meta.env.DEV) {
    const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode");
    addRxPlugin(RxDBDevModePlugin);

    const { wrappedValidateAjvStorage } = await import(
      "rxdb/plugins/validate-ajv"
    );
    wrapped = wrappedValidateAjvStorage({
      storage: dexieStorage,
    });
  }

  addRxPlugin(RxDBMigrationSchemaPlugin);
  addRxPlugin(RxDBUpdatePlugin);
  addRxPlugin(RxDBQueryBuilderPlugin);

  const db = await createRxDatabase<KinnemaCollections>({
    name: "kinnema",
    storage: wrapped || dexieStorage,
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
