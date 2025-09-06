import { useSyncStore } from "@/lib/stores/sync.store";
import {
  SimplePool,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
  verifyEvent,
  type Event,
} from "nostr-tools";
import { KinnemaCollections, getDb } from "../rxdb";

interface SyncResult {
  total: number;
  synced: number;
  errors: string[];
}

interface PullResult {
  total: number;
  updated: number;
  errors: string[];
}

interface DeleteResult {
  total: number;
  deleted: number;
  errors: string[];
}

export class NostrReplicationManager {
  private pool: SimplePool;
  private secretKey: Uint8Array | null = null;
  private publicKey: string | null = null;
  private deviceId: string;
  private isInitialized = false;

  constructor() {
    this.pool = new SimplePool();
    this.deviceId = this.getOrCreateDeviceId();
    this.initializeKeys();
  }

  private fetchRelayUrls(): string[] {
    const stored = useSyncStore.getState().nostrRelayUrls || [];

    return stored.map((r) => r.url);
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem("kinnema-device-id");
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}`;
      localStorage.setItem("kinnema-device-id", deviceId);
    }
    return deviceId;
  }

  private async initializeKeys(): Promise<void> {
    try {
      const stored = localStorage.getItem("nostr-secret-key");
      let sk: Uint8Array;

      if (stored) {
        try {
          sk = nip19.decode(stored).data as Uint8Array;
        } catch {
          sk = generateSecretKey();
          localStorage.setItem("nostr-secret-key", nip19.nsecEncode(sk));
        }
      } else {
        sk = generateSecretKey();
        localStorage.setItem("nostr-secret-key", nip19.nsecEncode(sk));
      }

      this.secretKey = sk;
      this.publicKey = getPublicKey(sk);
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Nostr keys:", error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeKeys();
    }
    if (!this.secretKey || !this.publicKey) {
      throw new Error("Nostr keys not initialized");
    }
  }

  async syncToNostr(
    collectionName: keyof KinnemaCollections
  ): Promise<SyncResult> {
    await this.ensureInitialized();

    const db = await getDb();
    const collection = db[collectionName];
    const docs = await collection.find().exec();

    let successCount = 0;
    const errors: string[] = [];

    for (const doc of docs) {
      try {
        const docData = doc.toJSON();
        const event = finalizeEvent(
          {
            kind: 30001,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
              ["d", `${collectionName}-${doc.primary}`],
              ["t", "kinnema-sync"],
            ],
            content: JSON.stringify({
              id: doc.primary,
              data: docData,
              collection: collectionName,
              syncedAt: Date.now(),
            }),
          },
          this.secretKey!
        );

        if (verifyEvent(event)) {
          const RELAY_URLS = this.fetchRelayUrls();

          const publishPromises = this.pool.publish(RELAY_URLS, event);
          await Promise.allSettled(publishPromises);
          successCount++;
        }
      } catch (error) {
        errors.push(`Failed to sync ${doc.primary}: ${error}`);
      }
    }

    return { total: docs.length, synced: successCount, errors };
  }

  async syncFromNostr(
    collectionName: keyof KinnemaCollections
  ): Promise<PullResult> {
    await this.ensureInitialized();

    const db = await getDb();
    const collection = db[collectionName];

    let updatedCount = 0;
    const errors: string[] = [];
    const RELAY_URLS = this.fetchRelayUrls();
    try {
      const events: Event[] = [];
      const deletionEvents: Event[] = [];

      // Subscribe to both data events and deletion events
      const sub = this.pool.subscribeMany(
        RELAY_URLS,
        [
          {
            kinds: [30001], // Data events
            authors: [this.publicKey!],
            "#t": ["kinnema-sync"],
          },
          {
            kinds: [5], // Deletion events
            authors: [this.publicKey!],
            "#t": ["kinnema-sync"],
          },
        ],
        {
          onevent(event) {
            if (verifyEvent(event)) {
              if (event.kind === 5) {
                deletionEvents.push(event);
              } else {
                events.push(event);
              }
            }
          },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));
      sub.close();

      // Process deletion events first
      for (const deletionEvent of deletionEvents) {
        try {
          const eventIds = deletionEvent.tags
            .filter((tag) => tag[0] === "e")
            .map((tag) => tag[1]);

          // NEW APPROACH: Extract item IDs directly from deletion event content or tags
          const deletedItemIds = new Set<string>();

          // Try to parse the deletion event content for item information
          try {
            const parsed = JSON.parse(deletionEvent.content);
            if (parsed.itemId && parsed.collection === collectionName) {
              deletedItemIds.add(parsed.itemId);
            }
          } catch {
            // If content parsing fails, try to extract from tags
            const collectionTag = deletionEvent.tags.find(
              (tag) => tag[0] === "collection"
            );
            if (collectionTag && collectionTag[1] === collectionName) {
              // Look for item ID in tags
              const itemIdTag = deletionEvent.tags.find(
                (tag) => tag[0] === "item"
              );
              if (itemIdTag && itemIdTag[1]) {
                deletedItemIds.add(itemIdTag[1]);
              }
            }
          }

          // FALLBACK: Try to find referenced events in current events array
          for (const eventId of eventIds) {
            const originalEvent = events.find((e) => e.id === eventId);
            if (originalEvent) {
              try {
                const parsed = JSON.parse(originalEvent.content);
                if (parsed.collection === collectionName && parsed.id) {
                  deletedItemIds.add(parsed.id);
                }
              } catch (parseError) {
                console.warn("Failed to parse deletion target:", parseError);
              }
            }
          }

          // Delete items from local database
          for (const itemId of deletedItemIds) {
            try {
              const doc = await collection.findOne(itemId).exec();
              if (doc) {
                await doc.remove();
                updatedCount++;
              }
            } catch (error) {
              errors.push(`Failed to delete ${itemId}: ${error}`);
            }
          }
        } catch (error) {
          errors.push(`Failed to process deletion event: ${error}`);
        }
      }

      // Filter out events that have been deleted
      const deletedEventIds = new Set(
        deletionEvents.flatMap((event) =>
          event.tags.filter((tag) => tag[0] === "e").map((tag) => tag[1])
        )
      );

      const activeEvents = events.filter(
        (event) => !deletedEventIds.has(event.id)
      );

      // Process remaining active events
      for (const event of activeEvents) {
        try {
          const parsed = JSON.parse(event.content);
          if (parsed.collection === collectionName && parsed.data) {
            await collection.upsert(parsed.data);
            updatedCount++;
          }
        } catch (error) {
          errors.push(`Failed to process event: ${error}`);
        }
      }

      return {
        total: events.length + deletionEvents.length,
        updated: updatedCount,
        errors,
      };
    } catch (error) {
      return { total: 0, updated: 0, errors: [`Fetch failed: ${error}`] };
    }
  }

  async fullSync(collectionName: keyof KinnemaCollections) {
    const pushResult = await this.syncToNostr(collectionName);
    const pullResult = await this.syncFromNostr(collectionName);

    return {
      push: pushResult,
      pull: pullResult,
    };
  }

  /**
   * Delete a specific item from Nostr relays
   * @param collectionName - The collection name
   * @param itemId - The ID of the item to delete
   */
  async deleteFromNostr(
    collectionName: keyof KinnemaCollections,
    itemId: string
  ): Promise<DeleteResult> {
    await this.ensureInitialized();

    try {
      // First, find the existing event to delete
      const eventToDelete = await this.findEventByItemId(
        collectionName,
        itemId
      );

      // Create a deletion event (kind 5) with item metadata
      const deletionEvent = finalizeEvent(
        {
          kind: 5, // Deletion event
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ...(eventToDelete ? [["e", eventToDelete.id]] : []), // Reference to the event being deleted (if found)
            ["t", "kinnema-sync"],
            ["collection", collectionName], // Add collection info
            ["item", itemId], // Add item ID directly
          ],
          content: JSON.stringify({
            action: "delete",
            collection: collectionName,
            itemId: itemId,
            deletedAt: Date.now(),
          }),
        },
        this.secretKey!
      );

      if (verifyEvent(deletionEvent)) {
        const RELAY_URLS = this.fetchRelayUrls();

        const publishPromises = this.pool.publish(RELAY_URLS, deletionEvent);
        await Promise.allSettled(publishPromises);
        return { total: 1, deleted: 1, errors: [] };
      } else {
        return {
          total: 1,
          deleted: 0,
          errors: ["Failed to create valid deletion event"],
        };
      }
    } catch (error) {
      return {
        total: 1,
        deleted: 0,
        errors: [`Failed to delete ${itemId}: ${error}`],
      };
    }
  }

  /**
   * Delete multiple items from Nostr relays
   * @param collectionName - The collection name
   * @param itemIds - Array of item IDs to delete
   */
  async deleteMultipleFromNostr(
    collectionName: keyof KinnemaCollections,
    itemIds: string[]
  ): Promise<DeleteResult> {
    await this.ensureInitialized();

    let successCount = 0;
    const errors: string[] = [];

    for (const itemId of itemIds) {
      try {
        const result = await this.deleteFromNostr(collectionName, itemId);
        if (result.deleted > 0) {
          successCount++;
        } else {
          errors.push(...result.errors);
        }
      } catch (error) {
        errors.push(`Failed to delete ${itemId}: ${error}`);
      }
    }

    return { total: itemIds.length, deleted: successCount, errors };
  }

  /**
   * Find an existing event by item ID
   * @param collectionName - The collection name
   * @param itemId - The item ID to find
   */
  private async findEventByItemId(
    collectionName: keyof KinnemaCollections,
    itemId: string
  ): Promise<Event | null> {
    try {
      const events: Event[] = [];
      const RELAY_URLS = this.fetchRelayUrls();

      const sub = this.pool.subscribeMany(
        RELAY_URLS,
        [
          {
            kinds: [30001], // Replaceable events
            authors: [this.publicKey!],
            "#d": [`${collectionName}-${itemId}`], // Filter by specific item
            "#t": ["kinnema-sync"],
          },
        ],
        {
          onevent(event) {
            if (verifyEvent(event)) {
              events.push(event);
            }
          },
        }
      );

      // Wait for events to be collected
      await new Promise((resolve) => setTimeout(resolve, 2000));
      sub.close();

      // Return the most recent event (highest created_at)
      return events.length > 0
        ? events.reduce((latest, current) =>
            current.created_at > latest.created_at ? current : latest
          )
        : null;
    } catch (error) {
      console.error("Error finding event:", error);
      return null;
    }
  }

  /**
   * Sync deletions from local database to Nostr
   * This should be called when items are deleted locally
   * @param collectionName - The collection name
   * @param deletedItemIds - Array of item IDs that were deleted locally
   */
  async syncDeletionsToNostr(
    collectionName: keyof KinnemaCollections,
    deletedItemIds: string[]
  ): Promise<DeleteResult> {
    if (deletedItemIds.length === 0) {
      return { total: 0, deleted: 0, errors: [] };
    }

    return await this.deleteMultipleFromNostr(collectionName, deletedItemIds);
  }

  async cleanup(): Promise<void> {
    const RELAY_URLS = this.fetchRelayUrls();

    this.pool.close(RELAY_URLS);
  }

  /**
   * Delete all sync data from Nostr relays
   * This creates a deletion event that references all your sync events
   */
  async deleteAllSyncData(): Promise<DeleteResult> {
    await this.ensureInitialized();

    try {
      // First, fetch all your sync events
      const allEvents: Event[] = [];
      const RELAY_URLS = this.fetchRelayUrls();

      const sub = this.pool.subscribeMany(
        RELAY_URLS,
        [
          {
            kinds: [30001], // All your sync events
            authors: [this.publicKey!],
            "#t": ["kinnema-sync"],
          },
        ],
        {
          onevent(event) {
            if (verifyEvent(event)) {
              allEvents.push(event);
            }
          },
        }
      );

      // Wait for all events to be collected
      await new Promise((resolve) => setTimeout(resolve, 5000));
      sub.close();

      if (allEvents.length === 0) {
        return { total: 0, deleted: 0, errors: ["No events found to delete"] };
      }

      // Create a single deletion event that references all events
      const deletionEvent = finalizeEvent(
        {
          kind: 5, // Deletion event
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            // Add all event IDs to be deleted
            ...allEvents.map((event) => ["e", event.id]),
            ["t", "kinnema-sync"],
            ["description", "Delete all Kinnema sync data"],
          ],
          content: `Deleted all Kinnema sync data (${allEvents.length} events)`,
        },
        this.secretKey!
      );

      if (verifyEvent(deletionEvent)) {
        const publishPromises = this.pool.publish(RELAY_URLS, deletionEvent);
        await Promise.allSettled(publishPromises);
        return {
          total: allEvents.length,
          deleted: allEvents.length,
          errors: [],
        };
      } else {
        return {
          total: allEvents.length,
          deleted: 0,
          errors: ["Failed to create valid deletion event"],
        };
      }
    } catch (error) {
      return {
        total: 0,
        deleted: 0,
        errors: [`Failed to delete all data: ${error}`],
      };
    }
  }

  /**
   * Delete all data for a specific collection
   */
  async deleteAllCollectionData(
    collectionName: keyof KinnemaCollections
  ): Promise<DeleteResult> {
    await this.ensureInitialized();

    try {
      const events: Event[] = [];
      const RELAY_URLS = this.fetchRelayUrls();

      const sub = this.pool.subscribeMany(
        RELAY_URLS,
        [
          {
            kinds: [30001],
            authors: [this.publicKey!],
            "#t": ["kinnema-sync"],
          },
        ],
        {
          onevent(event) {
            if (verifyEvent(event)) {
              try {
                const parsed = JSON.parse(event.content);
                if (parsed.collection === collectionName) {
                  events.push(event);
                }
              } catch {
                // Ignore parse errors
              }
            }
          },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));
      sub.close();

      if (events.length === 0) {
        return {
          total: 0,
          deleted: 0,
          errors: [`No ${collectionName} events found`],
        };
      }

      // Create deletion event for all collection events
      const deletionEvent = finalizeEvent(
        {
          kind: 5,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ...events.map((event) => ["e", event.id]),
            ["t", "kinnema-sync"],
            ["collection", collectionName],
          ],
          content: `Deleted all ${collectionName} data (${events.length} events)`,
        },
        this.secretKey!
      );

      if (verifyEvent(deletionEvent)) {
        const publishPromises = this.pool.publish(RELAY_URLS, deletionEvent);
        await Promise.allSettled(publishPromises);
        return { total: events.length, deleted: events.length, errors: [] };
      }

      return {
        total: events.length,
        deleted: 0,
        errors: ["Failed to create deletion event"],
      };
    } catch (error) {
      return {
        total: 0,
        deleted: 0,
        errors: [`Failed to delete collection data: ${error}`],
      };
    }
  }
}
