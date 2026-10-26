"use client";

import { useEffect, useState } from "react";

/** A clock that ticks on an interval after mount. */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = requestAnimationFrame(tick);
    const timer = setInterval(tick, intervalMs);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(timer);
    };
  }, [intervalMs]);
  return now;
}
