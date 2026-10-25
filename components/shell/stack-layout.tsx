"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useNavStore, type NavDirection } from "@/stores/nav";

const EASE = [0.22, 1, 0.36, 1] as const;

function depth(pathname: string): number {
  return pathname.split("/").filter(Boolean).length;
}

function directionBetween(
  previousPathname: string,
  nextPathname: string,
): NavDirection {
  const previousDepth = depth(previousPathname);
  const nextDepth = depth(nextPathname);
  if (nextDepth > previousDepth) return "forward";
  if (nextDepth < previousDepth) return "back";
  return "none";
}

/**
 * Direction-aware push/pop. State is adjusted during render (the documented
 * React pattern) so the entering page gets the right offset on its first
 * committed frame without mutating refs or reading the DOM.
 */
export function StackLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const syncRoute = useNavStore((state) => state.syncRoute);
  const reduceMotion = useReducedMotion();

  const [previousPathname, setPreviousPathname] = useState(pathname);
  const [direction, setDirection] = useState<NavDirection>("none");

  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setDirection(directionBetween(previousPathname, pathname));
  }

  useEffect(() => {
    syncRoute(pathname);
  }, [pathname, syncRoute]);

  const offset = reduceMotion
    ? 0
    : direction === "forward"
      ? 28
      : direction === "back"
        ? -28
        : 0;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        className="w-full"
        initial={reduceMotion ? false : { opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -offset }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
