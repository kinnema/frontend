import { BehaviorSubject } from "rxjs";

export class SyncObservables {
  public static isEnabled$ = new BehaviorSubject<boolean>(false);
  // Nostr sync observables
  public static isNostrEnabled$ = new BehaviorSubject<boolean>(false);
  public static nostrConnectionStatus$ = new BehaviorSubject<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  public static nostrSyncInProgress$ = new BehaviorSubject<boolean>(false);
  public static nostrId$ = new BehaviorSubject<string>("");
}
