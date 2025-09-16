import { createRxDatabase, RxCollectionCreator, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

import { addRxPlugin } from "rxdb/plugins/core";
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { SyncObservables } from "../observables/sync.observable";
import { useExperimentalStore } from "../stores/experimental.store";
import { ExperimentalFeature } from "../types/experiementalFeatures";
import { FavoritedCollection, favoriteSchema } from "./favorites.schema";
import { LastWatchedCollection, lastWatchedSchema } from "./lastWatched.schema";
import { rxdbReplicationFactory } from "./replication/replicationFactory";

export type KinnemaCollections = {
  lastWatched: LastWatchedCollection;
  favorite: FavoritedCollection;
};

let db: Promise<RxDatabase<KinnemaCollections>> | null = null;

const collections: { [key in keyof KinnemaCollections]: RxCollectionCreator } =
  {
    lastWatched: {
      schema: lastWatchedSchema,
    },
    favorite: {
      schema: favoriteSchema,
    },
  };

async function _create(): Promise<RxDatabase<KinnemaCollections>> {
  if (import.meta.env.DEV) {
    const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode");
    addRxPlugin(RxDBDevModePlugin);
  }

  addRxPlugin(RxDBMigrationSchemaPlugin);
  addRxPlugin(RxDBUpdatePlugin);
  addRxPlugin(RxDBQueryBuilderPlugin);

  const db = await createRxDatabase<KinnemaCollections>({
    name: "kinnema",
    storage: getRxStorageDexie(),
  });

  await db.addCollections(collections);

  const isEnabled = SyncObservables.isEnabled$;
  const hasSyncFeatureEnabled = useExperimentalStore
    .getState()
    .isFeatureEnabled(ExperimentalFeature.Sync);

  isEnabled.subscribe(async (isEnabled) => {
    if (!hasSyncFeatureEnabled) return;

    if (isEnabled) {
      await rxdbReplicationFactory.initialize();
      console.log("Sync is enabled");
    } else {
      rxdbReplicationFactory.disable();
      console.log("Sync is disabled");
    }
  });

  return db;
}

export function getDb(): Promise<RxDatabase<KinnemaCollections>> {
  if (!db) {
    db = _create();
  }
  return db;
}
