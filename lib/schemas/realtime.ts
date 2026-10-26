import { z } from "zod";
import type { RealtimeEvent, RealtimeSubscription, RealtimeTopic } from "@/lib/types";

const TOPIC = /^(job|artisan|applicant):[\w-]{1,128}$/;

export const realtimeTopicSchema = z.custom<RealtimeTopic>(
  (value) => typeof value === "string" && TOPIC.test(value),
  "Unknown realtime topic.",
);

export const realtimeSubscriptionsSchema = z
  .array(z.object({ topic: realtimeTopicSchema, since: z.number().int().nonnegative() }))
  .max(20) satisfies z.ZodType<RealtimeSubscription[]>;

const realtimeEventSchema = z
  .looseObject({
    type: z.enum(["job.updated", "job.offer", "job.tracking", "job.work", "feed.request", "feed.withdrawn", "verification.updated"]),
    seq: z.number().int().nonnegative(),
    topic: realtimeTopicSchema,
    at: z.string(),
  })
  .transform((event) => event as unknown as RealtimeEvent);

export const socketMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("event"), event: realtimeEventSchema }),
  z.object({ type: z.literal("cursor"), topic: realtimeTopicSchema, cursor: z.number().int().nonnegative() }),
  z.object({ type: z.literal("resync"), topic: realtimeTopicSchema, cursor: z.number().int().nonnegative() }),
]);
