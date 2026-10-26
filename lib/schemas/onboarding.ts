import { z } from "zod";
import type { ApplicationStepInput, Trade } from "@/lib/types";
import { lgaCodeSchema } from "./primitives";

export const MIN_PORTFOLIO_PHOTOS = 3;
export const MAX_PORTFOLIO_PHOTOS = 8;
export const MAX_SERVED_LGAS = 6;
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export const tradeSchema = z.enum([
  "plumber", "electrician", "carpenter", "painter",
  "tiler", "welder", "ac_technician", "generator_mechanic",
  "locksmith", "cleaner", "mason", "roofer",
]) satisfies z.ZodType<Trade>;

const urlSchema = z.string().trim().min(1).max(2048);

export const profileStepSchema = z.object({
  step: z.literal("profile"),
  displayName: z.string().trim().min(4, "Use the full name on your NIN.").max(80),
  trade: tradeSchema,
  yearsExperience: z.number("Enter your years of experience.").int().min(0).max(60),
  specialties: z
    .array(z.string())
    .transform((list) => list.map((entry) => entry.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(40)).max(10)),
});

export const identityStepSchema = z.object({
  step: z.literal("identity"),
  nin: z.string().regex(/^\d{11}$/, "Your NIN is 11 digits."),
  providerRef: z.string().trim().min(1, "Take the photos first."),
});

export const guarantorStepSchema = z.object({
  step: z.literal("guarantor"),
  name: z.string().trim().min(4, "Enter your guarantor's full name.").max(80),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, "Enter a phone number we can call."),
  relationship: z.string().trim().min(1, "Pick how you know them."),
});

export const portfolioStepSchema = z
  .object({
    step: z.literal("portfolio"),
    photoUrls: z
      .array(urlSchema)
      .min(MIN_PORTFOLIO_PHOTOS, `Add at least ${MIN_PORTFOLIO_PHOTOS} photos.`)
      .max(MAX_PORTFOLIO_PHOTOS),
    certificateUrl: urlSchema.optional(),
    apprenticeshipYears: z.number().int().min(0).max(30).optional(),
  })
  .refine((input) => Boolean(input.certificateUrl) || (input.apprenticeshipYears ?? 0) > 0, {
    message: "Add a certificate or your years as an apprentice.",
  });

export const skillVideoStepSchema = z.object({
  step: z.literal("skill_video"),
  videoUrl: urlSchema.optional(),
});

export const addressStepSchema = z.object({
  step: z.literal("address"),
  baseAddress: z.string().trim().min(8, "Enter the address you work from.").max(200),
  homeLgaCode: lgaCodeSchema,
  servedLgaCodes: z.array(lgaCodeSchema).max(MAX_SERVED_LGAS - 1),
});

export const consentStepSchema = z.object({
  step: z.literal("consent"),
  version: z.string().trim().min(1),
});

export const applicationStepInputSchema = z.union([
  profileStepSchema,
  identityStepSchema,
  guarantorStepSchema,
  portfolioStepSchema,
  skillVideoStepSchema,
  addressStepSchema,
  consentStepSchema,
]) satisfies z.ZodType<ApplicationStepInput, unknown>;

export const uploadFileSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.string().regex(/^(image|video)\//, "Only photos and videos can be uploaded."),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "That file is too large."),
});
