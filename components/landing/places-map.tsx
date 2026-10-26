"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPinIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLACES } from "./content";

type PlaceId = (typeof PLACES)[number]["id"];

/** Drawn map of the launch states, with chips that highlight their pins. */
export function PlacesMap() {
  const [selected, setSelected] = useState<PlaceId>("ph");
  const reduce = useReducedMotion();
  const place = PLACES.find((p) => p.id === selected) ?? PLACES[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink-950 bg-scene-creek">
        <svg viewBox="0 0 600 420" className="block w-full" aria-hidden>
          <path d="M30 110 Q110 56 226 80 Q300 94 318 160 L326 300 Q260 318 196 312 Q150 340 104 316 Q48 300 30 240 Z" className="fill-scene-mint" />
          <path d="M318 160 Q340 96 420 80 Q508 70 546 130 Q574 200 548 270 Q520 330 452 336 Q380 340 326 300 Z" className="fill-scene-sand" />
          <path d="M318 160 L326 300" className="stroke-ink-950" strokeWidth="2.5" strokeDasharray="7 7" fill="none" />
          <path d="M150 312 Q170 250 140 200 Q120 160 150 110" className="stroke-scene-creek" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M236 312 Q250 270 232 236" className="stroke-scene-creek" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M470 336 Q480 290 452 250" className="stroke-scene-creek" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M196 262 Q214 236 214 214 Q300 200 374 132 Q410 150 436 170 Q430 230 420 286" className="stroke-surface-raised" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M196 262 H262" className="stroke-surface-raised" strokeWidth="6" strokeLinecap="round" />
          <text x="76" y="150" className="fill-ink-950 font-sans text-[22px] font-bold">Rivers</text>
          <text x="440" y="120" className="fill-ink-950 font-sans text-[22px] font-bold">Akwa Ibom</text>
          <text x="200" y="396" className="fill-ink-950 font-mono text-[13px] tracking-widest uppercase opacity-60">Atlantic</text>

          {PLACES.map((p, i) => {
            const on = p.id === selected;
            return (
              <motion.g
                key={p.id}
                className="cursor-pointer"
                onClick={() => setSelected(p.id)}
                initial={reduce ? false : { y: -30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 420, damping: 22 }}
              >
                <path
                  d={`M${p.x} ${p.y} c-10 -14 -16 -20 -16 -29 a16 16 0 0 1 32 0 c0 9 -6 15 -16 29 z`}
                  className={cn("stroke-ink-950 transition-colors", on ? "fill-celo-500" : "fill-surface-raised")}
                  strokeWidth="3"
                />
                <circle cx={p.x} cy={p.y - 29} r="5" className="fill-ink-950" />
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col rounded-2xl border-2 border-ink-950 bg-surface-raised p-5 md:p-7">
        <div role="group" aria-label="Places" className="flex flex-wrap gap-2">
          {PLACES.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              aria-pressed={p.id === selected}
              onClick={() => setSelected(p.id)}
              className="h-10 rounded-pill border-2 border-ink-950 bg-surface-raised px-3.5 text-[15px] text-ink-950 aria-pressed:bg-celo-500 aria-pressed:hover:bg-celo-500"
            >
              {p.name}
            </Button>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3" aria-live="polite">
          <MapPinIcon className="mt-1 size-6 shrink-0 text-ink-950" aria-hidden />
          <div>
            <p className="text-[28px] leading-tight font-bold tracking-tight text-ink-950">{place.name}</p>
            <p className="text-base text-ink-500">{place.state} State</p>
            {place.areas.length > 0 ? (
              <p className="mt-3 text-base leading-relaxed text-ink-950">Including {place.areas.join(", ")}.</p>
            ) : null}
          </div>
        </div>
        <p className="mt-auto pt-8 text-[15px] leading-relaxed text-ink-500">
          Starting in Rivers and Akwa Ibom. More states next.
        </p>
      </div>
    </div>
  );
}
