import { cn } from "@/lib/utils";

const STEPS = ["Accepted", "On the way", "Arrived", "Working", "Done"] as const;

export type JobProgressStep = (typeof STEPS)[number];

interface JobProgressProps {
  current: JobProgressStep;
  className?: string;
}

/** Pure. Segments up to the current step fill yellow (§4.2: progress bar). */
export function JobProgress({ current, className }: JobProgressProps) {
  const currentIndex = STEPS.indexOf(current);

  return (
    <div className={className}>
      <ol className="grid grid-cols-5 gap-1" aria-label="Job progress">
        {STEPS.map((step, index) => (
          <li key={step} aria-current={index === currentIndex ? "step" : undefined}>
            <span
              aria-hidden
              className={cn(
                "block h-1.5 rounded-pill transition-colors duration-300",
                index < currentIndex && "bg-ink-950",
                index === currentIndex && "bg-celo-500 ring-1 ring-ink-950/15 ring-inset",
                index > currentIndex && "bg-line-200",
              )}
            />
            <span
              className={cn(
                "mt-1.5 block truncate text-[10px] leading-none",
                index === currentIndex ? "font-semibold text-ink-950" : "text-ink-400",
              )}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
