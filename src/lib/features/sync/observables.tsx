import { Subject } from "rxjs";

export const syncingStatus$ = new Subject<boolean>();
export const lastSyncedAt$ = new Subject<Date>();
