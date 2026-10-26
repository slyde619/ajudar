"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useRealtime } from "@/hooks/use-realtime";
import type { RealtimeEventType, RealtimeTopic } from "@/lib/types";

interface RealtimeRefreshProps {
  topic: RealtimeTopic;
  since: number;
  types?: RealtimeEventType[];
}

/** Re-renders the current server route when its realtime topic changes. */
export function RealtimeRefresh({ topic, since, types }: RealtimeRefreshProps) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const schedule = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => router.refresh(), 120);
  };

  useRealtime(
    topic,
    since,
    (event) => {
      if (!types || types.includes(event.type)) schedule();
    },
    schedule,
  );

  return null;
}
