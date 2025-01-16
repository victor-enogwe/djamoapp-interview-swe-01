import { performance } from 'node:perf_hooks';
import {
  catchError,
  from,
  iif,
  interval,
  lastValueFrom,
  of,
  ReplaySubject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';

export function tickUntil<T = unknown>(
  waitMs: number,
  everyMs: number,
  cb: (next: ReplaySubject<T>['next'], progress: number) => Promise<T>,
): Promise<T> {
  const start = performance.now();
  const subject = new ReplaySubject<T>();

  return lastValueFrom(
    interval(everyMs).pipe(
      takeUntil(subject),
      switchMap((progress) => from(cb(subject.next.bind(subject), progress))),
      switchMap((value) =>
        iif(
          () => performance.now() - start >= waitMs,
          of(value).pipe(tap(() => subject.next(value))),
          of(value),
        ),
      ),
      catchError((error: Error) =>
        throwError(() => error).pipe(tap(subject.error.bind(subject))),
      ),
    ),
  );
}
