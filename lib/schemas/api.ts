import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_API_MODE: z.enum(["mock", "live"]).default("mock"),
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .default("")
    .transform((value) => value.replace(/\/+$/, "")),
  NEXT_PUBLIC_REALTIME_URL: z
    .string()
    .optional()
    .transform((value) => value || null),
});

export const resultEnvelopeSchema = z.discriminatedUnion("ok", [
  z.looseObject({ ok: z.literal(true), data: z.unknown() }),
  z.looseObject({
    ok: z.literal(false),
    error: z.looseObject({ code: z.string(), message: z.string(), details: z.record(z.string(), z.unknown()).optional() }),
  }),
]);
