import { Check, Sparkles, Star } from "lucide-react";
import type { VerificationSignal } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VerificationStripProps {
  signals: VerificationSignal[];
  className?: string;
}

function SignalIcon({ signal }: { signal: VerificationSignal }) {
  if (signal.key === "rating" && signal.verified) {
    return <Star className="size-3 fill-ink-950" strokeWidth={0} aria-hidden />;
  }
  if (signal.key === "jobs" && !signal.verified && signal.label === "New") {
    return <Sparkles className="size-3" aria-hidden />;
  }
  if (!signal.verified) return null;
  return (
    <span className="flex size-3.5 items-center justify-center rounded-full bg-ink-950">
      <Check className="size-2.5 text-celo-500" strokeWidth={3.5} aria-hidden />
    </span>
  );
}

/**
 * §11.1 signal strip. Pure. Each pill reads on its own; "New" is visually
 * distinct from unverified (§11 L5).
 */
export function VerificationStrip({ signals, className }: VerificationStripProps) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Verification">
      {signals.map((signal) => {
        const isNew = signal.key === "jobs" && signal.label === "New";
        return (
          <li
            key={signal.key}
            title={signal.detail}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-pill px-2.5 font-mono text-[11px] font-medium tracking-tight",
              signal.verified && "bg-celo-100 text-ink-950",
              isNew && "bg-surface-raised text-ink-700 ring-1 ring-line-300",
              !signal.verified && !isNew && "bg-surface-sunken text-ink-400",
            )}
          >
            <SignalIcon signal={signal} />
            <span data-tabular>{signal.label}</span>
            <span className="sr-only">
              {signal.verified ? "verified" : "not yet verified"}
              {signal.detail ? `, ${signal.detail}` : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
