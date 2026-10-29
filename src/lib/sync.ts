// Client-side sync of per-user documents to the server (Postgres).
// localStorage stays as a fast local cache; the server is the source of truth.

type Doc = { updatedAt: number };
const ready = new Set<string>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pending = new Map<string, Doc>();

async function flush(key: string) {
  const doc = pending.get(key);
  if (!doc) return;
  pending.delete(key);
  try {
    const res = await fetch("/api/docs", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, data: doc, updatedAt: doc.updatedAt }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("[sync] save failed", err);
    if (!pending.has(key)) pending.set(key, doc);
    timers.set(key, setTimeout(() => void flush(key), 5000));
  }
}

/** Queue a debounced upload. Ignored until the remote copy has been loaded. */
export function pushRemote(key: string, doc: Doc) {
  if (typeof window === "undefined" || !ready.has(key)) return;
  pending.set(key, doc);
  clearTimeout(timers.get(key));
  timers.set(key, setTimeout(() => void flush(key), 600));
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    for (const key of [...pending.keys()]) void flush(key);
  });
}

/**
 * Load the server copy. Returns the remote doc when it should replace local;
 * otherwise (no server data, or local is newer) uploads local — the one-time
 * import of browser data — and returns null.
 */
export async function syncOnLoad<T extends Doc>(
  key: string,
  local: T | null,
  parse: (raw: unknown) => T | null,
): Promise<T | null> {
  if (typeof window === "undefined") return null;
  try {
    const r = await fetch(`/api/docs?key=${encodeURIComponent(key)}`, { credentials: "same-origin" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const res = (await r.json()) as { data: unknown } | null;
    ready.add(key);
    const remote = res ? parse(res.data) : null;
    if (remote && (!local || remote.updatedAt >= local.updatedAt)) return remote;
    if (local) pushRemote(key, local);
    return null;
  } catch (err) {
    console.error("[sync] load failed", err);
    return null;
  }
}

const SYNCED_KEYS = ["ledger.v2", "keel.v2", "keel.board.v1"];

/** Upload every pending save now. Resolves true when nothing is left unsaved. */
export async function flushAll(): Promise<boolean> {
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  for (const key of [...pending.keys()]) await flush(key);
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  return pending.size === 0;
}

/** Remove the synced documents from this browser (localStorage + IndexedDB). */
export async function clearLocalCache(): Promise<void> {
  ready.clear();
  for (const key of SYNCED_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  try {
    await new Promise<void>((resolve) => {
      const req = indexedDB.open("ledger-app", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("kv")) req.result.createObjectStore("kv");
      };
      req.onerror = () => resolve();
      req.onsuccess = () => {
        try {
          const tx = req.result.transaction("kv", "readwrite");
          for (const key of SYNCED_KEYS) tx.objectStore("kv").delete(key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
    });
  } catch {
    /* ignore */
  }
}
