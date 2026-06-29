/**
 * TTL cache with two tiers: a synchronous in-memory map (per page load) backed by
 * `sessionStorage` (survives client-side navigation and reloads within a tab).
 *
 * Used to wrap NuGet API calls so navigating between docs pages never refetches.
 */

interface Entry<T> {
  value: T;
  expires: number;
}

const memory = new Map<string, Entry<unknown>>();
const PREFIX = 'kippo-cache:';

function now(): number {
  return Date.now();
}

function readSession<T>(key: string): Entry<T> | undefined {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return undefined;
    return JSON.parse(raw) as Entry<T>;
  } catch {
    return undefined;
  }
}

function writeSession<T>(key: string, entry: Entry<T>): void {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // sessionStorage may be unavailable (private mode / quota) — memory tier still works.
  }
}

/** Read a live (non-expired) cached value, or `undefined`. */
export function getCached<T>(key: string): T | undefined {
  const mem = memory.get(key) as Entry<T> | undefined;
  if (mem && mem.expires > now()) return mem.value;

  const ses = readSession<T>(key);
  if (ses && ses.expires > now()) {
    memory.set(key, ses);
    return ses.value;
  }
  return undefined;
}

/** Store a value with a TTL (milliseconds). */
export function setCached<T>(key: string, value: T, ttlMs: number): void {
  const entry: Entry<T> = { value, expires: now() + ttlMs };
  memory.set(key, entry);
  writeSession(key, entry);
}

/**
 * De-duplicated, cached async fetch. Concurrent callers for the same key share one
 * in-flight promise; resolved values are cached for `ttlMs`.
 */
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const hit = getCached<T>(key);
  if (hit !== undefined) return hit;

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = loader()
    .then((value) => {
      setCached(key, value, ttlMs);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export const TTL = {
  /** Version lists / metadata change rarely; 1h is plenty for a docs site. */
  HOUR: 60 * 60 * 1000,
  /** Download stats — refresh a bit more often. */
  STATS: 30 * 60 * 1000,
} as const;
