"use client";

import { useOptimistic, useTransition } from "react";
import { setAvailabilityAction } from "@/app/_actions/supply";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AvailabilityToggleProps {
  online: boolean;
  areas: string;
}

/** Online toggle for receiving jobs that need someone now. */
export function AvailabilityToggle({ online, areas }: AvailabilityToggleProps) {
  const [optimistic, setOptimistic] = useOptimistic(online);
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-3 rounded-2xl bg-surface-raised p-4 shadow-pop ring-1 ring-line-200">
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          optimistic ? "bg-success-600" : "bg-ink-300",
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink-950">{optimistic ? "You're online" : "You're offline"}</span>
        <span className="block truncate text-xs text-ink-500">
          {optimistic ? areas : "Go online to get jobs that need someone now"}
        </span>
      </span>
      <Switch
        checked={optimistic}
        disabled={pending}
        aria-label="Online for new jobs"
        onCheckedChange={(next) =>
          startTransition(async () => {
            setOptimistic(next);
            await setAvailabilityAction(next);
          })
        }
      />
    </label>
  );
}
