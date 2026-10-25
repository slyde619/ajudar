"use client";

import { useEffect, useState } from "react";
import { getJobTracking } from "@/lib/api/tracking";
import type { ApiError, IsoDateTime, JobTracking } from "@/lib/types";

interface TrackingState {
  tracking: JobTracking | null;
  error: ApiError | null;
  /** Clock for "Updated 2 min ago", advanced by this hook, not by render. */
  now: IsoDateTime | null;
}

const POLL_MS = 3000;

/**
 * Polls the travel-mode snapshot while the document is visible, and pauses
 * when hidden — the same foreground-only constraint artisans live under
 * (§10.6). Next's Activity also tears this down when the route is hidden.
 */
export function useJobTracking(jobId: string, enabled = true): TrackingState {
  const [state, setState] = useState<TrackingState>({
    tracking: null,
    error: null,
    now: null,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      const result = await getJobTracking(jobId);
      if (cancelled) return;
      setState((previous) => ({
        tracking: result.ok ? result.data : previous.tracking,
        error: result.ok ? null : result.error,
        now: new Date().toISOString(),
      }));
      if (document.visibilityState === "visible") {
        timer = setTimeout(poll, POLL_MS);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        void poll();
      } else {
        clearTimeout(timer);
      }
    };

    void poll();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [jobId, enabled]);

  return state;
}
