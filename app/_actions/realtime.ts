"use server";

import { pullEvents } from "@/lib/api/realtime";
import type { RealtimeBatch, RealtimeSubscription, Result } from "@/lib/types";

export async function pullEventsAction(subscriptions: RealtimeSubscription[]): Promise<Result<RealtimeBatch>> {
  return pullEvents(subscriptions);
}
