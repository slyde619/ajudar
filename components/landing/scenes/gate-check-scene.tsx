"use client";

import { motion } from "framer-motion";
import { Adaeze, Ankara, Chinedu } from "../cast";
import { useLoop } from "./use-loop";

/** Scene where the customer's phone matches the artisan's face at the gate. */
export function GateCheckScene({ className }: { className?: string }) {
  const { ref, still, loop } = useLoop(8);

  return (
    <svg ref={ref} viewBox="20 12 430 348" className={className} aria-hidden>
      <defs>
        <Ankara id="ankara-gate" />
        <clipPath id="match-face">
          <circle cx="0" cy="0" r="30" />
        </clipPath>
      </defs>
      <rect y="300" width="480" height="60" className="fill-line-200" />

      <g transform="translate(150 300) scale(0.9)">
        <motion.g initial={false} animate={still ? { opacity: 0 } : { opacity: [1, 1, 0, 0, 1] }} transition={loop(0, 3.3, 3.35, 7.9, 7.95)}>
          <Adaeze pattern="ankara-gate" mood="worried" arm="down" />
        </motion.g>
        <motion.g initial={false} animate={still ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0] }} transition={loop(0, 3.3, 3.35, 7.9, 7.95)}>
          <Adaeze pattern="ankara-gate" mood="happy" arm="wave" />
        </motion.g>
      </g>

      <rect x="232" y="128" width="8" height="172" className="fill-ink-950" />
      <motion.g initial={false} animate={still ? { x: 96 } : { x: [0, 0, 96, 96, 0] }} transition={loop(0, 3.8, 5, 7.4, 8)}>
        <rect x="240" y="140" width="56" height="5" className="fill-ink-950" />
        {[244, 258, 272, 286].map((x) => (
          <rect key={x} x={x} y="134" width="4" height="166" className="fill-ink-950" />
        ))}
        <rect x="240" y="206" width="56" height="20" className="fill-ink-800" />
      </motion.g>

      <g transform="translate(338 300) scale(0.9)">
        <Chinedu mood="calm" arm="box" />
      </g>

      <g transform="translate(78 92)">
        <rect x="-44" y="-70" width="88" height="140" rx="14" className="fill-ink-950" />
        <rect x="-38" y="-60" width="76" height="118" rx="8" className="fill-surface-raised" />
        <g transform="translate(0 -12)">
          <circle r="30" className="fill-celo-100" />
          <g clipPath="url(#match-face)">
            <g transform="translate(2 148) scale(0.9)">
              <Chinedu mood="calm" arm="down" />
            </g>
          </g>
          <motion.circle
            r="34"
            className="stroke-ink-950"
            strokeWidth="3"
            fill="none"
            strokeDasharray="30 184"
            style={{ originX: "0px", originY: "0px" }}
            initial={false}
            animate={still ? { opacity: 0 } : { rotate: [0, 0, 720, 720, 720], opacity: [0, 1, 1, 0, 0] }}
            transition={loop(0, 0.6, 2.6, 2.8, 8)}
          />
          <motion.g initial={false} animate={still ? { opacity: 1, scale: 1 } : { opacity: [0, 0, 1, 1, 0], scale: [0.6, 0.6, 1, 1, 0.6] }} transition={loop(0, 2.8, 3.2, 7.6, 8)}>
            <circle cx="22" cy="22" r="11" className="fill-success-600" />
            <path d="M17 22 l4 4 l7 -8" className="stroke-surface-raised" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </g>
        <rect x="-26" y="30" width="52" height="5" rx="2.5" className="fill-ink-950" />
        <rect x="-18" y="40" width="36" height="4" rx="2" className="fill-line-300" />
      </g>
    </svg>
  );
}
