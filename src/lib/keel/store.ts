import { create } from "zustand";
import type { KeelCard, KeelColumn, KeelColumnId, KeelSnapshot } from "./types";

const STORAGE_KEY = "keel.board.v1";
const IDB_NAME = "ledger-app";
const IDB_STORE = "kv";

const DEFAULT_COLUMNS: KeelColumn[] = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
];

function emptyBoard(now = Date.now()): KeelSnapshot {
  return {
    v: 1,
    updatedAt: now,
    columns: DEFAULT_COLUMNS.map((c) => ({ ...c })),
    cards: [],
  };
}

function asSnapshot(raw: unknown): KeelSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<KeelSnapshot>;
  if (o.v !== 1 || typeof o.updatedAt !== "number") return null;
  if (!Array.isArray(o.columns) || !Array.isArray(o.cards)) return null;
  if (o.columns.length > 24 || o.cards.length > 2000) return null;
  const columns: KeelColumn[] = [];
  for (const col of o.columns) {
    if (!col || typeof col.id !== "string" || typeof col.title !== "string") return null;
    const title = col.title.trim().slice(0, 40);
    if (!title) continue;
    columns.push({ id: col.id, title });
  }
  if (columns.length === 0) return null;
  const ids = new Set(columns.map((c) => c.id));
  const cards: KeelCard[] = [];
  for (const card of o.cards) {
    if (!card || typeof card.id !== "string" || typeof card.title !== "string") continue;
    if (!ids.has(card.columnId)) continue;
    const title = card.title.trim().slice(0, 120);
    if (!title) continue;
    const note = typeof card.note === "string" ? card.note.trim().slice(0, 400) : undefined;
    cards.push({ id: card.id, columnId: card.columnId, title, note: note || undefined });
  }
  return { v: 1, updatedAt: o.updatedAt, columns, cards };
}

function readLocal(): KeelSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return asSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeLocal(snap: KeelSnapshot): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    return true;
  } catch {
    return false;
  }
}

async function writeIdb(snap: KeelSnapshot): Promise<void> {
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) {
          req.result.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(snap, STORAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* private mode */
  }
}

type KeelState = {
  hydrated: boolean;
  persistOk: boolean;
  columns: KeelColumn[];
  cards: KeelCard[];
  hydrate: () => void;
  addColumn: (title: string) => KeelColumn | null;
  renameColumn: (id: KeelColumnId, title: string) => boolean;
  deleteColumn: (id: KeelColumnId) => void;
  addCard: (columnId: KeelColumnId, title: string, note?: string) => KeelCard | null;
  updateCard: (id: string, patch: { title?: string; note?: string }) => boolean;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, columnId: KeelColumnId, index: number) => void;
};

function commit(patch: Partial<Pick<KeelState, "columns" | "cards">>) {
  const current = useKeel.getState();
  const next: KeelSnapshot = {
    v: 1,
    updatedAt: Date.now(),
    columns: patch.columns ?? current.columns,
    cards: patch.cards ?? current.cards,
  };
  const persistOk = writeLocal(next);
  void writeIdb(next);
  useKeel.setState({
    columns: next.columns,
    cards: next.cards,
    persistOk,
    hydrated: true,
  });
}

export const useKeel = create<KeelState>((_set, get) => ({
  hydrated: false,
  persistOk: true,
  columns: DEFAULT_COLUMNS.map((c) => ({ ...c })),
  cards: [],

  hydrate: () => {
    if (get().hydrated) return;
    const snap = readLocal() ?? emptyBoard();
    if (!readLocal()) writeLocal(snap);
    useKeel.setState({
      hydrated: true,
      persistOk: true,
      columns: snap.columns,
      cards: snap.cards,
    });
  },

  addColumn: (title) => {
    const cleaned = title.trim().slice(0, 40);
    if (!cleaned) return null;
    const row: KeelColumn = { id: crypto.randomUUID(), title: cleaned };
    commit({ columns: [...get().columns, row] });
    return row;
  },

  renameColumn: (id, title) => {
    const cleaned = title.trim().slice(0, 40);
    if (!cleaned) return false;
    const columns = get().columns.map((c) => (c.id === id ? { ...c, title: cleaned } : c));
    if (!columns.some((c) => c.id === id)) return false;
    commit({ columns });
    return true;
  },

  deleteColumn: (id) => {
    commit({
      columns: get().columns.filter((c) => c.id !== id),
      cards: get().cards.filter((c) => c.columnId !== id),
    });
  },

  addCard: (columnId, title, note) => {
    if (!get().columns.some((c) => c.id === columnId)) return null;
    const cleaned = title.trim().slice(0, 120);
    if (!cleaned) return null;
    const row: KeelCard = {
      id: crypto.randomUUID(),
      columnId,
      title: cleaned,
      note: note?.trim().slice(0, 400) || undefined,
    };
    commit({ cards: [...get().cards, row] });
    return row;
  },

  updateCard: (id, patch) => {
    const current = get().cards;
    if (!current.some((c) => c.id === id)) return false;
    commit({
      cards: current.map((c) => {
        if (c.id !== id) return c;
        const title = patch.title !== undefined ? patch.title.trim().slice(0, 120) : c.title;
        const note =
          patch.note !== undefined ? patch.note.trim().slice(0, 400) || undefined : c.note;
        return { ...c, title: title || c.title, note };
      }),
    });
    return true;
  },

  deleteCard: (id) => {
    commit({ cards: get().cards.filter((c) => c.id !== id) });
  },

  moveCard: (cardId, columnId, index) => {
    const moved = get().cards.find((c) => c.id === cardId);
    if (!moved) return;
    if (!get().columns.some((c) => c.id === columnId)) return;
    const without = get().cards.filter((c) => c.id !== cardId);
    const next = { ...moved, columnId };
    const colCards = without.filter((c) => c.columnId === columnId);
    const before = colCards[index];
    if (!before) {
      const last = colCards[colCards.length - 1];
      if (!last) {
        commit({ cards: [...without, next] });
        return;
      }
      const at = without.findIndex((c) => c.id === last.id) + 1;
      const cards = [...without];
      cards.splice(at, 0, next);
      commit({ cards });
      return;
    }
    const at = without.findIndex((c) => c.id === before.id);
    const cards = [...without];
    cards.splice(at, 0, next);
    commit({ cards });
  },
}));
