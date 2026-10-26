"use client";

import { useNow } from "@/hooks/use-now";
import type { IsoDateTime } from "@/lib/types";
import { formatDuration } from "@/lib/utils/time";

/** Live countdown to a negotiation deadline. */
export function TimeLeft({ until, className }: { until: IsoDateTime; className?: string }) {
  const now = useNow();
  const seconds = now === null ? null : Math.max(0, Math.round((Date.parse(until) - now) / 1000));
  return (
    <span className={className} data-tabular>
      {seconds === null ? "—" : seconds === 0 ? "Time's up" : `${formatDuration(seconds)} left`}
    </span>
  );
}
