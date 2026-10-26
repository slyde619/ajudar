import { Check, CircleDashed, Clock, LoaderCircle, X } from "lucide-react";
import type { CheckStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ChecklistItem {
  key: string;
  label: string;
  status: CheckStatus;
  note?: string;
  optional?: boolean;
}

const STATUS: Record<CheckStatus, { label: string; className: string; icon: typeof Check }> = {
  verified: { label: "Verified", className: "bg-success-100 text-success-600", icon: Check },
  pending_review: { label: "We're checking", className: "bg-warning-100 text-warning-600", icon: Clock },
  in_progress: { label: "In progress", className: "bg-surface-sunken text-ink-700", icon: LoaderCircle },
  not_started: { label: "Not started", className: "bg-surface-sunken text-ink-500", icon: CircleDashed },
  rejected: { label: "Needs another try", className: "bg-danger-100 text-danger-600", icon: X },
};

/** One row per verification layer, with its status and next step. */
export function VerificationChecklist({ items, className }: { items: ChecklistItem[]; className?: string }) {
  return (
    <ul className={cn("divide-y divide-line-200 overflow-hidden rounded-2xl bg-surface-raised ring-1 ring-line-200", className)}>
      {items.map((item) => {
        const status = STATUS[item.status];
        const Icon = status.icon;
        return (
          <li key={item.key} className="flex items-start gap-3 px-4 py-3.5">
            <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", status.className)}>
              <Icon className={cn("size-3.5", item.status === "in_progress" && "animate-spin motion-reduce:animate-none")} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-ink-950">
                  {item.label}
                  {item.optional ? <span className="ml-1.5 text-xs font-normal text-ink-400">Optional</span> : null}
                </span>
                <span className="shrink-0 text-xs font-medium text-ink-500">{status.label}</span>
              </span>
              {item.note ? <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{item.note}</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
