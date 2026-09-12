import { RANGE_LABELS } from "@/lib/ledger/analytics";
import { RANGE_PRESETS, type RangePreset } from "@/lib/ledger/types";
import { cn } from "@/lib/utils";

export function DateRange({
  value,
  onChange,
}: {
  value: RangePreset;
  onChange: (next: RangePreset) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Date range"
      className="flex rounded-xl bg-muted p-1"
    >
      {RANGE_PRESETS.map((preset) => {
        const active = preset === value;
        return (
          <button
            key={preset}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(preset)}
            className={cn(
              "h-9 min-h-9 min-w-11 flex-1 rounded-lg px-2.5 font-mono text-xs font-medium transition-[color,background-color,box-shadow] duration-150",
              active
                ? "bg-card text-foreground shadow-[var(--shadow-border)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {RANGE_LABELS[preset]}
          </button>
        );
      })}
    </div>
  );
}
