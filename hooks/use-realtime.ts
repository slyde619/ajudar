"use client";

import { useEffect, useEffectEvent } from "react";
import { pullEventsAction } from "@/app/_actions/realtime";
import { getApiMode, getRealtimeSocketUrl } from "@/lib/api/client";
import { pollingTransport, RealtimeHub, socketTransport } from "@/lib/api/realtime-client";
import type { RealtimeEvent, RealtimeTopic } from "@/lib/types";

let hub: RealtimeHub | null = null;

function getHub(): RealtimeHub {
  if (!hub) {
    const url = getRealtimeSocketUrl();
    hub = new RealtimeHub(
      getApiMode() === "live" && url ? socketTransport(url) : pollingTransport(pullEventsAction),
    );
  }
  return hub;
}

/** Listens to one realtime topic from the server render's cursor. */
export function useRealtime(
  topic: RealtimeTopic | null,
  since: number,
  onEvent: (event: RealtimeEvent) => void,
  onResync: () => void,
): void {
  const handleEvent = useEffectEvent(onEvent);
  const handleResync = useEffectEvent(onResync);

  useEffect(() => {
    if (!topic) return;
    return getHub().subscribe(topic, since, {
      onEvent: (event) => handleEvent(event),
      onResync: () => handleResync(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);
}
