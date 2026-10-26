import { MapPinIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

interface LocationChipProps {
  area: string;
  landmark?: string;
  precision: "pin" | "approximate" | "stale";
  action?: React.ReactNode;
  className?: string;
}

const PRECISION_LABEL: Record<LocationChipProps["precision"], string> = {
  pin: "Pin confirmed",
  approximate: "Approximate area",
  stale: "Update location",
};

/** Address chip with the LGA and location precision. */
export function LocationChip({ area, landmark, precision, action, className }: LocationChipProps) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl bg-surface-raised p-4 ring-1 ring-line-200", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-950 text-celo-500">
        <MapPinIcon className="size-4" weight="bold" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-950">{area}</p>
        {landmark ? <p className="mt-0.5 line-clamp-2 text-sm text-ink-700">{landmark}</p> : null}
        <p
          className={cn(
            "mt-1.5 font-mono text-[10px] tracking-wider uppercase",
            precision === "stale" ? "text-warning-600" : "text-ink-400",
          )}
        >
          {PRECISION_LABEL[precision]}
        </p>
      </div>
      {action}
    </div>
  );
}
