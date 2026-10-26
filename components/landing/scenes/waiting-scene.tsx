"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CheckCheck } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AdaezeWaiting, Ankara, Handset, type Mood } from "../cast";
import { Reveal, RevealItem } from "../reveal";

const START = 9;
const END = 19.5;

const MESSAGES = [
  { at: 9.03, time: "9:02am", from: "him", text: "Good morning ma. I dey come." },
  { at: 11.67, time: "11:40am", from: "him", text: "I'm on the way ma." },
  { at: 13.25, time: "1:15pm", from: "him", text: "Small traffic for Rumuokoro." },
  { at: 16.5, time: "4:30pm", from: "him", text: "Ma, make it tomorrow morning. First thing." },
  { at: 19.08, time: "7:05pm", from: "her", text: "Are you still coming?" },
] as const;

const SKY = ["#FFFFFF", "#FEFFD9", "#6B625A", "#26241F"];

function moodAt(hour: number): Mood {
  if (hour < 11) return "calm";
  if (hour < 16) return "worried";
  return "tired";
}

/** Scroll-driven scene of a day spent waiting for an artisan who never comes. */
export function WaitingScene() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const [hour, setHour] = useState(START);

  useMotionValueEvent(scrollYProgress, "change", (p) => setHour(START + p * (END - START)));

  const hourTurn = useTransform(scrollYProgress, [0, 1], [270, 270 + ((END - START) / 12) * 360]);
  const minuteTurn = useTransform(scrollYProgress, [0, 1], [0, (END - START) * 360]);
  const sky = useTransform(scrollYProgress, [0, 0.45, 0.8, 1], SKY);
  const lamp = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);

  const shown = MESSAGES.filter((m) => hour >= m.at);
  const lit = shown.some((m) => hour - m.at < 0.5 && m.from === "him");

  return (
    <>
    <section aria-labelledby="waiting-title" className="sticky top-0 h-svh overflow-hidden rounded-2xl border-2 border-ink-950 bg-surface-warm">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-5 px-5 py-6 lg:grid lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12 md:px-8">
        <div>
          <Reveal>
            <RevealItem>
              <h2 id="waiting-title" className="text-[34px] leading-[1.05] font-semibold tracking-tight text-ink-950 md:text-[52px]">
                Heard &ldquo;I dey come&rdquo; before?
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-3 max-w-lg text-lg leading-relaxed text-ink-950">
                A whole Saturday at home, the tap still dripping, and no way to know if anyone is really coming.
              </p>
            </RevealItem>
          </Reveal>
          <svg viewBox="0 0 480 360" className="mt-4 w-full max-lg:max-h-[34svh]" aria-hidden>
            <defs>
              <Ankara id="ankara-waiting" />
            </defs>
            <rect width="480" height="360" className="fill-surface-sunken" />
            <rect y="318" width="480" height="42" className="fill-line-200" />

            <rect x="296" y="40" width="150" height="128" rx="4" className="fill-ink-950" />
            <motion.rect x="303" y="47" width="136" height="114" style={{ fill: sky }} />
            <path d="M303 140 h40 v-22 h30 v22 h20 v-30 h46 v51 h-136 z" className="fill-ink-500" opacity="0.5" />
            <path d="M303 70 q68 22 136 0" className="stroke-ink-800" strokeWidth="1.5" fill="none" />
            <rect x="368" y="47" width="5" height="114" className="fill-ink-950" />

            <circle cx="104" cy="88" r="38" className="fill-surface-raised" />
            <circle cx="104" cy="88" r="38" className="stroke-ink-950" strokeWidth="5" fill="none" />
            {[0, 90, 180, 270].map((deg) => (
              <rect key={deg} x="102.5" y="55" width="3" height="7" className="fill-ink-950" transform={`rotate(${deg} 104 88)`} />
            ))}
            <motion.g style={{ rotate: hourTurn, originX: "104px", originY: "88px", transformBox: "view-box" }}>
              <rect x="101.5" y="66" width="5" height="25" rx="2.5" className="fill-ink-950" />
            </motion.g>
            <motion.g style={{ rotate: minuteTurn, originX: "104px", originY: "88px", transformBox: "view-box" }}>
              <rect x="102.5" y="58" width="3" height="33" rx="1.5" className="fill-ink-800" />
            </motion.g>
            <circle cx="104" cy="88" r="4" className="fill-celo-500" />

            <rect x="8" y="238" width="62" height="80" className="fill-ink-800" />
            <rect x="2" y="228" width="74" height="12" rx="3" className="fill-ink-950" />
            <path d="M36 228 v-26 h18 v8" className="stroke-ink-500" strokeWidth="6" strokeLinecap="round" fill="none" />
            <motion.circle
              cx="54"
              cy="216"
              r="3"
              className="fill-ink-500"
              initial={false}
              animate={reduce ? { opacity: 0 } : { y: [0, 0, 10], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, times: [0, 0.6, 1], ease: "easeIn" }}
            />

            <motion.path d="M218 126 L196 186 H268 L246 126 Z" className="fill-celo-200" style={{ opacity: lamp }} />
            <rect x="230" y="40" width="4" height="74" className="fill-ink-950" />
            <path d="M216 128 l6 -16 h20 l6 16 z" className="fill-ink-950" />

            <g transform="translate(140 248) scale(1.3)">
              <rect x="28" y="-22" width="140" height="6" rx="2" className="fill-ink-950" />
              <rect x="40" y="-16" width="5" height="70" className="fill-ink-950" />
              <rect x="152" y="-16" width="5" height="70" className="fill-ink-950" />
              <g transform="translate(118 -28) rotate(-90) scale(0.45)">
                <Handset lit={lit} />
              </g>
              <AdaezeWaiting pattern="ankara-waiting" mood={moodAt(hour)} />
            </g>
          </svg>
        </div>

        <ol aria-label="Messages that day" className="flex min-h-[38svh] flex-col justify-end gap-2.5 lg:min-h-[60svh]">
          {MESSAGES.map((m, i) => {
            const visible = hour >= m.at;
            const crowded = i < shown.length - 3;
            return (
              <li
                key={m.time}
                className={cn(
                  "max-w-[85%] transition-[opacity,translate] duration-300 ease-out-quint motion-reduce:transition-none",
                  m.from === "her" ? "self-end" : "self-start",
                  visible ? "translate-y-0 opacity-100" : "pointer-events-none hidden translate-y-2 opacity-0",
                  crowded && "max-lg:hidden",
                )}
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl text-[16px] leading-snug",
                    m.from === "her" ? "rounded-br-md bg-ink-950 text-surface-raised" : "rounded-bl-md bg-surface-raised text-ink-950",
                  )}
                >
                  <p className="px-3.5 py-2.5">{m.text}</p>
                </div>
                <p className={cn("mt-1 flex items-center gap-1 px-1 text-[13px] text-ink-500", m.from === "her" && "justify-end")}>
                  {m.time}
                  {m.from === "her" ? (
                    <>
                      <CheckCheck className="size-3.5" aria-hidden />
                      Delivered. No reply.
                    </>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
    <div ref={ref} aria-hidden className="h-[140svh]" />
    </>
  );
}
