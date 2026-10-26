"use client";

import { useCountUp } from "@/hooks/use-count-up";
import { formatNaira } from "@/lib/utils/money";

const FORMATS = {
  naira: (kobo: number) => formatNaira(Math.round(kobo / 100) * 100),
  plain: (value: number) => value.toLocaleString("en-NG"),
} as const;

interface CountUpNumberProps {
  value: number;
  format?: keyof typeof FORMATS;
  durationMs?: number;
  delayMs?: number;
  className?: string;
}

/** Animated count-up for the estimate reveal, announced once to screen readers. */
export function CountUpNumber({ value, format = "plain", durationMs, delayMs, className }: CountUpNumberProps) {
  const current = useCountUp(value, durationMs, delayMs);
  const render = FORMATS[format];
  return (
    <span className={className}>
      <span aria-hidden data-tabular>{render(current)}</span>
      <span className="sr-only">{render(value)}</span>
    </span>
  );
}
