"use client";

import { useNow } from "@/hooks/use-now";
import type { IsoDateTime } from "@/lib/types";

/** Shows one node until a given time, then another. */
export function SwitchAt({ at, before, after }: { at: IsoDateTime; before: React.ReactNode; after: React.ReactNode }) {
  const now = useNow(1000);
  return now !== null && now >= Date.parse(at) ? after : before;
}
