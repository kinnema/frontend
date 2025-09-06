import { NostrReplicationManager } from "@/lib/database/replication/nostrReplication";
import { KinnemaCollections } from "@/lib/database/rxdb";
import { useCallback, useEffect, useState } from "react";

export function useNostrSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);
  const [replicationManager, setReplicationManager] =
    useState<NostrReplicationManager | null>(null);

  useEffect(() => {
    const manager = new NostrReplicationManager();
    setReplicationManager(manager);

    return () => {
      manager.cleanup();
    };
  }, []);

  const syncToNostr = useCallback(
    async (collectionName: keyof KinnemaCollections) => {
      if (!replicationManager)
        return { total: 0, synced: 0, errors: ["Manager not initialized"] };

      setIsSyncing(true);
      try {
        const result = await replicationManager.syncToNostr(collectionName);
        setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          synced: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        setSyncResults(errorResult);
        return errorResult;
      } finally {
        setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  const syncFromNostr = useCallback(
    async (collectionName: keyof KinnemaCollections) => {
      if (!replicationManager)
        return { total: 0, updated: 0, errors: ["Manager not initialized"] };

      setIsSyncing(true);
      try {
        const result = await replicationManager.syncFromNostr(collectionName);
        setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          updated: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        setSyncResults(errorResult);
        return errorResult;
      } finally {
        setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  const fullSync = useCallback(
    async (collectionName: keyof KinnemaCollections) => {
      if (!replicationManager)
        return {
          push: { total: 0, synced: 0, errors: ["Manager not initialized"] },
          pull: { total: 0, updated: 0, errors: ["Manager not initialized"] },
        };

      setIsSyncing(true);
      try {
        const result = await replicationManager.fullSync(collectionName);
        setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          push: {
            total: 0,
            synced: 0,
            errors: [error instanceof Error ? error.message : "Unknown error"],
          },
          pull: {
            total: 0,
            updated: 0,
            errors: [error instanceof Error ? error.message : "Unknown error"],
          },
        };
        setSyncResults(errorResult);
        return errorResult;
      } finally {
        setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  const deleteFromNostr = useCallback(
    async (collectionName: keyof KinnemaCollections, itemId: string) => {
      if (!replicationManager)
        return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

      setIsSyncing(true);
      try {
        const result = await replicationManager.deleteFromNostr(
          collectionName,
          itemId
        );
        setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          deleted: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        setSyncResults(errorResult);
        return errorResult;
      } finally {
        setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  const deleteMultipleFromNostr = useCallback(
    async (collectionName: keyof KinnemaCollections, itemIds: string[]) => {
      if (!replicationManager)
        return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

      setIsSyncing(true);
      try {
        const result = await replicationManager.deleteMultipleFromNostr(
          collectionName,
          itemIds
        );
        setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          deleted: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        setSyncResults(errorResult);
        return errorResult;
      } finally {
        setIsSyncing(false);
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

      setIsSyncing(true);
      try {
        const result = await replicationManager.syncDeletionsToNostr(
          collectionName,
          deletedItemIds
        );
        setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          deleted: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        setSyncResults(errorResult);
        return errorResult;
      } finally {
        setIsSyncing(false);
      }
    },
    [replicationManager]
  );

  const deleteAllSyncData = useCallback(async () => {
    if (!replicationManager)
      return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

    setIsSyncing(true);
    try {
      const result = await replicationManager.deleteAllSyncData();
      setSyncResults(result);
      return result;
    } catch (error) {
      const errorResult = {
        total: 0,
        deleted: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
      setSyncResults(errorResult);
      return errorResult;
    } finally {
      setIsSyncing(false);
    }
  }, [replicationManager]);

  const deleteAllCollectionData = useCallback(
    async (collectionName: keyof KinnemaCollections) => {
      if (!replicationManager)
        return { total: 0, deleted: 0, errors: ["Manager not initialized"] };

      setIsSyncing(true);
      try {
        const result = await replicationManager.deleteAllCollectionData(
          collectionName
        );
        setSyncResults(result);
        return result;
      } catch (error) {
        const errorResult = {
          total: 0,
          deleted: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        };
        setSyncResults(errorResult);
        return errorResult;
      } finally {
        setIsSyncing(false);
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
    isSyncing,
    syncResults,
    isReady: !!replicationManager,
  };
}
