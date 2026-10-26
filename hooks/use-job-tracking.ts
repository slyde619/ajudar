"use client";

import { useEffect, useState } from "react";
import { loadTrackingAction } from "@/app/_actions/booking";
import type { ApiError, IsoDateTime, JobTracking } from "@/lib/types";
import { useNow } from "./use-now";
import { useRealtime } from "./use-realtime";

interface TrackingState {
  tracking: JobTracking | null;
  error: ApiError | null;
  now: IsoDateTime | null;
}

/** Travel-mode artisan position from a snapshot plus realtime updates. */
export function useJobTracking(jobId: string, since: number, enabled = true): TrackingState {
  const [tracking, setTracking] = useState<JobTracking | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [reloads, setReloads] = useState(0);
  const now = useNow(5000);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void loadTrackingAction(jobId).then((result) => {
      if (cancelled) return;
      if (result.ok) setTracking(result.data);
      setError(result.ok ? null : result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [jobId, enabled, reloads]);

  useRealtime(
    enabled ? `job:${jobId}` : null,
    since,
    (event) => {
      if (event.type !== "job.tracking") return;
      setTracking(event.tracking);
      setError(null);
    },
    () => setReloads((count) => count + 1),
  );

  return { tracking, error, now: now === null ? null : new Date(now).toISOString() };
}
