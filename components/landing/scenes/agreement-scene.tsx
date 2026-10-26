"use client";

import { motion } from "framer-motion";
import { Adaeze, Ankara, Chinedu, Handset } from "../cast";
import { useLoop } from "./use-loop";

/** Scene where the agreed price lands on both phones and escrow locks. */
export function AgreementScene({ className }: { className?: string }) {
  const { ref, still, loop } = useLoop(7);

  return (
    <svg ref={ref} viewBox="40 44 410 296" className={className} aria-hidden>
      <defs>
        <Ankara id="ankara-agree" />
      </defs>
      <rect y="292" width="480" height="48" className="fill-line-200" />

      <motion.path
        d="M174 186 C 200 90, 280 90, 306 186"
        className="stroke-ink-950"
        strokeWidth="3"
        strokeDasharray="6 7"
        fill="none"
        initial={false}
        animate={still ? { pathLength: 1 } : { pathLength: [0, 0, 1, 1, 0] }}
        transition={loop(0, 0.6, 2, 6.4, 7)}
      />
      <g transform="translate(240 92)">
        <motion.path
          d="M-11 -2 v-9 a11 11 0 0 1 22 0 v9"
          className="stroke-ink-950"
          strokeWidth="5"
          fill="none"
          initial={false}
          animate={still ? { y: 0 } : { y: [-9, -9, -9, 0, 0, -9] }}
          transition={loop(0, 2, 3.2, 3.6, 6.4, 7)}
        />
        <rect x="-17" y="-3" width="34" height="27" rx="5" className="fill-ink-950" />
        <motion.rect
          x="-4"
          y="6"
          width="8"
          height="10"
          rx="2"
          className="fill-celo-500"
          initial={false}
          animate={still ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0] }}
          transition={loop(0, 3.5, 3.7, 6.4, 7)}
        />
      </g>

      <motion.g initial={false} animate={still ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0] }} transition={loop(0, 1.8, 2.4, 6.4, 7)}>
        <rect x="190" y="118" width="100" height="34" rx="17" className="fill-celo-500" />
        <text x="240" y="141" textAnchor="middle" className="fill-ink-950 font-sans text-[17px] font-semibold">
          ₦25,000
        </text>
      </motion.g>

      <g transform="translate(120 292) scale(0.95)">
        <Adaeze
          pattern="ankara-agree"
          mood="calm"
          arm="phone"
          phone={
            <g transform="scale(1.5)">
              <Handset lit />
            </g>
          }
        />
      </g>
      <g transform="translate(352 292) scale(0.95)">
        <Chinedu
          mood="happy"
          arm="phone"
          phone={
            <g transform="scale(1.5)">
              <Handset lit />
            </g>
          }
        />
      </g>
    </svg>
  );
}
