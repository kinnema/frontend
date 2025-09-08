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

interface NostrConfig {
  secretKey?: string;
  relayUrls?: string[];
}

export class NostrReplicationManager {
  private pool: SimplePool;
  private secretKey: Uint8Array | null = null;
  private publicKey: string | null = null;
  private isInitialized = false;
  private relayUrls: string[] = [];

  constructor(config?: NostrConfig) {
    this.pool = new SimplePool();
    if (config?.relayUrls) {
      this.relayUrls = this.validateRelayUrls(config.relayUrls);
    }
    this.initializeKeys(config?.secretKey);
  }

  private validateRelayUrls(urls: string[]): string[] {
    return urls.filter((url) => {
      if (!url || typeof url !== 'string') {
        return false;
      }
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "ws:" || parsedUrl.protocol === "wss:";
      } catch {
        console.warn(`Invalid relay URL: ${url}`);
        return false;
      }
    });
  }

  private fetchRelayUrls(): string[] {
    return this.relayUrls;
  }

  public setRelayUrls(urls: string[]): void {
    this.relayUrls = this.validateRelayUrls(urls);
  }

  public setSecretKey(secretKey: string): void {
    try {
      const decoded = nip19.decode(secretKey);
      if (decoded.type === "nsec" && decoded.data instanceof Uint8Array) {
        this.secretKey = decoded.data;
        this.publicKey = getPublicKey(this.secretKey);
        this.isInitialized = true;
      } else {
        throw new Error("Invalid Nostr secret key format");
      }
    } catch (error) {
      console.error("Error setting secret key:", error);
      throw new Error(`Failed to set Nostr secret key: ${error}`);
    }
  }

  private initializeKeys(providedSecretKey?: string): void {
    try {
      let sk: Uint8Array;

      if (providedSecretKey && typeof providedSecretKey === 'string') {
        try {
          const decoded = nip19.decode(providedSecretKey);
          if (decoded.type === "nsec" && decoded.data instanceof Uint8Array) {
            sk = decoded.data;
          } else {
            throw new Error("Invalid Nostr secret key format");
          }
        } catch (decodeError) {
          console.warn("Failed to decode provided secret key, generating new one:", decodeError);
          sk = generateSecretKey();
        }
      } else {
        sk = generateSecretKey();
      }

      this.secretKey = sk;
      this.publicKey = getPublicKey(sk);
      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing Nostr keys:", error);
      throw new Error(`Failed to initialize Nostr keys: ${error}`);
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.secretKey || !this.publicKey) {
      throw new Error("Nostr keys not initialized");
    }
  }

  public getPublicKey(): string | null {
    return this.publicKey;
  }

  public getSecretKeyEncoded(): string | null {
    if (!this.secretKey) return null;
    return nip19.nsecEncode(this.secretKey);
  }

  async syncToNostr(
    collectionName: keyof KinnemaCollections
  ): Promise<SyncResult> {
    this.ensureInitialized();

    const RELAY_URLS = this.fetchRelayUrls();
    if (RELAY_URLS.length === 0) {
      return {
        total: 0,
        synced: 0,
        errors: ["No valid relay URLs configured"],
      };
    }

    const db = await getDb();
    const collection = db[collectionName];
    const docs = await collection.find().exec();
    console.log(
      `🔄 Syncing ${docs.length} items from ${collectionName} to Nostr...`
    );

    // Log sample document structure for debugging
    if (docs.length > 0 && docs[0]) {
      console.log(`📄 Sample ${collectionName} document:`, docs[0].toJSON());
    }

    if (docs.length === 0) {
      console.log(`⚠️ No documents found in ${collectionName} collection`);
      return {
        total: 0,
        synced: 0,
        errors: [`No documents found in ${collectionName} collection`],
      };
    }

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
              ["d", `${collectionName}-${doc.id}`],
              ["t", "kinnema-sync"],
            ],
            content: JSON.stringify({
              id: doc.id,
              data: docData,
              collection: collectionName,
              syncedAt: Date.now(),
            }),
          },
          this.secretKey!
        );

        if (verifyEvent(event)) {
          try {
            const publishPromises = this.pool.publish(RELAY_URLS, event);
            const results = await Promise.allSettled(publishPromises);

            // Check if any relay succeeded
            const hasSuccess = results.some(
              (result) => result.status === "fulfilled" && result.value
            );

            if (hasSuccess) {
              successCount++;
            } else {
              errors.push(`Failed to publish event for ${doc.id} to any relay`);
            }
          } catch (publishError) {
            errors.push(`Network error publishing ${doc.id}: ${publishError}`);
          }
        } else {
          errors.push(`Failed to verify event for ${doc.id}`);
        }
      } catch (error) {
        errors.push(`Failed to sync ${doc.id}: ${error}`);
      }
    }

    return { total: docs.length, synced: successCount, errors };
  }

  async syncFromNostr(
    collectionName: keyof KinnemaCollections
  ): Promise<PullResult> {
    this.ensureInitialized();

    const RELAY_URLS = this.fetchRelayUrls();
    if (RELAY_URLS.length === 0) {
      return {
        total: 0,
        updated: 0,
        errors: ["No valid relay URLs configured"],
      };
    }

    const db = await getDb();
    const collection = db[collectionName];

    let updatedCount = 0;
    const errors: string[] = [];

    console.log(`🔄 Syncing ${collectionName} from Nostr relays:`, RELAY_URLS);
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
                console.log(`🗑️ Added deletion event`);
              } else {
                console.log("qweqweqweqwe", event);
                events.push(event);
                console.log(`📄 Added data event`);
              }
            } else {
              console.log(`❌ Event verification failed`);
            }
          },
        }
      );

      // Wait for events to be collected with timeout
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          sub.close();
          resolve(void 0);
        }, 5000); // Increased timeout for better reliability

        // Close subscription after timeout
        setTimeout(() => {
          clearTimeout(timeout);
          sub.close();
          resolve(void 0);
        }, 5000);
      });

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
          for (const itemId of Array.from(deletedItemIds)) {
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
      console.log(
        `📥 Processing ${activeEvents.length} active events for ${collectionName}`
      );
      for (const event of activeEvents) {
        try {
          const parsed = JSON.parse(event.content);
          console.log(
            `📄 Processing event for collection: ${parsed.collection}, item: ${parsed.id}`
          );
          if (parsed.collection === collectionName && parsed.data) {
            await collection.upsert(parsed.data);
            updatedCount++;
            console.log(`✅ Upserted item ${parsed.id} in ${collectionName}`);
          } else {
            console.log(`⏭️ Skipping event - collection mismatch or no data`);
          }
        } catch (error) {
          console.error(`❌ Failed to process event:`, error);
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
    this.ensureInitialized();

    try {
      // First, find the existing event to delete
      const eventToDelete = await this.findEventByItemId(
        collectionName,
        itemId
      );

      if (!eventToDelete) {
        // If no event found, we can't delete what doesn't exist
        return {
          total: 1,
          deleted: 0,
          errors: [
            `No event found for item ${itemId} in collection ${collectionName}`,
          ],
        };
      }

      // Create a deletion event (kind 5) with item metadata
      const deletionEvent = finalizeEvent(
        {
          kind: 5, // Deletion event
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["e", eventToDelete.id], // Reference to the event being deleted
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
    this.ensureInitialized();

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
    try {
      const RELAY_URLS = this.fetchRelayUrls();
      if (RELAY_URLS.length > 0) {
        await this.pool.close(RELAY_URLS);
      }
    } catch (error) {
      console.warn("Error during pool cleanup:", error);
      // Don't throw - cleanup should be graceful
    }
  }

  /**
   * Delete all sync data from Nostr relays
   * This creates a deletion event that references all your sync events
   */
  async deleteAllSyncData(): Promise<DeleteResult> {
    this.ensureInitialized();

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
    this.ensureInitialized();

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
