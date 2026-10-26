"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { MoneyIcon, KeyIcon, LockIcon, NavigationArrowIcon, UserFocusIcon, UserCheckIcon } from "@phosphor-icons/react/ssr";
import { useRef } from "react";
import { useRotatingIndex } from "@/hooks/use-rotating-index";
import { PROOF_FEED } from "./content";

const ICON = { match: UserCheckIcon, price: LockIcon, route: NavigationArrowIcon, gate: UserFocusIcon, code: KeyIcon, paid: MoneyIcon } as const;
const SHOWN = 3;

/** Feed of job notifications that arrive one by one while on screen. */
export function ProofFeed({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const step = useRotatingIndex(PROOF_FEED.length, 1900, inView && !reduce);
  const last = reduce ? PROOF_FEED.length - 1 : step;
  const visible = PROOF_FEED.slice(Math.max(0, last - SHOWN + 1), last + 1).reverse();

  return (
    <div ref={ref} className={className} aria-hidden>
      <ol className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item, i) => {
            const Icon = ICON[item.id];
            return (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: -24, scale: 0.96 }}
                animate={{ opacity: 1 - i * 0.22, y: 0, scale: 1 - i * 0.03 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 rounded-2xl bg-surface-raised p-3.5 text-ink-950 shadow-pop"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-celo-500">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold">{item.title}</span>
                  <span className="block truncate text-[14px] text-ink-500">{item.detail}</span>
                </span>
                <span className="ml-auto self-start font-mono text-[12px] text-ink-400">now</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}
