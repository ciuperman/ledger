import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { KpiPoint } from "@/lib/ledger/analytics";
import { formatPct, formatPts, formatRon, formatRonSigned } from "@/lib/ledger/format";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";

function Delta({
  value,
  invert,
  unit = "pct",
}: {
  value: number | null;
  invert?: boolean;
  unit?: "pct" | "pts";
}) {
  if (value === null) {
    return <span className="text-xs text-subtle">vs prior period</span>;
  }
  const Icon = value === 0 ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  const good = invert ? value < 0 : value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums",
        value === 0 ? "text-muted-foreground" : good ? "text-income" : "text-expense",
      )}
    >
      <Icon className="size-3.5" />
      {unit === "pts" ? formatPts(value) : formatPct(value)}
      <span className="ml-1 font-sans text-subtle">vs prior</span>
    </span>
  );
}

function KpiCard({
  label,
  value,
  display,
  invert,
  delay,
  unit,
}: {
  label: string;
  value: KpiPoint;
  display: string;
  invert?: boolean;
  delay: number;
  unit?: "pct" | "pts";
}) {
  return (
    <article
      className="stagger-in rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl tracking-tight text-foreground tabular-nums sm:text-2xl">
        {display}
      </p>
      <div className="mt-1">
        <Delta value={value.change} invert={invert} unit={unit} />
      </div>
      <div className="mt-3">
        <Sparkline values={value.series} />
      </div>
    </article>
  );
}

export function KpiGrid({
  net,
  income,
  expenses,
  savingsRate,
}: {
  net: KpiPoint;
  income: KpiPoint;
  expenses: KpiPoint;
  savingsRate: KpiPoint;
}) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label="Net cashflow"
        value={net}
        display={formatRonSigned(net.current)}
        delay={0}
      />
      <KpiCard
        label="Income"
        value={income}
        display={formatRon(income.current)}
        delay={40}
      />
      <KpiCard
        label="Expenses"
        value={expenses}
        display={formatRon(expenses.current)}
        invert
        delay={80}
      />
      <KpiCard
        label="Savings rate"
        value={savingsRate}
        display={
          income.current <= 0 && savingsRate.current === 0
            ? "—"
            : formatPct(savingsRate.current)
        }
        delay={120}
        unit="pts"
      />
    </section>
  );
}
