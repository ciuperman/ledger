import { formatRon } from "@/lib/ledger/format";

type PayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = formatRon,
}: {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
  valueFormatter?: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-xs shadow-[var(--shadow-border)]">
      {label ? <p className="mb-1 text-muted-foreground">{label}</p> : null}
      <ul className="space-y-0.5">
        {payload.map((item) => {
          const n = typeof item.value === "number" ? item.value : Number(item.value);
          return (
            <li
              key={String(item.dataKey ?? item.name)}
              className="flex items-center justify-between gap-6 tabular-nums text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: item.color ?? "var(--color-primary)" }}
                />
                {item.name}
              </span>
              <span className="font-mono">{Number.isFinite(n) ? valueFormatter(n) : "—"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
