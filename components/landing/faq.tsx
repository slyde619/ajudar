"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FAQS } from "./content";

type FaqId = (typeof FAQS)[number]["id"];
const EASE = [0.22, 1, 0.36, 1] as const;

/** Landing FAQ with one answer open at a time, inline on phones and in a side panel on desktop. */
export function Faq() {
  const [open, setOpen] = useState<FaqId>(FAQS[0].id);
  const current = FAQS.find((f) => f.id === open) ?? FAQS[0];

  return (
    <div className="grid gap-4 rounded-2xl border-2 border-ink-950 bg-surface-raised p-4 md:p-8 lg:grid-cols-2 lg:gap-8">
      <div>
        <h2 id="faq-title" className="px-2 text-[40px] leading-none font-bold tracking-tighter text-ink-950 md:text-[56px]">
          Questions.
        </h2>
        <ul className="mt-6 flex flex-col gap-2">
          {FAQS.map((faq) => {
            const on = faq.id === open;
            return (
              <li key={faq.id}>
                <Button
                  variant="ghost"
                  aria-expanded={on}
                  onClick={() => setOpen(faq.id)}
                  className={cn(
                    "h-auto min-h-13 w-full justify-between gap-3 rounded-xl px-4 py-3 text-left text-base font-semibold whitespace-normal",
                    on ? "bg-ink-950 text-surface-raised hover:bg-ink-950 hover:text-surface-raised" : "bg-surface-sunken text-ink-950",
                  )}
                >
                  {faq.q}
                  <PlusIcon className={cn("size-5 transition-transform duration-300", on && "rotate-45")} aria-hidden />
                </Button>
                <AnimatePresence initial={false}>
                  {on ? (
                    <motion.div
                      key="a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden lg:hidden"
                    >
                      <p className="px-4 pt-3 pb-2 text-base leading-relaxed text-ink-950">
                        {faq.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hidden lg:block">
        <p aria-hidden className="text-[56px] leading-none font-bold tracking-tighter text-ink-950">
          Answers.
        </p>
        <div aria-live="polite" className="mt-6 min-h-72 rounded-2xl bg-scene-sand p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="text-[22px] leading-snug font-medium text-ink-950"
            >
              {current.a}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
