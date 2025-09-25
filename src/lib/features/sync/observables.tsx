import { BehaviorSubject, Subject } from "rxjs";

export const syncingStatus$ = new Subject<boolean>();
export const lastSyncedAt$ = new Subject<Date>();
export const onlinePeers$ = new Subject<string[]>();
export const isSyncActive$ = new BehaviorSubject<boolean>(false);
