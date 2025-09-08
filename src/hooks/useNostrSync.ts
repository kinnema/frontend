import { KinnemaCollections } from "@/lib/database/rxdb";
import { syncProviderContext } from "@/lib/providers/syncProvider";
import { SyncService } from "@/lib/services/sync.service";
import { useCallback, useContext, useEffect, useRef } from "react";

export function useNostrSync() {
  const worker = useContext(syncProviderContext);
  const replicationManager = useRef<SyncService>(new SyncService());

  useEffect(() => {
    return () => {
      replicationManager.current.cleanup();
    };
  }, []);

  const syncToNostr = useCallback(() => {
    worker.postMessage({ action: "sync", data: null });
  }, []);

  const syncFromNostr = useCallback(async () => {
    worker.postMessage({ action: "sync", data: null });
  }, []);

  const fullSync = useCallback(async () => {
    worker.postMessage({ action: "sync", data: null });
  }, []);

  const deleteFromNostr = useCallback(
    async (collectionName: keyof KinnemaCollections, itemId: string) => {
      if (!replicationManager)
        return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

      // setIsSyncing(true);
      try {
        const result = await replicationManager.current?.deleteFromNostr(
          collectionName,
          itemId
        );
        // setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          deleted: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        // setSyncResults(errorResult);
        return errorResult;
      } finally {
        // setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  const deleteMultipleFromNostr = useCallback(
    async (collectionName: keyof KinnemaCollections, itemIds: string[]) => {
      if (!replicationManager)
        return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

      // setIsSyncing(true);
      try {
        const result =
          await replicationManager.current?.deleteMultipleFromNostr(
            collectionName,
            itemIds
          );
        // setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          deleted: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        // setSyncResults(errorResult);
        return errorResult;
      } finally {
        // setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  const syncDeletionsToNostr = useCallback(
    async (
      collectionName: keyof KinnemaCollections,
      deletedItemIds: string[]
    ) => {
      if (!replicationManager)
        return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

      // setIsSyncing(true);
      try {
        const result = await replicationManager.current?.syncDeletionsToNostr(
          collectionName,
          deletedItemIds
        );
        // setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          deleted: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        // setSyncResults(errorResult);
        return errorResult;
      } finally {
        // setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  const deleteAllSyncData = useCallback(async () => {
    if (!replicationManager)
      return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

    // setIsSyncing(true);
    try {
      const result = await replicationManager.current?.deleteAllSyncData();
      // setSyncResults(result);
      return result;
    } catch (error) {
      const errorResult = {
        total: 0,
        deleted: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
      // setSyncResults(errorResult);
      return errorResult;
    } finally {
      // setIsSyncing(false);
    }
  }, [replicationManager]);

  const deleteAllCollectionData = useCallback(
    async (collectionName: keyof KinnemaCollections) => {
      if (!replicationManager)
        return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

      // setIsSyncing(true);
      try {
        const result =
          await replicationManager.current?.deleteAllCollectionData(
            collectionName
          );
        // setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          deleted: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        // setSyncResults(errorResult);
        return errorResult;
      } finally {
        // setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  return {
    syncToNostr,
    syncFromNostr,
    fullSync,
    deleteFromNostr,
    deleteMultipleFromNostr,
    syncDeletionsToNostr,
    deleteAllSyncData, // New: Delete all sync data
    deleteAllCollectionData, // New: Delete all data for specific collection
    isReady: !!replicationManager,
  };
}
