import { format, parseISO } from "date-fns";

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatRon(n: number): string {
  const sign = n < 0 ? "−" : "";
  const [intPart, frac] = Math.abs(n).toFixed(2).split(".");
  return `${sign}${groupThousands(intPart!)},${frac} RON`;
}

export function formatRonCompact(n: number): string {
  if (Math.abs(n) < 10000) return formatRon(n);
  return formatAxis(n) + " RON";
}

export function formatAxis(n: number): string {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}${Math.round(abs / 1000)}k`;
  return `${sign}${Math.round(abs)}`;
}

export function formatRonSigned(n: number): string {
  if (n > 0) return `+${formatRon(n)}`;
  if (n < 0) return formatRon(n);
  return formatRon(0);
}

export function formatPct(ratio: number): string {
  const sign = ratio > 0 ? "+" : ratio < 0 ? "−" : "";
  return `${sign}${Math.abs(ratio * 100).toFixed(1)}%`;
}

export function formatPts(ratio: number): string {
  const sign = ratio > 0 ? "+" : ratio < 0 ? "−" : "";
  return `${sign}${Math.abs(ratio * 100).toFixed(1)} pts`;
}

export function formatDay(iso: string): string {
  return format(parseISO(iso), "d MMM");
}

export function formatDayYear(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy");
}

export function formatMonthLabel(d: Date): string {
  return format(d, "MMMM yyyy");
}

export function isoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function signedAmount(type: "income" | "expense", amount: number): number {
  return type === "income" ? amount : -amount;
}

export function parseAmount(value: string): number | null {
  const amount = Number(value.replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}
