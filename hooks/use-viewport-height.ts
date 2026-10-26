"use client";

import { useSyncExternalStore } from "react";

const SERVER_HEIGHT = 800;

/** Visual viewport height in px, tracking resize and URL-bar changes. */
export function useViewportHeight(): number {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange);
      return () => window.removeEventListener("resize", onChange);
    },
    () => window.innerHeight,
    () => SERVER_HEIGHT,
  );
}
