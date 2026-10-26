import { z } from "zod";
import type { JobSite, LocationState } from "@/lib/types";
import { coordinatesSchema, isoDateTimeSchema, lgaCodeSchema } from "./primitives";

export const LANDMARK_MIN = 8;
export const LANDMARK_MAX = 140;

export const landmarkSchema = z
  .string()
  .trim()
  .min(LANDMARK_MIN, `Give directions of at least ${LANDMARK_MIN} characters.`)
  .max(LANDMARK_MAX);

export const jobSiteSchema = coordinatesSchema.extend({
  lgaCode: lgaCodeSchema,
  landmark: landmarkSchema,
  pinConfirmedByUser: z.boolean(),
  accuracyM: z.number().nonnegative().optional(),
  savedLabel: z.enum(["home", "work", "other"]).optional(),
  plusCode: z.string().max(16).optional(),
}) satisfies z.ZodType<JobSite>;

export const persistedLocationSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("unknown") }),
  z.object({ status: z.literal("confirmed"), site: jobSiteSchema, resolvedAt: isoDateTimeSchema }),
  z.object({ status: z.literal("manual"), site: jobSiteSchema }),
  z.object({ status: z.literal("stale"), site: jobSiteSchema, resolvedAt: isoDateTimeSchema }),
]) satisfies z.ZodType<LocationState>;

export const safePathSchema = z
  .string()
  .regex(/^\/(?![/\\])/, "Only same-origin paths are allowed.");
