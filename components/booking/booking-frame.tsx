import { XIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BOOKING_STEPS = ["Describe", "Estimate", "Offers", "Agree", "Pay"] as const;
export type BookingStep = (typeof BOOKING_STEPS)[number];

interface BookingFrameProps {
  step?: string;
  steps?: readonly string[];
  progressLabel?: string;
  label?: string;
  closeHref: string;
  closeLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Full-screen flow chrome with step progress, one way out and a thumb-zone action bar. */
export function BookingFrame({
  step,
  steps = BOOKING_STEPS,
  progressLabel = "Booking progress",
  label,
  closeHref,
  closeLabel = "Close",
  children,
  footer,
  className,
}: BookingFrameProps) {
  const index = step ? steps.indexOf(step) : -1;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-10 bg-background/90 pt-safe backdrop-blur-xl">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Link
            href={closeHref}
            aria-label={closeLabel}
            className="flex size-11 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-surface-sunken"
          >
            <XIcon className="size-5" aria-hidden />
          </Link>
          <p className="flex-1 text-center font-mono text-[11px] tracking-widest text-ink-500 uppercase">
            {step ? (
              <>
                <span className="text-ink-950" data-tabular>
                  {index + 1}/{steps.length}
                </span>{" "}
                · {step}
              </>
            ) : (
              label
            )}
          </p>
          <span className="size-11" aria-hidden />
        </div>
        {step ? (
          <ol className="flex gap-1 px-5 pb-3" aria-label={progressLabel}>
            {steps.map((name, i) => (
              <li
                key={name}
                aria-current={i === index ? "step" : undefined}
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors duration-300",
                  i < index ? "bg-ink-950" : i === index ? "bg-ink-700" : "bg-line-200",
                )}
              >
                <span className="sr-only">{name}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </header>

      <div className={cn("flex flex-1 flex-col px-5 pt-4 pb-6", className)}>{children}</div>

      {footer ? (
        <div className="sticky bottom-0 bg-linear-to-t from-background from-70% to-transparent px-5 pt-6 pb-safe">
          <div className="pb-4">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
