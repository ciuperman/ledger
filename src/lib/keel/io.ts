import { parseCsv } from "@/lib/ledger/csv";
import type { KeelCard, KeelColumn, KeelSnapshot } from "./types";
import { asSnapshot } from "./store";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function stamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function keelExportName(): string {
  return `keel-${stamp()}.csv`;
}

function csvField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function snapshotFromState(
  columns: KeelSnapshot["columns"],
  cards: KeelSnapshot["cards"],
): KeelSnapshot {
  return {
    v: 2,
    updatedAt: Date.now(),
    columns,
    cards,
  };
}

export function keelToCsv(snap: KeelSnapshot): string {
  const titleOf = new Map(snap.columns.map((col) => [col.id, col.title]));
  const order = new Map(snap.columns.map((col, index) => [col.id, index]));
  const cards = [...snap.cards].sort(
    (a, b) => (order.get(a.columnId) ?? 99) - (order.get(b.columnId) ?? 99),
  );
  const lines = ["Column,Title,Note,Done"];
  for (const card of cards) {
    lines.push(
      [
        csvField(titleOf.get(card.columnId) ?? ""),
        csvField(card.title),
        csvField(card.note ?? ""),
        card.doneAt ?? "",
      ].join(","),
    );
  }
  return `\uFEFF${lines.join("\r\n")}`;
}

function headerIndex(head: string[], names: string[]): number {
  for (const name of names) {
    const index = head.indexOf(name);
    if (index >= 0) return index;
  }
  return -1;
}

export function keelFromCsv(text: string): KeelSnapshot {
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length === 0) throw new Error("That CSV is empty.");
  const head = rows[0]!.map((cell) => cell.trim().toLowerCase());
  let start = 0;
  let columnIndex = 0;
  let titleIndex = 1;
  let noteIndex = 2;
  let doneIndex = 3;
  if (head.includes("title") || head.includes("column")) {
    start = 1;
    columnIndex = headerIndex(head, ["column", "list", "status"]);
    titleIndex = headerIndex(head, ["title", "card", "task"]);
    noteIndex = headerIndex(head, ["note", "notes", "detail"]);
    doneIndex = headerIndex(head, ["done", "done at", "date"]);
    if (titleIndex < 0) throw new Error("Need a Title column.");
  }
  const columns: KeelColumn[] = [];
  const columnIds = new Map<string, string>();
  const cards: KeelCard[] = [];
  for (const row of rows.slice(start)) {
    const title = (row[titleIndex] ?? "").trim().slice(0, 120);
    if (!title) continue;
    const columnTitle = ((columnIndex >= 0 ? row[columnIndex] : "") ?? "").trim().slice(0, 40) || "To do";
    const key = columnTitle.toLowerCase();
    let columnId = columnIds.get(key);
    if (!columnId) {
      columnId = crypto.randomUUID();
      columnIds.set(key, columnId);
      columns.push({ id: columnId, title: columnTitle });
    }
    const note = noteIndex >= 0 ? (row[noteIndex] ?? "").trim().slice(0, 400) : "";
    const doneRaw = doneIndex >= 0 ? (row[doneIndex] ?? "").trim() : "";
    cards.push({
      id: crypto.randomUUID(),
      columnId,
      title,
      note: note || undefined,
      doneAt: ISO_DATE.test(doneRaw) ? doneRaw : undefined,
    });
  }
  if (cards.length === 0) throw new Error("No cards in that CSV.");
  return { v: 2, updatedAt: Date.now(), columns, cards };
}

export function parseKeelImport(raw: unknown): KeelSnapshot {
  const snap = asSnapshot(raw);
  if (!snap) throw new Error("That file is not a Keel board backup.");
  return snap;
}

export function readFileAsJson(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error("That file is not valid JSON."));
      }
    };
    reader.readAsText(file);
  });
}
