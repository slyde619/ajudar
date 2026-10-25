"use client";

import { useSyncExternalStore } from "react";

/** SSR renders the mobile layout (`false`), then hydrates to the truth. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const DESKTOP_QUERY = "(min-width: 1024px)";
