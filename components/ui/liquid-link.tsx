import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

// New primitive: the goo filter needs a shape layer under the label, which a Button variant can't express.

const TONES = {
  celo: { fill: "bg-celo-500", text: "text-ink-950" },
  ink: { fill: "bg-ink-950", text: "text-surface-raised" },
  light: { fill: "bg-surface-raised", text: "text-ink-950" },
} as const;

type LiquidTone = { tone?: keyof typeof TONES };

const MOVE = "transition-transform duration-500 ease-out-quint";
const PILL_SHIFT = "group-hover/liquid:-translate-x-3 group-focus-visible/liquid:-translate-x-3";
const KNOB_SHIFT = "group-hover/liquid:translate-x-3 group-focus-visible/liquid:translate-x-3";
const KNOB = "-ml-3 size-13 rounded-full";

/** Pill and arrow knob that pull apart with a liquid joint when a `group/liquid` ancestor is hovered or focused. */
function LiquidFace({ tone = "celo", children, className }: LiquidTone & { children: React.ReactNode; className?: string }) {
  const goo = `liquid${useId()}`;
  const { fill, text } = TONES[tone];

  return (
    <span className={cn("relative isolate inline-flex h-13 items-center", text, MOVE, className)}>
      <span aria-hidden className="absolute inset-0 flex" style={{ filter: `url(#${goo})` }}>
        <span className={cn("h-full flex-1 rounded-pill", fill, MOVE, PILL_SHIFT)} />
        <span className={cn(KNOB, fill, MOVE, KNOB_SHIFT)} />
      </span>
      <span className={cn("relative px-6 text-base font-semibold whitespace-nowrap", MOVE, PILL_SHIFT)}>
        {children}
      </span>
      <span aria-hidden className={cn("relative grid place-items-center", KNOB, MOVE, KNOB_SHIFT)}>
        <ArrowRightIcon className="size-5" />
      </span>
      <svg aria-hidden className="absolute size-0">
        <filter id={goo} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
    </span>
  );
}

/** Landing CTA in the liquid pill shape: a real link, so it is announced and listed as one. */
function LiquidLink({ tone, className, children, ...props }: React.ComponentProps<typeof Link> & LiquidTone) {
  return (
    <Link
      data-slot="liquid-link"
      className={cn(
        "group/liquid inline-flex shrink-0 rounded-pill transition-transform duration-100 ease-out select-none active:scale-[0.97]",
        className,
      )}
      {...props}
    >
      <LiquidFace tone={tone}>{children}</LiquidFace>
    </Link>
  );
}

export { LiquidFace, LiquidLink };
