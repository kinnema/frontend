import { HDKey } from "@scure/bip32";
import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { getPublicKey } from "nostr-tools";
import { SyncIdentity } from "./types";

export class SyncMnemonic {
  static generate(): string {
    return generateMnemonic(wordlist);
  }

  static validate(mnemonic: string): boolean {
    return validateMnemonic(mnemonic, wordlist);
  }

  static deriveIdentity(mnemonic: string): SyncIdentity {
    if (!this.validate(mnemonic)) {
      throw new Error("Invalid mnemonic");
    }

    const seed = mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);

    const nostrKey = hdkey.derive("m/44'/1237'/0'/0/0");
    if (!nostrKey.privateKey) {
      throw new Error("Failed to derive Nostr key");
    }

    const nostrPrivateKey = Buffer.from(nostrKey.privateKey).toString("hex");
    const nostrPublicKey = getPublicKey(nostrKey.privateKey);

    const p2pKey = hdkey.derive("m/44'/0'/0'/0/0");
    if (!p2pKey.privateKey) {
      throw new Error("Failed to derive P2P key");
    }
    const p2pId = Buffer.from(p2pKey.privateKey)
      .toString("hex")
      .substring(0, 16);

    const deviceKey = hdkey.derive("m/44'/0'/1'/0/0");
    if (!deviceKey.privateKey) {
      throw new Error("Failed to derive device key");
    }
    const deviceId = Buffer.from(deviceKey.privateKey)
      .toString("hex")
      .substring(0, 8);

    return {
      mnemonic,
      nostrPrivateKey,
      nostrPublicKey,
      p2pId,
      deviceId,
    };
  }
}
