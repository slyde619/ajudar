import { z } from "zod";
import type { CreateJobInput, CreateReviewInput, EscrowMethod, JobTiming, Urgency } from "@/lib/types";
import { idSchema, isoDateTimeSchema, koboSchema } from "./primitives";
import { jobSiteSchema } from "./location";

export const TITLE_MIN = 4;
export const DESCRIPTION_MIN = 10;
export const REASON_MIN = 3;
export const REASON_MAX = 200;
export const COUNTER_STEP = 50_000;

export const jobTimingSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("now") }),
  z.object({
    mode: z.literal("scheduled"),
    scheduledFor: isoDateTimeSchema,
    windowMinutes: z.number().int().positive().max(24 * 60),
  }),
]) satisfies z.ZodType<JobTiming>;

export const urgencySchema = z.enum(["standard", "emergency"]) satisfies z.ZodType<Urgency>;

export const jobTitleSchema = z.string().trim().min(TITLE_MIN, `Give the job a title of at least ${TITLE_MIN} characters.`).max(80);

export const jobDescriptionSchema = z
  .string()
  .trim()
  .min(DESCRIPTION_MIN, `Describe the job in at least ${DESCRIPTION_MIN} characters.`)
  .max(2000);

export const createJobInputSchema = z.object({
  categoryId: idSchema,
  title: jobTitleSchema,
  description: jobDescriptionSchema,
  site: jobSiteSchema,
  timing: jobTimingSchema,
  urgency: urgencySchema,
}) satisfies z.ZodType<CreateJobInput>;

export const createReviewInputSchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  tags: z.array(z.string().trim().min(1).max(40)).max(10),
  comment: z.string().trim().max(500).optional(),
}) satisfies z.ZodType<CreateReviewInput>;

export const escrowMethodSchema = z.enum(["card", "bank_transfer"]) satisfies z.ZodType<EscrowMethod>;

export const counterReasonSchema = z
  .string()
  .trim()
  .min(REASON_MIN, `Give a reason of at least ${REASON_MIN} characters.`)
  .max(REASON_MAX);

export const counterInputSchema = z.object({
  total: koboSchema.positive("Enter an amount."),
  reason: counterReasonSchema,
});

export const completionCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "The code is 6 digits.");
