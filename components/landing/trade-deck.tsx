"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { LiquidLink } from "@/components/ui/liquid-link";
import { cn } from "@/lib/utils";
import { TRADES, type TradeTone } from "./content";
import { TradeArt } from "./trade-art";

const TONE: Record<TradeTone, string> = {
  blue: "bg-scene-blue",
  sand: "bg-scene-sand",
  mint: "bg-scene-mint",
  peach: "bg-scene-peach",
  lilac: "bg-scene-lilac",
  rose: "bg-scene-rose",
};

/** Deck of trade cards that stack on phones and open as panels on desktop. */
export function TradeDeck() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(TRADES.length - 1, Math.max(0, Math.floor(p * TRADES.length))));
  });

  return (
    <div ref={ref} className="lg:h-[420svh]">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center">
        <ol className="flex w-full flex-col gap-4 lg:h-[72svh] lg:flex-row lg:gap-3">
          {TRADES.map((trade, i) => {
            const open = i === active;
            return (
              <li
                key={trade.id}
                data-open={open}
                style={{ top: `${16 + i * 14}px` }}
                className={cn(
                  "group sticky min-h-[64svh] overflow-hidden rounded-2xl border-2 border-ink-950 p-6 text-ink-950 lg:relative lg:top-0! lg:min-h-0 lg:min-w-0 lg:p-8",
                  "lg:transition-[flex-grow,flex-basis] lg:duration-500 lg:ease-out-quint",
                  open ? "lg:grow lg:basis-0" : "lg:grow-0 lg:basis-20",
                  TONE[trade.tone],
                )}
              >
                <p
                  aria-hidden
                  className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 rotate-180 text-[40px] font-bold tracking-tight whitespace-nowrap opacity-60 [writing-mode:vertical-rl] lg:group-data-[open=false]:block"
                >
                  {trade.label}
                </p>

                <div className="flex h-full flex-col lg:w-[min(34rem,calc(100vw-38rem))] lg:group-data-[open=false]:invisible">
                  <h3 className="text-[34px] leading-none font-bold tracking-tight md:text-[48px]">{trade.label}</h3>
                  <p className="mt-3 max-w-sm text-lg leading-snug">{trade.line}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {trade.jobs.map((job) => (
                      <li key={job}>
                        <Badge variant="outline" className="h-auto border-2 border-ink-950 bg-surface-raised px-3 py-1 text-[15px] text-ink-950">
                          {job}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <LiquidLink tone="light" href="/signup?as=customer">
                      {trade.book}
                    </LiquidLink>
                    <TradeArt id={trade.id} className="w-44 shrink-0 md:w-56" />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
