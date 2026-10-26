"use server";

import { pullEvents } from "@/lib/api/realtime";
import { parseInput } from "@/lib/schemas/primitives";
import { realtimeSubscriptionsSchema } from "@/lib/schemas/realtime";
import type { RealtimeBatch, RealtimeSubscription, Result } from "@/lib/types";

export async function pullEventsAction(subscriptions: RealtimeSubscription[]): Promise<Result<RealtimeBatch>> {
  const parsed = parseInput(realtimeSubscriptionsSchema, subscriptions);
  if (!parsed.ok) return { ok: false, error: { code: "INVALID_INPUT", message: parsed.error } };
  return pullEvents(parsed.data);
}
