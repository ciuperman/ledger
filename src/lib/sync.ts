// Client-side sync of per-user documents to the server (Postgres).
// localStorage stays as a fast local cache; the server is the source of truth.
import { getUserDoc, putUserDoc } from "./sync.functions";

type Doc = { updatedAt: number };
const ready = new Set<string>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pending = new Map<string, Doc>();

async function flush(key: string) {
  const doc = pending.get(key);
  if (!doc) return;
  pending.delete(key);
  try {
    await putUserDoc({ data: { key, json: JSON.stringify(doc), updatedAt: doc.updatedAt } });
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
    const res = await getUserDoc({ data: { key } });
    ready.add(key);
    const remote = res ? parse(JSON.parse(res.json)) : null;
    if (remote && (!local || remote.updatedAt >= local.updatedAt)) return remote;
    if (local) pushRemote(key, local);
    return null;
  } catch (err) {
    console.error("[sync] load failed", err);
    return null;
  }
}
