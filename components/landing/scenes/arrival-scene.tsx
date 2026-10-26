"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Adaeze, Ankara, Chinedu, Keke } from "../cast";

const LOOP = 10;
const at = (...seconds: number[]) => seconds.map((s) => s / LOOP);

/** Looping scene of the artisan arriving and the gate opening. */
export function ArrivalScene({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const still = useReducedMotion() || !inView;
  const loop = { duration: LOOP, repeat: Infinity, ease: "easeInOut" } as const;

  return (
    <svg ref={ref} viewBox="-190 24 670 336" className={className} aria-hidden>
      <defs>
        <Ankara id="ankara-arrival" />
        <clipPath id="gateway">
          <rect x="290" y="128" width="110" height="164" />
        </clipPath>
      </defs>

      <rect x="-190" y="290" width="670" height="70" className="fill-line-200" />
      <rect x="-176" y="196" width="150" height="96" className="fill-surface-sunken" />
      <path d="M-186 200 L-150 160 L-30 160 L-14 200 Z" className="fill-ink-500" />
      <rect x="-150" y="222" width="26" height="30" rx="2" className="fill-ink-800" />
      <rect x="-96" y="232" width="30" height="60" rx="2" className="fill-ink-800" />
      <rect x="20" y="70" width="7" height="222" className="fill-ink-800" />
      <rect x="6" y="80" width="35" height="5" className="fill-ink-800" />
      <path d="M-190 96 Q -84 124 23 84 Q 250 128 480 92" className="stroke-ink-800" strokeWidth="1.6" fill="none" />
      <path d="M-190 108 Q -84 134 23 84 Q 250 138 480 104" className="stroke-ink-800" strokeWidth="1.6" fill="none" />
      <g transform="translate(-10 0)">
        <rect x="58" y="246" width="56" height="46" className="fill-ink-950" />
        <rect x="84" y="196" width="4" height="52" className="fill-ink-950" />
        <path d="M44 204 Q86 168 128 204 Z" className="fill-celo-500" />
        <path d="M58 204 Q72 186 86 182 M114 204 Q100 186 86 182" className="stroke-ink-950" strokeWidth="2" fill="none" />
      </g>
      <rect x="170" y="120" width="310" height="172" className="fill-surface-sunken" />
      <rect x="170" y="114" width="310" height="10" rx="2" className="fill-line-300" />
      <path d="M300 114 L346 70 L470 70 L470 114 Z" className="fill-ink-800" />
      <rect x="378" y="82" width="22" height="20" rx="2" className="fill-celo-500" />
      <rect x="205" y="44" width="6" height="74" className="fill-ink-800" />
      <path d="M208 48 q-30 -6 -40 10 M208 48 q30 -8 40 6 M208 46 q-12 -24 -2 -36 M208 46 q16 -20 6 -34" className="stroke-ink-800" strokeWidth="5" strokeLinecap="round" fill="none" />

      <rect x="290" y="128" width="110" height="164" className="fill-surface-raised" />
      <g clipPath="url(#gateway)">
        <motion.g
          initial={false}
          animate={still ? { opacity: 1, y: 0 } : { opacity: [1, 1, 0, 0, 1, 1], y: [0, 0, 12, 12, 0, 0] }}
          transition={still ? { duration: 0 } : { ...loop, times: at(0, 3, 3.4, 8.1, 8.6, 10) }}
        >
          <g transform="translate(340 291) scale(0.78)">
            <Adaeze pattern="ankara-arrival" mood="happy" arm="wave" />
          </g>
        </motion.g>
      </g>
      <rect x="283" y="118" width="8" height="174" className="fill-ink-950" />
      <rect x="399" y="118" width="8" height="174" className="fill-ink-950" />
      <motion.g
        style={{ originX: "291px", originY: "0px", transformBox: "view-box" }}
        initial={false}
        animate={still ? { scaleX: 0.1 } : { scaleX: [0.1, 0.1, 1, 1, 0.1, 0.1] }}
        transition={still ? { duration: 0 } : { ...loop, times: at(0, 3.2, 3.8, 7.4, 8.1, 10) }}
      >
        <rect x="291" y="134" width="108" height="5" className="fill-ink-950" />
        {[298, 313, 328, 343, 358, 373, 388].map((x) => (
          <rect key={x} x={x} y="128" width="4" height="164" className="fill-ink-950" />
        ))}
        <rect x="291" y="206" width="108" height="26" className="fill-ink-800" />
      </motion.g>

      <motion.g
        initial={false}
        animate={still ? { x: 700 } : { x: [-460, -460, 700, 700] }}
        transition={still ? { duration: 0 } : { ...loop, ease: "linear", times: at(0, 3.2, 5.6, 10) }}
      >
        <g transform="translate(0 316) scale(1.8)">
          <Keke />
        </g>
      </motion.g>

      <motion.g
        initial={false}
        animate={still ? { x: 236, opacity: 1 } : { x: [236, 236, 236, -240, -240, 236, 236], opacity: [1, 1, 0, 0, 1, 1, 1] }}
        transition={still ? { duration: 0 } : { ...loop, times: at(0, 2.8, 3.2, 3.3, 4.8, 7.4, 10), ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.g
          initial={false}
          animate={still ? { y: 0 } : { y: [0, -3, 0] }}
          transition={still ? { duration: 0 } : { duration: 0.45, repeat: Infinity }}
        >
          <g transform="translate(0 338) scale(0.86)">
            <Chinedu mood="happy" arm="box" />
          </g>
        </motion.g>
      </motion.g>
    </svg>
  );
}
