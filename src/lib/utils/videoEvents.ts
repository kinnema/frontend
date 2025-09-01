import { finalize } from "rxjs";
import { Subject } from "rxjs/internal/Subject";

export const loadedVideoUrl$ = new Subject<string | undefined>();

loadedVideoUrl$.pipe(
  finalize(() => {
    loadedVideoUrl$.next(undefined);
  })
);
