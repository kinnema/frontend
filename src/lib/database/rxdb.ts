import { createRxDatabase, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

import { addRxPlugin } from "rxdb/plugins/core";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { LastWatchedCollection, lastWatchedSchema } from "./lastWatched.schema";
export type KinnemaCollections = {
  lastWatched: LastWatchedCollection;
};

export let db: RxDatabase<KinnemaCollections>;

export async function initDatabase() {
  if (import.meta.env.DEV) {
    addRxPlugin(RxDBDevModePlugin);
  }
  addRxPlugin(RxDBUpdatePlugin);

  db = await createRxDatabase<KinnemaCollections>({
    name: "kinnema",
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie(),
    }),
  });

  await db.addCollections({
    lastWatched: {
      schema: lastWatchedSchema,
    },
  });

  return db;
}
