import { addMonths, addWeeks, addYears, format, parseISO } from "date-fns";
import type { Frequency, RecurringBill } from "./types";

export const FREQ_LABELS: Record<Frequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function advanceDate(iso: string, frequency: Frequency): string {
  const d = parseISO(`${iso}T00:00:00`);
  const next =
    frequency === "weekly"
      ? addWeeks(d, 1)
      : frequency === "yearly"
        ? addYears(d, 1)
        : addMonths(d, 1);
  return format(next, "yyyy-MM-dd");
}

export type DuePlan = {
  dates: string[];
  nextDate: string;
};

export function planDue(bill: RecurringBill, today: string, max = 24): DuePlan {
  const dates: string[] = [];
  let cursor = bill.nextDate;
  let guard = 0;
  while (cursor <= today && guard < max) {
    dates.push(cursor);
    cursor = advanceDate(cursor, bill.frequency);
    guard += 1;
  }
  return { dates, nextDate: cursor };
}

export function splitRecurrences(
  rows: RecurringBill[],
  today: string,
): { due: RecurringBill[]; upcoming: RecurringBill[]; paused: RecurringBill[] } {
  const due: RecurringBill[] = [];
  const upcoming: RecurringBill[] = [];
  const paused: RecurringBill[] = [];
  for (const row of rows) {
    if (row.paused) paused.push(row);
    else if (row.nextDate <= today) due.push(row);
    else upcoming.push(row);
  }
  const byDate = (a: RecurringBill, b: RecurringBill) =>
    a.nextDate.localeCompare(b.nextDate) || a.payee.localeCompare(b.payee);
  due.sort(byDate);
  upcoming.sort(byDate);
  paused.sort(byDate);
  return { due, upcoming, paused };
}
