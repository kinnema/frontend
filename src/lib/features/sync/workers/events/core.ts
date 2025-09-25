import { Filter, verifyEvent } from "nostr-tools";
import { IEventOptions } from "../../types";

export async function getEventId(
  documentId: string,
  options: IEventOptions,
  filterOverride?: Filter
): Promise<string | null> {
  const { publicKey, relays: relayUrls, pool } = options;
  try {
    const filter: Filter = {
      kinds: [30001],
      "#t": ["kinnema-sync", documentId],
      authors: [publicKey],
      limit: 1,
      ...filterOverride,
    };

    console.log(
      `Fetching deletion event ID from Nostr for documentId: ${documentId}`
    );
    console.log("Filter:", filter);
    console.log("Relay URLs:", relayUrls);

    return new Promise((resolve) => {
      let eventFound = false;

      const sub = pool.subscribe(relayUrls, filter, {
        onevent(event) {
          if (!eventFound && verifyEvent(event)) {
            eventFound = true;
            console.log(
              `Found deletion event for documentId ${documentId}:`,
              event.id
            );
            resolve(event.id);
            sub.close();
          }
        },
        oneose() {
          if (!eventFound) {
            console.log(`No deletion event found for documentId ${documentId}`);
            resolve(null);
            sub.close();
          }
        },
        onclose(reason) {
          console.log("Subscription closed:", reason);
        },
      });

      setTimeout(() => {
        if (!eventFound) {
          console.log(
            `Timeout reached, no deletion event found for documentId ${documentId}`
          );
          resolve(null);
          sub.close();
        }
      }, 5000);
    });
  } catch (error) {
    console.error("Failed to fetch deletion event ID from Nostr:", error);
    return null;
  }
}
