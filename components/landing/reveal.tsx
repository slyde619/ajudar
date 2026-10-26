"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.23, 1, 0.32, 1] as const;

const ITEM: Variants = {
  hidden: { opacity: 0, transform: "translateY(20px)", filter: "blur(6px)" },
  shown: { opacity: 1, transform: "translateY(0px)", filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

const ITEM_STILL: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

/** Staggered scroll-in entrance for a section's children. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -8% 0px" }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.06 } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? ITEM_STILL : ITEM}>
      {children}
    </motion.div>
  );
}
