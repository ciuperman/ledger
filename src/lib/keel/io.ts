import type { KeelSnapshot } from "./types";
import { asSnapshot } from "./store";

function stamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export type KeelExportResult = "empty" | "shared" | "downloaded" | "cancelled";

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

export async function exportKeelBoard(snap: KeelSnapshot): Promise<KeelExportResult> {
  if (snap.columns.length === 0 && snap.cards.length === 0) return "empty";
  const file = new File([JSON.stringify(snap, null, 2)], `keel-${stamp()}.json`, {
    type: "application/json",
  });

  try {
    if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Keel board" });
      return "shared";
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
  }

  downloadFile(file);
  return "downloaded";
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
