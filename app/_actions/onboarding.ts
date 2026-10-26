"use server";

import { redirect } from "next/navigation";
import {
  createIdentitySession,
  createUploadTicket,
  resetApplication,
  saveApplicationStep,
  submitApplication,
} from "@/lib/api/onboarding";
import { ONBOARDING_STEPS } from "@/components/onboarding/steps";
import { getSession } from "@/lib/api/session";
import { applicationStepInputSchema, uploadFileSchema } from "@/lib/schemas/onboarding";
import { parseInput } from "@/lib/schemas/primitives";
import type { ApplicationStepInput, IdentityCheckSession, Result, UploadTicket } from "@/lib/types";
import type { ActionState } from "./booking";

async function applicantId(): Promise<string | null> {
  const session = await getSession();
  return session.ok ? session.data.applicantId : null;
}

const SIGNED_OUT = { ok: false, error: { code: "SIGNED_OUT", message: "Sign in to continue." } } as const;

export async function saveStepAction(raw: ApplicationStepInput): Promise<ActionState> {
  const parsed = parseInput(applicationStepInputSchema, raw);
  if (!parsed.ok) return { error: parsed.error };
  const input = parsed.data;
  const id = await applicantId();
  if (!id) return { error: SIGNED_OUT.error.message };
  const result = await saveApplicationStep(id, input);
  if (!result.ok) return { error: result.error.message };

  if (input.step === "consent") {
    const submitted = await submitApplication(id);
    if (!submitted.ok) return { error: submitted.error.message };
    redirect("/artisan/onboarding/status");
  }
  const next = ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(input.step) + 1];
  redirect(`/artisan/onboarding?step=${next}`);
}

export async function identitySessionAction(): Promise<Result<IdentityCheckSession>> {
  const id = await applicantId();
  return id ? createIdentitySession(id) : SIGNED_OUT;
}

export async function uploadTicketAction(file: { name: string; type: string; size: number }): Promise<Result<UploadTicket>> {
  const parsed = parseInput(uploadFileSchema, file);
  if (!parsed.ok) return { ok: false, error: { code: "INVALID_INPUT", message: parsed.error } };
  const id = await applicantId();
  return id ? createUploadTicket(id, parsed.data) : SIGNED_OUT;
}

export async function resetApplicationAction(): Promise<ActionState> {
  const id = await applicantId();
  if (!id) return { error: SIGNED_OUT.error.message };
  const result = await resetApplication(id);
  if (!result.ok) return { error: result.error.message };
  redirect("/artisan/onboarding");
}
