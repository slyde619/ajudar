"use client";

import { useEffect, useState } from "react";

/** Cycles an index on an interval while running. */
export function useRotatingIndex(count: number, intervalMs: number, running = true): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!running || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs, running]);
  return index;
}
