import { z } from "zod";
import type { ArtisanOfferInput, WorkStage } from "@/lib/types";
import { counterInputSchema } from "./booking";
import { coordinatesSchema } from "./primitives";

export const artisanOfferInputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("accept") }),
  counterInputSchema.extend({ kind: z.literal("counter") }),
]) satisfies z.ZodType<ArtisanOfferInput>;

export const workStageSchema = z.enum(["started", "in_progress", "wrapping_up", "complete"]) satisfies z.ZodType<WorkStage>;

export const locationReportSchema = z.object({
  coords: coordinatesSchema,
  accuracyM: z.number().nonnegative().optional(),
});
