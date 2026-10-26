"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Adaeze, Ankara, Chinedu, Handset } from "../cast";
import { useLoopClock } from "./use-loop";

const LOOP = 11;
const WALK = 340;
const HOLD = 9.5;

function Bubble({ x, y, width, children }: { x: number; y: number; width: number; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-width / 2} y="0" width={width} height="44" rx="22" className="fill-surface-raised stroke-ink-950" strokeWidth="3" />
      <text x="0" y="29" textAnchor="middle" className="fill-ink-950 font-sans text-[20px] font-semibold">
        {children}
      </text>
    </g>
  );
}

const PALMS = [
  { x: 70, h: 150, lean: -14 },
  { x: 392, h: 120, lean: 10 },
  { x: 1046, h: 140, lean: -8 },
  { x: 1318, h: 170, lean: 12 },
];

const BUSHES = [
  [0, 118, "fill-scene-leaf"],
  [150, 96, "fill-scene-palm"],
  [430, 104, "fill-scene-leaf"],
  [560, 120, "fill-scene-palm"],
  [720, 96, "fill-scene-leaf"],
  [880, 112, "fill-scene-leaf"],
  [1110, 100, "fill-scene-palm"],
  [1240, 118, "fill-scene-leaf"],
  [1380, 96, "fill-scene-palm"],
] as const;

function Palm({ x, h, lean }: { x: number; h: number; lean: number }) {
  const top = 470 - h;
  const tipX = x + lean;
  return (
    <g>
      <path d={`M${x} 470 Q${x + lean * 0.2} ${top + h / 2} ${tipX} ${top}`} className="stroke-ink-700" strokeWidth="9" fill="none" strokeLinecap="round" />
      {[-150, -110, -60, -20, 30].map((deg) => (
        <path
          key={deg}
          d={`M${tipX} ${top} q24 -16 56 4 q-30 -2 -56 -4 z`}
          className="fill-scene-palm stroke-scene-palm"
          strokeWidth="10"
          strokeLinejoin="round"
          transform={`rotate(${deg} ${tipX} ${top})`}
        />
      ))}
    </g>
  );
}

/** Parallax hero skyline where a booking plays out from request to open gate. */
export function HeroScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const far = useTransform(scrollYProgress, [0.4, 1], reduce ? [0, 0] : [0, 90]);
  const mid = useTransform(scrollYProgress, [0.4, 1], reduce ? [0, 0] : [0, 40]);
  const { ref: svgRef, clock } = useLoopClock(LOOP, HOLD);
  const asking = useTransform(clock, [0, 7.9, 8, 10.8, 11], [1, 1, 0, 0, 1]);
  const waving = useTransform(clock, [0, 7.9, 8, 10.8, 11], [0, 0, 1, 1, 0]);
  const gate = useTransform(clock, [0, 7.7, 8.3, 10.2, 10.8], [1, 1, 0.12, 0.12, 1]);
  const route = useTransform(clock, [0, 2, 3.2, 10.4, 11], [0, 0, 1, 1, 0]);
  const walk = useTransform(clock, [0, 3.2, 7.4, 10.5, 10.8], [0, 0, WALK, WALK, 0]);
  const present = useTransform(clock, [0, 10.3, 10.5, 10.8, 11], [1, 1, 0, 0, 1]);
  const step = useTransform(clock, (t) => (t > 3.2 && t < 7.4 ? -4 * Math.abs(Math.sin(((t - 3.2) * Math.PI) / 0.7)) : 0));
  const request = useTransform(clock, [0.3, 0.7, 4.6, 5], [0, 1, 1, 0]);
  const accepted = useTransform(clock, [1.3, 1.7, 4.6, 5], [0, 1, 1, 0]);
  const arrived = useTransform(clock, [7.4, 7.9, 10.3, 10.6], [0, 1, 1, 0]);
  const arrivedScale = useTransform(clock, [7.4, 7.9], [0.7, 1]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <svg
        ref={svgRef}
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 block size-full md:inset-auto md:bottom-0 md:left-1/2 md:h-full md:w-auto md:-translate-x-1/2 md:overflow-visible"
        aria-hidden
      >
        <defs>
          <Ankara id="ankara-hero" />
        </defs>
        <motion.g style={{ y: far }}>
          <rect x="176" y="106" width="96" height="46" className="fill-scene-clay" />
          <rect x="222" y="62" width="3" height="46" className="fill-ink-950" />
          <rect x="236" y="74" width="3" height="34" className="fill-ink-950" />
          <rect x="120" y="150" width="210" height="330" className="fill-scene-sand" />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x="120" y={160 + i * 23} width="210" height="9" className="fill-ink-950" />
          ))}
          <rect x="214" y="150" width="6" height="330" className="fill-ink-950" />
          <rect x="96" y="160" width="24" height="320" className="fill-scene-clay" />
          {Array.from({ length: 13 }, (_, i) => (
            <path key={i} d={`M96 ${172 + i * 24} l24 10`} className="stroke-ink-950" strokeWidth="5" />
          ))}

          <path d="M448 480 L462 352 Q720 292 978 352 L992 480 Z" className="fill-scene-cloud" />
          <path d="M462 352 Q720 292 978 352" className="stroke-scene-leaf" strokeWidth="14" fill="none" />
          <path d="M470 380 Q720 330 970 380 L978 448 Q720 420 462 448 Z" className="fill-ink-950" />
          {Array.from({ length: 17 }, (_, i) => {
            const x = 488 + i * 29;
            return <path key={i} d={`M${x} 336 L${x + 10} 452`} className="stroke-scene-cloud" strokeWidth="9" />;
          })}
          <path d="M470 400 Q720 360 970 400" className="stroke-scene-cloud" strokeWidth="7" fill="none" />
          <path d="M466 424 Q720 392 974 424" className="stroke-scene-cloud" strokeWidth="7" fill="none" />
          <rect x="448" y="448" width="544" height="20" className="fill-scene-rose" />
          <rect x="448" y="462" width="544" height="6" className="fill-celo-500" />

          <path d="M1156 34 L1162 132 H1150 Z" className="fill-ink-950" />
          <rect x="1146" y="124" width="22" height="16" className="fill-scene-rose" />
          <rect x="1090" y="140" width="140" height="18" className="fill-scene-rose" />
          <rect x="1084" y="156" width="152" height="324" className="fill-scene-blue" />
          <rect x="1236" y="164" width="30" height="316" className="fill-ink-950" />
          <rect x="1084" y="156" width="182" height="10" className="fill-celo-500" />
          <rect x="1084" y="414" width="182" height="10" className="fill-celo-500" />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={1096 + i * 26} y="430" width="14" height="50" className="fill-scene-cloud" />
          ))}

          <rect x="1236" y="440" width="1644" height="40" className="fill-scene-creek" />
          <rect x="-1440" y="444" width="1536" height="36" className="fill-scene-creek" />
          <path d="M1330 452 h56 l-10 12 h-38 z" className="fill-ink-950" />
          <rect x="1352" y="438" width="3" height="14" className="fill-ink-950" />
        </motion.g>

        <motion.g style={{ y: mid }}>
          {PALMS.map((palm) => (
            <Palm key={palm.x} {...palm} />
          ))}
          {BUSHES.map(([x, w, tone]) => (
            <path
              key={x}
              d={`M${x} 500 q0 -46 ${w * 0.3} -52 q${w * 0.2} -26 ${w * 0.45} -6 q${w * 0.25} -8 ${w * 0.25} 30 q${w * 0.1} 10 0 28 z`}
              className={tone}
            />
          ))}
        </motion.g>

        <rect x="-1440" y="488" width="4320" height="14" className="fill-scene-palm" />
        <rect x="-1440" y="500" width="4320" height="26" className="fill-surface-sunken" />
        <rect x="-1440" y="524" width="4320" height="6" className="fill-line-300" />
        <rect x="-1440" y="530" width="4320" height="70" className="fill-ink-400" />
        {Array.from({ length: 52 }, (_, i) => (
          <rect key={i} x={i * 84 - 1418} y="566" width="44" height="4" rx="2" className="fill-scene-cloud" />
        ))}

        <rect x="1097" y="370" width="7" height="64" className="fill-ink-700" />
        <circle cx="1100" cy="352" r="46" className="fill-scene-leaf" />
        <circle cx="1060" cy="374" r="32" className="fill-scene-palm" />
        <circle cx="1142" cy="372" r="34" className="fill-scene-palm" />
        <path d="M968 432 L996 380 H1176 L1200 432 Z" className="fill-ink-500" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M${1004 + i * 18} 382 L${996 + i * 20} 430`} className="stroke-ink-800" strokeWidth="2" />
        ))}
        <rect x="780" y="432" width="96" height="70" className="fill-scene-peach" />
        <rect x="964" y="432" width="256" height="70" className="fill-scene-peach" />
        <rect x="776" y="424" width="102" height="10" className="fill-scene-clay" />
        <rect x="962" y="424" width="262" height="10" className="fill-scene-clay" />
        <rect x="884" y="432" width="72" height="70" className="fill-line-200" />
        <rect x="872" y="404" width="12" height="98" className="fill-scene-clay" />
        <rect x="956" y="404" width="12" height="98" className="fill-scene-clay" />
        <rect x="868" y="398" width="20" height="8" className="fill-ink-800" />
        <rect x="952" y="398" width="20" height="8" className="fill-ink-800" />
        <rect x="874" y="384" width="8" height="14" rx="2" className="fill-ink-800" />
        <circle cx="878" cy="380" r="6" className="fill-celo-500" />
        <rect x="976" y="446" width="36" height="22" rx="3" className="fill-surface-raised stroke-ink-950" strokeWidth="2" />
        <text x="994" y="462" textAnchor="middle" className="fill-ink-950 font-sans text-[14px] font-bold">
          14
        </text>

        <g transform="translate(920 502) scale(0.66)">
          <motion.g style={{ opacity: asking }}>
            <Adaeze pattern="ankara-hero" mood="calm" arm="phone" phone={<Handset lit scale={1.4} />} />
          </motion.g>
          <motion.g style={{ opacity: waving }}>
            <Adaeze pattern="ankara-hero" mood="happy" arm="wave" />
          </motion.g>
        </g>

        <motion.g
          style={{ scaleX: gate, originX: "884px", originY: "0px", transformBox: "view-box" }}
        >
          <rect x="884" y="416" width="72" height="5" className="fill-ink-950" />
          <rect x="884" y="470" width="72" height="5" className="fill-ink-950" />
          {[888, 900, 912, 924, 936, 948].map((x) => (
            <rect key={x} x={x} y="410" width="4" height="92" className="fill-ink-950" />
          ))}
        </motion.g>

        <motion.path
          d="M500 392 Q710 250 920 366"
          className="stroke-ink-950"
          strokeWidth="4"
          strokeDasharray="10 10"
          fill="none"
          style={{ pathLength: route }}
        />
        <circle cx="920" cy="366" r="8" className="fill-celo-500 stroke-ink-950" strokeWidth="3" />

        <motion.g style={{ x: walk, opacity: present }}>
          <motion.g style={{ y: step }}>
            <g transform="translate(500 518) scale(0.72)">
              <Chinedu mood="happy" arm="box" />
            </g>
          </motion.g>
        </motion.g>

        <motion.g style={{ opacity: request }}>
          <Bubble x={886} y={306} width={244}>
            Leaking tap · ₦25,000
          </Bubble>
        </motion.g>
        <motion.g style={{ opacity: accepted }}>
          <Bubble x={520} y={320} width={170}>
            Accepted ✓
          </Bubble>
        </motion.g>
        <motion.g style={{ opacity: arrived, scale: arrivedScale, originX: "710px", originY: "254px", transformBox: "view-box" }}>
          <g transform="translate(710 230)">
            <rect x="-150" y="0" width="300" height="48" rx="24" className="fill-ink-950" />
            <circle cx="-122" cy="24" r="15" className="fill-celo-500" />
            <path d="M-129 24 l5 5 l9 -10" className="stroke-ink-950" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x="-96" y="31" className="fill-surface-raised font-sans text-[20px] font-semibold">
              Arrived · face matched
            </text>
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
