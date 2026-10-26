"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { completeJob, getJob } from "@/lib/api/jobs";
import { getSession } from "@/lib/api/session";
import {
  createArrivalSelfieSession,
  markArrived,
  passRequest,
  reportLocation,
  respondToCounter,
  respondToRequest,
  setAvailability,
  setWorkStage,
} from "@/lib/api/supply";
import type { ArtisanOfferInput, Coordinates, IdentityCheckSession, Result, WorkStage } from "@/lib/types";
import type { ActionState } from "./booking";

async function artisanId(): Promise<string | null> {
  const session = await getSession();
  return session.ok ? session.data.artisanId : null;
}

function settle(result: Result<unknown>): ActionState {
  if (!result.ok) return { error: result.error.message };
  refresh();
  return null;
}

const SIGNED_OUT: ActionState = { error: "Sign in as an artisan first." };

export async function respondToRequestAction(jobId: string, input: ArtisanOfferInput): Promise<ActionState> {
  const id = await artisanId();
  return id ? settle(await respondToRequest(id, jobId, input)) : SIGNED_OUT;
}

export async function passRequestAction(jobId: string): Promise<ActionState> {
  const id = await artisanId();
  if (!id) return SIGNED_OUT;
  const result = await passRequest(id, jobId);
  if (!result.ok) return { error: result.error.message };
  redirect("/artisan");
}

export async function respondToCounterAction(jobId: string, input: ArtisanOfferInput): Promise<ActionState> {
  const id = await artisanId();
  return id ? settle(await respondToCounter(id, jobId, input)) : SIGNED_OUT;
}

export async function arrivalSelfieSessionAction(jobId: string): Promise<Result<IdentityCheckSession>> {
  const id = await artisanId();
  return id ? createArrivalSelfieSession(id, jobId) : { ok: false, error: { code: "SIGNED_OUT", message: "Sign in as an artisan first." } };
}

export async function markArrivedAction(jobId: string, selfieRef: string): Promise<ActionState> {
  const id = await artisanId();
  return id ? settle(await markArrived(id, jobId, selfieRef)) : SIGNED_OUT;
}

export async function setWorkStageAction(jobId: string, stage: WorkStage): Promise<ActionState> {
  const id = await artisanId();
  return id ? settle(await setWorkStage(id, jobId, stage)) : SIGNED_OUT;
}

export async function enterCompletionCodeAction(jobId: string, code: string): Promise<ActionState> {
  const id = await artisanId();
  if (!id) return SIGNED_OUT;
  if (!/^\d{6}$/.test(code.trim())) return { error: "The code is 6 digits." };
  const job = await getJob(jobId, { audience: "artisan" });
  if (!job.ok || job.data.artisanId !== id) return { error: "That job isn't yours." };
  return settle(await completeJob(jobId, code.trim()));
}

export async function setAvailabilityAction(online: boolean): Promise<ActionState> {
  const id = await artisanId();
  return id ? settle(await setAvailability(id, online)) : SIGNED_OUT;
}

export async function reportLocationAction(coords: Coordinates, accuracyM?: number): Promise<ActionState> {
  const result = await reportLocation(coords, accuracyM);
  return result.ok ? null : { error: result.error.message };
}
