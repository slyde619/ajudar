"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRotatingIndex } from "@/hooks/use-rotating-index";
import { GREETINGS } from "./content";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Hero line that rotates "what's broken?" through each language we serve. */
export function HeroGreeting() {
  const reduce = useReducedMotion();
  const index = useRotatingIndex(GREETINGS.length, 2600, !reduce);
  const greeting = GREETINGS[index];

  return (
    <h1 className="text-center">
      <span className="sr-only">What&apos;s broken? Verified artisans in Rivers and Akwa Ibom.</span>
      <span aria-hidden className="relative block h-[1.1em] overflow-hidden text-[46px] leading-[1.1] font-bold tracking-tighter text-ink-950 md:text-[88px] lg:text-[104px] short:text-[72px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={greeting.lang}
            lang={greeting.lang}
            className="absolute inset-x-0 top-0 whitespace-nowrap"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {greeting.text}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-hidden className="mt-2 block font-mono text-[13px] tracking-wide text-ink-500 uppercase">
        {greeting.language}
      </span>
    </h1>
  );
}
