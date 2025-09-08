import {
  SimplePool,
  generateSecretKey,
  getPublicKey,
  nip19,
} from "nostr-tools";
import { DatabaseCollectionName } from "../database/types";
import { useSyncStore } from "../stores/sync.store";

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

// Simplified NostrReplicationManager for worker context
export class WorkerNostrReplicationManager {
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
      if (!url || typeof url !== "string") {
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

  static generateSecretAndSet(): string {
    const sk = generateSecretKey();
    const syncStore = useSyncStore.getState();
    const encodedSk = nip19.nsecEncode(sk);
    syncStore.setNostrSecretKey(encodedSk);

    return encodedSk;
  }

  private initializeKeys(providedSecretKey?: string): void {
    try {
      let sk: Uint8Array;

      if (providedSecretKey && typeof providedSecretKey === "string") {
        try {
          const decoded = nip19.decode(providedSecretKey);
          if (decoded.type === "nsec" && decoded.data instanceof Uint8Array) {
            sk = decoded.data;
          } else {
            throw new Error("Invalid Nostr secret key format");
          }
        } catch (decodeError) {
          console.warn(
            "Failed to decode provided secret key, generating new one:",
            decodeError
          );
          sk = generateSecretKey();
        }
      } else {
        const syncStore = useSyncStore.getState();
        sk = generateSecretKey();
        syncStore.setNostrSecretKey(nip19.nsecEncode(sk));
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

  // Simplified sync method that just returns a result without database access
  async fullSync(collectionName: DatabaseCollectionName) {
    this.ensureInitialized();

    const RELAY_URLS = this.fetchRelayUrls();
    if (RELAY_URLS.length === 0) {
      return {
        push: {
          total: 0,
          synced: 0,
          errors: ["No valid relay URLs configured"],
        },
        pull: {
          total: 0,
          updated: 0,
          errors: ["No valid relay URLs configured"],
        },
      };
    }

    // For worker context, we can't access the database directly
    // This would need to be implemented differently or communicated back to main thread
    console.log(
      `Worker: Would sync collection ${collectionName} with relays:`,
      RELAY_URLS
    );

    return {
      push: {
        total: 0,
        synced: 0,
        errors: ["Database access not available in worker context"],
      },
      pull: {
        total: 0,
        updated: 0,
        errors: ["Database access not available in worker context"],
      },
    };
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
}
