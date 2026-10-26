"use client";

import { create } from "zustand";

export type NavDirection = "forward" | "back" | "none";

interface NavState {
  pathname: string;
  direction: NavDirection;
  scrollPositions: Map<string, number>;
  syncRoute: (nextPathname: string) => void;
  rememberScroll: (pathname: string, y: number) => void;
}

function depth(pathname: string): number {
  return pathname.split("/").filter(Boolean).length;
}

export const useNavStore = create<NavState>((set, get) => ({
  pathname: "",
  direction: "none",
  scrollPositions: new Map(),

  syncRoute: (nextPathname) => {
    const previous = get().pathname;
    if (previous === nextPathname) return;

    if (previous === "") {
      set({ pathname: nextPathname, direction: "none" });
      return;
    }

    const nextDepth = depth(nextPathname);
    const previousDepth = depth(previous);
    const direction: NavDirection =
      nextDepth > previousDepth
        ? "forward"
        : nextDepth < previousDepth
          ? "back"
          : "none";

    set({ pathname: nextPathname, direction });
  },

  rememberScroll: (pathname, y) => {
    get().scrollPositions.set(pathname, y);
  },
}));
