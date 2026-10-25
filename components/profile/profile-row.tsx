import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProfileRowProps {
  icon: LucideIcon;
  label: string;
  meta?: string;
  tone?: "default" | "danger";
}

/** Pure presentational row. `danger` is the only non-neutral tone. */
export function ProfileRow({
  icon: Icon,
  label,
  meta,
  tone = "default",
}: ProfileRowProps) {
  const destructive = tone === "danger";

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-sunken/60 active:bg-surface-sunken"
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md",
          destructive
            ? "bg-danger-100 text-danger-600"
            : "bg-surface-sunken text-ink-700",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      <span
        className={cn(
          "flex-1 text-sm font-medium",
          destructive ? "text-danger-600" : "text-ink-950",
        )}
      >
        {label}
      </span>

      {meta ? (
        <span className="font-mono text-[11px] text-ink-400" data-tabular>
          {meta}
        </span>
      ) : (
        <ChevronRight
          className={cn(
            "h-4 w-4",
            destructive ? "text-danger-600/50" : "text-ink-300",
          )}
          aria-hidden
        />
      )}
    </button>
  );
}
