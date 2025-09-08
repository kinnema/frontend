import {
  SimplePool,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
  verifyEvent,
  type Event,
} from "nostr-tools";
import { useCallback, useEffect, useState } from "react";

const RELAY_URLS = [
  "wss://relay.damus.io",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.nostr.band",
];

export interface NostrData {
  id: string;
  content: string;
  created_at: number;
}

export function useNostr() {
  const [pool] = useState(() => new SimplePool());
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [storedData, setStoredData] = useState<NostrData[]>([]);

  // Load or generate secret key
  useEffect(() => {
    const stored = localStorage.getItem("nostr-secret-key");
    let sk: Uint8Array;

    if (stored) {
      try {
        // Try to decode from hex
        sk = nip19.decode(stored).data as Uint8Array;
      } catch {
        // If not valid, generate new
        sk = generateSecretKey();
        localStorage.setItem("nostr-secret-key", nip19.nsecEncode(sk));
      }
    } else {
      sk = generateSecretKey();
      localStorage.setItem("nostr-secret-key", nip19.nsecEncode(sk));
    }

    setSecretKey(nip19.nsecEncode(sk));
    setPublicKey(getPublicKey(sk));
    setIsConnected(true);
  }, []);

  // Publish data to Nostr
  const publishData = useCallback(
    async (content: string, identifier = "kinnema-data") => {
      if (!secretKey || !publicKey) return false;

      try {
        const sk = nip19.decode(secretKey).data as Uint8Array;
        const event = finalizeEvent(
          {
            kind: 1, // Regular text note - allows multiple entries
            created_at: Math.floor(Date.now() / 1000),
            tags: [["t", identifier]], // Use 't' tag for topic instead of 'd'
            content: JSON.stringify({ data: content, timestamp: Date.now() }),
          },
          sk
        );

        if (!verifyEvent(event)) {
          throw new Error("Event verification failed");
        }

        const pubs = pool.publish(RELAY_URLS, event);
        await Promise.all(pubs);
        console.log("Data published to Nostr:", content);
        return true;
      } catch (error) {
        console.error("Publish error:", error);
        return false;
      }
    },
    [secretKey, publicKey, pool]
  );

  // Retrieve data from Nostr
  const retrieveData = useCallback(
    async (identifier = "kinnema-data") => {
      if (!publicKey) return [];

      try {
        const events: Event[] = [];
        const sub = pool.subscribeMany(
          RELAY_URLS,
          [
            {
              kinds: [1], // Regular text notes
              authors: [publicKey],
              "#t": [identifier], // Filter by topic tag
              limit: 50,
            },
          ],
          {
            onevent(event) {
              events.push(event);
            },
          }
        );

        // Wait for events to be collected
        await new Promise((resolve) => setTimeout(resolve, 3000));

        sub.close();

        const data: NostrData[] = events
          .filter((event) => verifyEvent(event))
          .map((event) => {
            try {
              const parsed = JSON.parse(event.content);
              return {
                id: event.id,
                content: parsed.data || event.content,
                created_at: event.created_at,
              };
            } catch {
              return {
                id: event.id,
                content: event.content,
                created_at: event.created_at,
              };
            }
          })
          .sort((a, b) => b.created_at - a.created_at);

        setStoredData(data);
        return data;
      } catch (error) {
        console.error("Retrieval error:", error);
        return [];
      }
    },
    [publicKey, pool]
  );

  // Set custom secret key
  const setCustomSecretKey = useCallback((nsec: string) => {
    try {
      const sk = nip19.decode(nsec).data as Uint8Array;
      const pk = getPublicKey(sk);
      localStorage.setItem("nostr-secret-key", nsec);
      setSecretKey(nsec);
      setPublicKey(pk);
      setStoredData([]);
    } catch (error) {
      console.error("Invalid secret key:", error);
      throw new Error("Invalid Nostr secret key format");
    }
  }, []);

  // Get public key in npub format
  const getPublicKeyNpub = useCallback(() => {
    if (!publicKey) return null;
    return nip19.npubEncode(publicKey);
  }, [publicKey]);

  // Cleanup
  useEffect(() => {
    return () => {
      pool.close(RELAY_URLS);
    };
  }, [pool]);

  return {
    secretKey,
    publicKey,
    publicKeyNpub: getPublicKeyNpub(),
    isConnected,
    storedData,
    publishData,
    retrieveData,
    setCustomSecretKey,
  };
}
