import { BehaviorSubject } from "rxjs";

export class SyncObservables {
  public static isEnabled$ = new BehaviorSubject<boolean>(false);
  // Nostr sync observables
}
