import { Filter, SimplePool, finalizeEvent, verifyEvent } from "nostr-tools";
import { ConnectionStatus, NostrWorkerMessage } from "../types";
import { getEventId } from "./events/core";
import { deletePluginFromNostr, syncPlugins } from "./events/nostr/plugins";

let pool: SimplePool;
let privateKey: Uint8Array;
let publicKey: string;
let relayUrls: string[] = [];
let isInitialized = false;

self.onmessage = async (event: MessageEvent<NostrWorkerMessage>) => {
  const message = event.data as NostrWorkerMessage;
  const { type, payload } = message;

  console.log(`Nostr Worker: Received message type: ${type}`, payload);

  try {
    switch (type) {
      case "init":
        await handleInit(payload);
        break;
      case "delete":
        const p = payload as { type: "plugin" | "document"; id: string };
        switch (p.type) {
          case "plugin":
            await deletePluginFromNostr(p.id, {
              isInitialized,
              pool,
              publicKey,
              relays: relayUrls,
              privateKey,
            });
            break;
          case "document":
            await removeFromNostr(p.id);
            break;
          default:
            console.warn("Unknown delete type:", p.type);
        }
        break;

      case "sync-plugins":
        await syncPlugins(payload, {
          isInitialized,
          pool,
          publicKey,
          relays: relayUrls,
          privateKey,
        });
        break;

      case "sync":
        if (!isInitialized) {
          console.error(
            "Nostr Worker: Sync called before initialization complete"
          );
          self.postMessage({
            type: "error",
            payload: { error: "Worker not initialized" },
          });
          return;
        }
        await handleSync(payload);
        break;
      default:
        console.warn("Unknown message type:", type);
    }
  } catch (error) {
    console.error("Nostr Worker: Error processing message:", error);
    self.postMessage({
      type: "error",
      payload: { error: error?.toString() },
    });
  }
};

async function handleInit(payload: any) {
  console.log("Nostr Worker: Starting initialization...", payload);

  const { privateKeyHex, relays, publicKeyHex } = payload;

  try {
    privateKey = new Uint8Array(
      privateKeyHex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
    );
    publicKey = publicKeyHex;
    relayUrls = relays.map((r: any) => r.url);
    pool = new SimplePool();

    console.log("Nostr Worker: Pool created, testing connections...");
    self.postMessage({
      type: "status",
      payload: { status: ConnectionStatus.CONNECTING },
    });

    await testConnections();
    isInitialized = true;

    console.log("Nostr Worker: Initialization complete");
    self.postMessage({
      type: "status",
      payload: { status: ConnectionStatus.CONNECTED },
    });
  } catch (error) {
    console.error("Nostr Worker: Initialization failed:", error);
    self.postMessage({
      type: "error",
      payload: { error: `Initialization failed: ${error}` },
    });
  }
}

async function testConnections() {
  console.log(
    `Nostr Worker: Testing connections to ${relayUrls.length} relays...`
  );

  for (const url of relayUrls) {
    self.postMessage({
      type: "relay-status",
      payload: { relay: url, status: ConnectionStatus.CONNECTING },
    });

    try {
      console.log(`Nostr Worker: Testing connection to ${url}`);
      const sub = pool.subscribeMany([url], [{ kinds: [1], limit: 1 }], {
        oneose() {
          console.log(`Nostr Worker: Connection test success for ${url}`);
          self.postMessage({
            type: "relay-status",
            payload: { relay: url, status: ConnectionStatus.CONNECTED },
          });
          sub.close();
        },

        onclose(reason) {
          if (reason[0] !== "closed by caller") {
            console.warn(
              `Nostr Worker: Connection test failed for ${url}:`,
              reason
            );
            self.postMessage({
              type: "relay-status",
              payload: { relay: url, status: ConnectionStatus.ERROR },
            });
          }
          console.log(
            `Nostr Worker: Test subscription closed for ${url}:`,
            reason
          );
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.warn("Nostr Worker: Connection test failed for:", url, error);
    }
  }

  console.log("Nostr Worker: Connection tests completed");
}

async function handleSync(payload: any) {
  if (!isInitialized) {
    throw new Error("Worker not initialized");
  }

  const startTime = Date.now();
  console.log(`Sync started at ${new Date(startTime).toISOString()}`);

  const { collection, documents } = payload;

  self.postMessage({
    type: "sync-start",
  });

  const mergeStart = Date.now();
  const mergedDeletedIds = await mergeDeletedDocuments();
  console.log(`mergeDeletedDocuments took ${Date.now() - mergeStart}ms`);

  console.log(
    `Syncing collection ${collection}: ${documents.length} total, ${mergedDeletedIds.length} deleted`
  );

  const fetchStart = Date.now();
  const remoteData = await fetchFromNostr(collection);
  console.log(`fetchFromNostr took ${Date.now() - fetchStart}ms`);
  console.log(
    `Fetched ${remoteData.length} remote documents for ${collection}`
  );
  console.log("Remote data:", remoteData, mergedDeletedIds);
  const filteredRemoteData = remoteData.filter(
    (doc: any) => !mergedDeletedIds.includes(doc.data.id)
  );

  const publishStart = Date.now();
  const publishResults = await publishToNostr(collection, documents);
  console.log(`publishToNostr took ${Date.now() - publishStart}ms`);

  self.postMessage({
    type: "sync-complete",
    payload: { collection },
  });

  self.postMessage({
    type: "result",
    payload: {
      collection,
      published: publishResults.filter((r) => r.success).length,
      fetched: filteredRemoteData.length,
      publishResults,
      remoteData: filteredRemoteData,
      total: documents.length,
    },
  });

  const totalTime = Date.now() - startTime;
  console.log(`Total sync time: ${totalTime}ms`);
}

async function fetchFromNostr(collection: string): Promise<any[]> {
  try {
    const filter: Filter[] = [
      {
        kinds: [30001],
        "#t": ["kinnema-sync"],
        authors: [publicKey],
      },
    ];

    console.log(`Fetching from Nostr relays for collection: ${collection}`);
    console.log("Filter:", filter);
    console.log("Relay URLs:", relayUrls);

    const documents: any[] = [];
    let eventCount = 0;
    let eoseCount = 0;

    return new Promise((resolve) => {
      const sub = pool.subscribeMany(relayUrls, filter, {
        onevent(event) {
          eventCount++;
          console.log(`Received event ${eventCount} from Nostr:`, {
            id: event.id,
            kind: event.kind,
            created_at: event.created_at,
            tags: event.tags,
          });
          if (documents.length % 10 === 0) {
            self.postMessage({
              type: "partial-sync",
              payload: { collection, documents: [...documents] },
            });
          }
          try {
            if (verifyEvent(event)) {
              const content = JSON.parse(event.content);

              // Filter by collection on client side
              if (content.collection === collection) {
                documents.push({
                  data: content.data,
                  nostrEventId: event.id,
                  nostrCreatedAt: event.created_at,
                });
                console.log(
                  `Parsed and added document from event ${event.id} for collection ${collection}`
                );
              } else {
                console.log(
                  `Skipping event ${event.id} - wrong collection: ${content.collection} !== ${collection}`
                );
              }
            } else {
              console.warn("Event verification failed for event:", event.id);
            }
          } catch (error) {
            console.warn("Failed to parse Nostr event content:", error);
          }
        },
        oneose() {
          eoseCount++;
          console.log(
            `EOSE received (${eoseCount}), total events: ${eventCount}, documents: ${documents.length}`
          );

          if (eoseCount >= relayUrls.length) {
            console.log("All relays sent EOSE, closing subscription");
            sub.close();
            resolve(documents);
          }
        },
        onclose(reason) {
          console.log("Subscription closed:", reason);
        },
      });

      setTimeout(() => {
        console.log(
          `Timeout reached: events=${eventCount}, documents=${documents.length}, eose=${eoseCount}`
        );
        sub.close();
        resolve(documents);
      }, 5000);
    });
  } catch (error) {
    console.error("Failed to fetch from Nostr:", error);
    return [];
  }
}

async function fetchDeletedDocuments(): Promise<string[]> {
  try {
    const filter: Filter[] = [
      {
        kinds: [5],
        "#t": ["kinnema-sync"],
        authors: [publicKey],
        limit: 100,
      },
    ];

    console.log("Fetching deleted documents from Nostr");
    console.log("Filter:", filter);
    console.log("Relay URLs:", relayUrls);

    const deletedIds: string[] = [];
    let eventCount = 0;
    let eoseCount = 0;

    return new Promise((resolve) => {
      const sub = pool.subscribeMany(relayUrls, filter, {
        onevent(event) {
          eventCount++;
          console.log(`Received deletion event ${eventCount} from Nostr:`, {
            id: event.id,
            kind: event.kind,
            created_at: event.created_at,
            tags: event.tags,
          });

          const tTags = event.tags.filter((tag) => tag[0] === "t");
          tTags.forEach((tag) => {
            if (tag[1] && tag[1] !== "kinnema-sync") {
              deletedIds.push(tag[1]);
              console.log("qqq", event);
              console.log(
                `Parsed deleted document ID from event ${event.id}: ${tag[1]}`
              );
            }
          });
        },
        oneose() {
          eoseCount++;
          console.log(
            `EOSE received (${eoseCount}), total events: ${eventCount}, deleted IDs: ${deletedIds.length}`
          );

          if (eoseCount >= relayUrls.length) {
            console.log("All relays sent EOSE, closing subscription");
            sub.close();
            resolve(deletedIds);
          }
        },
        onclose(reason) {
          console.log("Subscription closed:", reason);
        },
      });

      // Fallback timeout in case EOSE doesn't work properly
      setTimeout(() => {
        console.log(
          `Timeout reached: events=${eventCount}, deleted IDs=${deletedIds.length}, eose=${eoseCount}`
        );
        sub.close();
        resolve(deletedIds);
      }, 10000);
    });
  } catch (error) {
    console.error("Failed to fetch deleted documents from Nostr:", error);
    return [];
  }
}

async function mergeDeletedDocuments(): Promise<string[]> {
  const remoteDeletedIds = await fetchDeletedDocuments();
  console.log(
    `Merged deleted document IDs, total unique deletions: ${remoteDeletedIds}`
  );

  self.postMessage({
    type: "merged-deletions",
    payload: { deletedIds: remoteDeletedIds },
  });

  return remoteDeletedIds;
}

async function publishDeletionEvent(documentId: string) {
  try {
    const event = finalizeEvent(
      {
        kind: 5,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["t", "kinnema-sync"],
          ["t", documentId],
          ["p", publicKey],
        ],
        content: "Deletion of document " + documentId,
      },
      privateKey
    );

    const publishPromises = pool.publish(relayUrls, event);
    const publishResults = await Promise.allSettled(publishPromises);

    const success = publishResults.some(
      (r) => r.status === "fulfilled" && r.value
    );
    return {
      id: documentId,
      success,
      error: success ? null : "Failed to publish deletion to any relay",
    };
  } catch (error) {
    return {
      id: documentId,
      success: false,
      error: error?.toString(),
    };
  }
}

async function removeFromNostr(documentId: string) {
  const eventId = await getEventId(documentId, {
    isInitialized,
    publicKey,
    relays: relayUrls,
    pool,
    privateKey,
  });
  const results = [];

  self.postMessage({
    type: "sync-start",
  });

  if (!eventId) {
    console.log(
      `No existing deletion event found for documentId ${documentId}, proceeding to create one.`
    );
    return await publishDeletionEvent(documentId);
  }

  try {
    const event = finalizeEvent(
      {
        kind: 5,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["e", eventId],
          ["t", "kinnema-sync"],
          ["t", documentId],
          ["p", publicKey],
        ],
        content: "Deletion of document " + documentId,
      },
      privateKey
    );

    const publishPromises = pool.publish(relayUrls, event);
    const publishResults = await Promise.allSettled(publishPromises);

    const success = publishResults.some(
      (r) => r.status === "fulfilled" && r.value
    );
    results.push({
      id: documentId,
      success,
      error: success ? null : "Failed to publish deletion to any relay",
    });
  } catch (error) {
    results.push({
      id: documentId,
      success: false,
      error: error?.toString(),
    });
  }
  self.postMessage({
    type: "sync-complete",
  });

  return results;
}

async function publishToNostr(collection: string, documents: any[]) {
  const results = [];
  const concurrencyLimit = 5;

  const processDocument = async (doc: any) => {
    try {
      const event = finalizeEvent(
        {
          kind: 30001,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["d", `${collection}-${doc.id}`],
            ["t", "kinnema-sync"],
            ["t", doc.id],
            ["p", publicKey],
            ["collection", collection],
          ],
          content: JSON.stringify({
            id: doc.id,
            data: doc,
            collection,
            syncedAt: Date.now(),
          }),
        },
        privateKey
      );

      const publishPromises = pool.publish(relayUrls, event);
      const publishResults = await Promise.allSettled(publishPromises);

      const success = publishResults.some(
        (r) => r.status === "fulfilled" && r.value
      );
      return {
        id: doc.id,
        success,
        error: success ? null : "Failed to publish to any relay",
      };
    } catch (error) {
      return {
        id: doc.id,
        success: false,
        error: error?.toString(),
      };
    }
  };

  for (let i = 0; i < documents.length; i += concurrencyLimit) {
    const chunk = documents.slice(i, i + concurrencyLimit);
    const chunkResults = await Promise.all(chunk.map(processDocument));
    results.push(...chunkResults);
  }

  return results;
}
