"use client";

import { useEffect, useState } from "react";

const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

/** Animates an integer from 0 to a target once on mount. */
export function useCountUp(target: number, durationMs = 900, delayMs = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : durationMs;
    let frame = 0;
    let start: number | null = null;
    const step = (time: number) => {
      start ??= time + delayMs;
      const t = duration === 0 ? 1 : Math.min(Math.max((time - start) / duration, 0), 1);
      setValue(Math.round(target * easeOutQuint(t)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, delayMs]);

  return value;
}
