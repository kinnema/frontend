import { useToast } from "@/hooks/use-toast";
import { useNostrSync } from "@/hooks/useNostrSync";
import { KinnemaCollections } from "@/lib/database/rxdb";
import { useSyncStore } from "@/lib/stores/sync.store";
import { useCallback } from "react";

/**
 * Hook to handle synced deletions
 * This ensures that when items are deleted locally, they're also deleted from Nostr
 */
export function useSyncedDeletion() {
  const { deleteFromNostr, deleteMultipleFromNostr, syncDeletionsToNostr } =
    useNostrSync();
  const isNostrEnabled = useSyncStore((state) => state.isNostrEnabled);
  const nostrConnectionStatus = useSyncStore(
    (state) => state.nostrConnectionStatus
  );
  const { toast } = useToast();

  const isNostrAvailable =
    isNostrEnabled && nostrConnectionStatus === "connected";

  /**
   * Delete a single item and sync to Nostr if enabled
   */
  const deleteSyncedItem = useCallback(
    async (
      collectionName: keyof KinnemaCollections,
      itemId: string,
      deleteFromLocal: () => Promise<void>
    ) => {
      try {
        // First delete from local database
        await deleteFromLocal();

        // Then delete from Nostr if enabled
        if (isNostrAvailable) {
          const result = await deleteFromNostr(collectionName, itemId);

          if (result.errors.length > 0) {
            console.warn(
              `Failed to delete ${itemId} from Nostr:`,
              result.errors
            );
            toast({
              title: "Sync Warning",
              description: `Item deleted locally but failed to sync deletion to Nostr`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Item Deleted",
              description: "Item deleted and synced across all devices",
            });
          }
        } else {
          toast({
            title: "Item Deleted",
            description: "Item deleted locally",
          });
        }
      } catch (error) {
        console.error(`Failed to delete item ${itemId}:`, error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete item",
          variant: "destructive",
        });
        throw error;
      }
    },
    [deleteFromNostr, isNostrAvailable, toast]
  );

  /**
   * Delete multiple items and sync to Nostr if enabled
   */
  const deleteSyncedItems = useCallback(
    async (
      collectionName: keyof KinnemaCollections,
      itemIds: string[],
      deleteFromLocal: () => Promise<void>
    ) => {
      try {
        // First delete from local database
        await deleteFromLocal();

        // Then delete from Nostr if enabled
        if (isNostrAvailable) {
          const result = await deleteMultipleFromNostr(collectionName, itemIds);

          if (result.errors.length > 0) {
            console.warn(
              `Failed to delete some items from Nostr:`,
              result.errors
            );
            toast({
              title: "Sync Warning",
              description: `${result.deleted}/${result.total} items synced to Nostr`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Items Deleted",
              description: `${itemIds.length} items deleted and synced across all devices`,
            });
          }
        } else {
          toast({
            title: "Items Deleted",
            description: `${itemIds.length} items deleted locally`,
          });
        }
      } catch (error) {
        console.error(`Failed to delete items:`, error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete items",
          variant: "destructive",
        });
        throw error;
      }
    },
    [deleteMultipleFromNostr, isNostrAvailable, toast]
  );

  /**
   * Sync previously deleted items to Nostr
   * Useful for syncing deletions that happened while offline
   */
  const syncPendingDeletions = useCallback(
    async (
      collectionName: keyof KinnemaCollections,
      deletedItemIds: string[]
    ) => {
      if (!isNostrAvailable || deletedItemIds.length === 0) {
        return;
      }

      try {
        const result = await syncDeletionsToNostr(
          collectionName,
          deletedItemIds
        );

        if (result.errors.length > 0) {
          console.warn(`Failed to sync some deletions:`, result.errors);
          toast({
            title: "Sync Warning",
            description: `${result.deleted}/${result.total} deletions synced to Nostr`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Deletions Synced",
            description: `${result.deleted} deletions synced to Nostr`,
          });
        }
      } catch (error) {
        console.error(`Failed to sync deletions:`, error);
        toast({
          title: "Sync Failed",
          description: "Failed to sync deletions to Nostr",
          variant: "destructive",
        });
      }
    },
    [syncDeletionsToNostr, isNostrAvailable, toast]
  );

  return {
    deleteSyncedItem,
    deleteSyncedItems,
    syncPendingDeletions,
    isNostrAvailable,
  };
}
