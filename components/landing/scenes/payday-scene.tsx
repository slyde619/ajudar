"use client";

import { motion } from "framer-motion";
import { Adaeze, Ankara, Chinedu, Handset } from "../cast";
import { useLoop } from "./use-loop";

const DIGITS = ["4", "8", "2", "9", "1", "7"];

/** Scene where the customer reads out her code and the artisan gets paid. */
export function PaydayScene({ className }: { className?: string }) {
  const { ref, still, loop } = useLoop(8);

  return (
    <svg ref={ref} viewBox="24 28 444 332" className={className} aria-hidden>
      <defs>
        <Ankara id="ankara-payday" />
      </defs>
      <rect y="300" width="480" height="60" className="fill-line-200" />

      <g transform="translate(40 40)">
        <path d="M0 14 q0 -14 14 -14 h170 q14 0 14 14 v30 q0 14 -14 14 h-130 l-18 16 v-16 h-22 q-14 0 -14 -14 z" className="fill-surface-raised" />
        {DIGITS.map((digit, i) => (
          <motion.text
            key={i}
            x={26 + i * 29}
            y="40"
            textAnchor="middle"
            className="fill-ink-950 font-sans text-[24px] font-semibold"
            initial={false}
            animate={still ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0] }}
            transition={loop(0, 0.4 + i * 0.35, 0.6 + i * 0.35, 7.6, 8)}
          >
            {digit}
          </motion.text>
        ))}
      </g>

      <g transform="translate(132 300) scale(0.95)">
        <Adaeze pattern="ankara-payday" mood="happy" arm="down" />
      </g>

      <g transform="translate(330 300) scale(0.95)">
        <Chinedu mood="happy" arm="phone" phone={<g transform="scale(1.5)"><Handset lit /></g>} />
      </g>
      <motion.g
        initial={false}
        animate={still ? { opacity: 1, y: 0 } : { opacity: [0, 0, 1, 1, 0], y: [10, 10, 0, 0, 10] }}
        transition={loop(0, 3, 3.5, 7.6, 8)}
      >
        <g transform="translate(266 44)">
          <rect width="190" height="64" rx="14" className="fill-ink-950" />
          <rect x="12" y="14" width="36" height="36" rx="9" className="fill-celo-500" />
          <path d="M22 32 l6 6 l10 -12" className="stroke-ink-950" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="58" y="28" className="fill-ink-300 font-sans text-[12px]">
            Credit alert
          </text>
          <text x="58" y="48" className="fill-surface-raised font-sans text-[19px] font-semibold">
            ₦25,000.00
          </text>
        </g>
        <g className="stroke-ink-950" strokeWidth="3" strokeLinecap="round">
          <path d="M392 130 l-6 -12 M406 126 l2 -13 M420 132 l9 -9" />
        </g>
      </motion.g>
    </svg>
  );
}
