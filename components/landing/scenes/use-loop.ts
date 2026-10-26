"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/** Plays a looping illustration only while on screen, holding its final frame under reduced motion. */
export function useLoop(seconds: number) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const still = Boolean(reduce) || !inView;
  const at = (...marks: number[]) => marks.map((mark) => mark / seconds);
  const loop = (...marks: number[]) =>
    still ? { duration: 0 } : { duration: seconds, repeat: Infinity, ease: [0.22, 1, 0.36, 1] as const, times: at(...marks) };
  return { ref, still, loop };
}

/** Shared looping clock, in seconds, that keeps a scene's parts in step. */
export function useLoopClock(seconds: number, holdAt: number) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const running = inView && !reduce;
  const clock = useMotionValue(holdAt);

  useEffect(() => {
    if (!running) {
      clock.set(holdAt);
      return;
    }
    const controls = animate(clock, [0, seconds], { duration: seconds, ease: "linear", repeat: Infinity });
    return () => controls.stop();
  }, [running, seconds, holdAt, clock]);

  return { ref, clock };
}
