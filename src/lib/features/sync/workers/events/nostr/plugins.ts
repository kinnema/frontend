import { IPlugin } from "@/lib/types/plugin.type";
import { Filter, finalizeEvent, verifyEvent } from "nostr-tools";
import { IEventOptions } from "../../../types";
import { getEventId } from "../core";

export async function syncPlugins(plugins: IPlugin[], options: IEventOptions) {
  const { isInitialized, relays, publicKey } = options;
  console.log("Nostr Worker: Syncing plugins...", plugins);
  if (!isInitialized) {
    throw new Error("Worker not initialized");
  }

  console.log("Nostr Worker: Current state:", {
    isInitialized,
    publicKey,
    relayUrls: relays.length,
    relaysList: relays,
  });

  const deletedDocuments = await fetchDeletedDocuments(options);

  self.postMessage({
    type: "deleted-plugins",
    payload: deletedDocuments,
  });

  console.log(
    `Nostr Worker: Fetched ${deletedDocuments.length} deleted documents`,
    deletedDocuments
  );

  console.log("Nostr Worker: Fetching remote plugins...");
  const remotePlugins = await fetchPlugins(options);
  console.log(
    `Nostr Worker: Fetched ${remotePlugins.length} remote plugins`,
    remotePlugins
  );

  const remotePluginIds = remotePlugins.map((p) => p.id);
  const pluginsToPublish = plugins.filter(
    (p) =>
      !remotePluginIds.includes(p.id) &&
      !deletedDocuments.find((d) => d.pluginId === p.id)
  );

  if (pluginsToPublish.length > 0) {
    console.log(
      `Nostr Worker: Publishing ${pluginsToPublish.length} new plugins`,
      pluginsToPublish
    );
    await publishToNostrPlugins(pluginsToPublish, options);
  } else {
    console.log("Nostr Worker: No new plugins to publish");
  }

  console.log(
    `Nostr Worker: Sending ${remotePlugins.length} remote plugins to main thread`
  );

  self.postMessage({
    type: "result-plugins",
    payload: remotePlugins,
  });
}

async function fetchPlugins({
  isInitialized,
  publicKey,
  relays,
  pool,
}: IEventOptions): Promise<IPlugin[]> {
  if (!isInitialized) {
    throw new Error("Worker not initialized");
  }

  try {
    const filter: Filter[] = [
      {
        kinds: [30001],
        "#t": ["kinnema-sync"],
        authors: [publicKey],
        limit: 1,
      },
    ];

    console.log("Fetching plugins from Nostr relays");
    console.log("Filter:", filter);
    console.log("Relay URLs:", relays);

    let plugins: IPlugin[] = [];
    let eventReceived = false;

    return new Promise((resolve) => {
      const sub = pool.subscribeMany(relays, filter, {
        onevent(event) {
          eventReceived = true;
          console.log(`Received plugin event from Nostr:`, {
            id: event.id,
            kind: event.kind,
            created_at: event.created_at,
            tags: event.tags,
          });
          try {
            if (verifyEvent(event)) {
              const content = JSON.parse(event.content);
              if (content.plugins && Array.isArray(content.plugins)) {
                plugins = content.plugins;
                console.log(
                  `Parsed and storing ${plugins.length} plugins from event ${event.id}`
                );
              } else {
                console.log(
                  `No plugins array found in event ${event.id} content:`,
                  content
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
          console.log("EOSE received, closing subscription");
          sub.close();
          console.log(`Returning ${plugins.length} plugins after EOSE`);
          resolve(plugins);
        },
        onclose(reason) {
          console.log("Subscription closed:", reason);
        },
      });

      setTimeout(() => {
        console.log(
          `Timeout reached, eventReceived: ${eventReceived}, returning ${plugins.length} plugins`
        );
        sub.close();
        resolve(plugins);
      }, 5000);
    });
  } catch (error) {
    console.error("Failed to fetch plugins from Nostr:", error);
    return [];
  }
}

async function publishToNostrPlugins(
  plugins: IPlugin[],
  { isInitialized, publicKey, privateKey, pool, relays }: IEventOptions
) {
  console.log("Nostr Worker: Publishing plugins...", plugins);
  if (!isInitialized) {
    throw new Error("Worker not initialized");
  }

  if (plugins.length === 0) {
    console.log("Nostr Worker: No plugins to publish.");
    return;
  }

  const event = finalizeEvent(
    {
      content: JSON.stringify({ plugins, syncedAt: Date.now() }),
      kind: 30001,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["t", "kinnema-sync", "plugins"],
        ["p", publicKey],
      ],
    },
    privateKey
  );

  const publishPromises = pool.publish(relays, event);
  const publishResults = await Promise.allSettled(publishPromises);

  const success = publishResults.some(
    (r) => r.status === "fulfilled" && r.value
  );

  console.log(
    `Nostr Worker: Plugin publish ${success ? "successful" : "failed"}`
  );
  return success;
}

export async function deletePluginFromNostr(
  pluginId: string,
  { isInitialized, publicKey, privateKey, pool, relays }: IEventOptions
) {
  console.log(`Nostr Worker: Deleting plugin ${pluginId} from Nostr...`);
  if (!isInitialized) {
    throw new Error("Worker not initialized");
  }

  const existingEventId = await getEventId(
    pluginId,
    {
      isInitialized,
      publicKey,
      relays,
      pool,
      privateKey,
    },
    {
      kinds: [30001],
      "#t": ["kinnema-sync", "plugins"],
      authors: [publicKey],
      limit: 1,
    }
  );

  if (!existingEventId) {
    console.warn(
      `Nostr Worker: No existing event found for plugin ${pluginId}`
    );
    return;
  }

  const event = finalizeEvent(
    {
      content: JSON.stringify({ pluginId, deletedAt: Date.now() }),
      kind: 5,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["e", existingEventId],
        ["d", `plugin-${pluginId}-deletion`],
        ["t", "kinnema-sync", "plugins"],
        ["p", publicKey],
      ],
    },
    privateKey
  );

  const publishPromises = pool.publish(relays, event);
  const publishResults = await Promise.allSettled(publishPromises);

  const success = publishResults.some(
    (r) => r.status === "fulfilled" && r.value
  );

  console.log(
    `Nostr Worker: Plugin deletion ${success ? "successful" : "failed"}`
  );
  return success;
}

async function fetchDeletedDocuments({
  publicKey,
  pool,
  relays,
}: IEventOptions): Promise<{ pluginId: string; deletedAt: number }[]> {
  const filter: Filter = {
    kinds: [5],
    "#t": ["kinnema-sync", "plugins"],
    authors: [publicKey],
    limit: 100,
  };
  const results: { pluginId: string; deletedAt: number }[] = [];

  return new Promise((resolve) => {
    const sub = pool.subscribeMany(relays, [filter], {
      onevent: (event) => {
        console.log("Nostr Worker: Deleted document event received:", event);
        if (!verifyEvent(event)) {
          console.warn("Nostr Worker: Invalid deleted document event:", event);
          return;
        }

        const { pluginId, deletedAt } = JSON.parse(event.content);
        results.push({ pluginId, deletedAt });
      },
      oneose: () => {
        console.log("Nostr Worker: EOSE received for deleted documents");
        sub.close();
        resolve(results);
      },
      onclose: (error) => {
        console.log("Nostr Worker: Subscription closed:", error);
      },
    });

    setTimeout(() => {
      console.log("Nostr Worker: Timeout reached for deleted documents");
      sub.close();
      resolve(results);
    }, 5000);
  });
}
