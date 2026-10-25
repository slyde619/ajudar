"use client";

import { useEffect, useState } from "react";
import { fetchLgaBoundaries } from "@/lib/api/geo";
import type { LgaBoundary } from "@/lib/types";

type BoundariesState =
  | { status: "loading" }
  | { status: "ready"; boundaries: LgaBoundary[] }
  | { status: "error"; message: string };

/** One request per session; every consumer shares it. */
let shared: Promise<BoundariesState> | null = null;

function load(): Promise<BoundariesState> {
  shared ??= fetchLgaBoundaries().then((result) => {
    if (result.ok) return { status: "ready", boundaries: result.data } as const;
    shared = null; // allow a retry on the next mount
    return { status: "error", message: result.error.message } as const;
  });
  return shared;
}

export function useLgaBoundaries(): BoundariesState {
  const [state, setState] = useState<BoundariesState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    load().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
