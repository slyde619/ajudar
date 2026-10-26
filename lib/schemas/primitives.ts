import { z } from "zod";
import type { Coordinates } from "@/lib/types";

export const idSchema = z.string().trim().min(1, "Missing id.").max(128);

export const koboSchema = z.number().int("Amounts are whole kobo.").nonnegative();

export const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const lgaCodeSchema = z.string().trim().min(1, "Pick an LGA.").max(32);

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
}) satisfies z.ZodType<Coordinates>;

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the details and try again.";
}

export type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

export function parseInput<T>(schema: z.ZodType<T, unknown>, value: unknown): Parsed<T> {
  const parsed = schema.safeParse(value);
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false, error: firstIssue(parsed.error) };
}
