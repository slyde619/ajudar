import { connection } from "next/server";
import type { RealtimeBatch, RealtimeSubscription, Result } from "@/lib/types";
import { getMockRealtimeCursor, isRealtimeTopic, pullMockEvents } from "@/lib/mock/realtime";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

export async function getRealtimeCursor(): Promise<number> {
  if (isMockMode()) {
    await connection();
    return getMockRealtimeCursor();
  }
  const result = await apiRequest<{ cursor: number }>(endpoints.realtime.cursor);
  return result.ok ? result.data.cursor : 0;
}

export async function pullEvents(subscriptions: RealtimeSubscription[]): Promise<Result<RealtimeBatch>> {
  if (!isMockMode()) return fail("USE_SOCKET", "Live mode delivers events over the WebSocket.");
  const valid = subscriptions.filter(
    (entry) => isRealtimeTopic(entry.topic) && Number.isInteger(entry.since) && entry.since >= 0,
  );
  return ok(structuredClone(pullMockEvents(valid.slice(0, 20), Date.now())));
}
