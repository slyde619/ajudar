"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
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
import { completionCodeSchema } from "@/lib/schemas/booking";
import { idSchema, parseInput } from "@/lib/schemas/primitives";
import { artisanOfferInputSchema, locationReportSchema, workStageSchema } from "@/lib/schemas/supply";
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

const booleanSchema = z.boolean();

export async function respondToRequestAction(jobId: string, input: ArtisanOfferInput): Promise<ActionState> {
  const job = parseInput(idSchema, jobId);
  const offer = parseInput(artisanOfferInputSchema, input);
  if (!job.ok) return { error: job.error };
  if (!offer.ok) return { error: offer.error };
  const id = await artisanId();
  return id ? settle(await respondToRequest(id, job.data, offer.data)) : SIGNED_OUT;
}

export async function passRequestAction(jobId: string): Promise<ActionState> {
  const job = parseInput(idSchema, jobId);
  if (!job.ok) return { error: job.error };
  const id = await artisanId();
  if (!id) return SIGNED_OUT;
  const result = await passRequest(id, job.data);
  if (!result.ok) return { error: result.error.message };
  redirect("/artisan");
}

export async function respondToCounterAction(jobId: string, input: ArtisanOfferInput): Promise<ActionState> {
  const job = parseInput(idSchema, jobId);
  const offer = parseInput(artisanOfferInputSchema, input);
  if (!job.ok) return { error: job.error };
  if (!offer.ok) return { error: offer.error };
  const id = await artisanId();
  return id ? settle(await respondToCounter(id, job.data, offer.data)) : SIGNED_OUT;
}

export async function arrivalSelfieSessionAction(jobId: string): Promise<Result<IdentityCheckSession>> {
  const job = parseInput(idSchema, jobId);
  if (!job.ok) return { ok: false, error: { code: "INVALID_INPUT", message: job.error } };
  const id = await artisanId();
  return id ? createArrivalSelfieSession(id, job.data) : { ok: false, error: { code: "SIGNED_OUT", message: "Sign in as an artisan first." } };
}

export async function markArrivedAction(jobId: string, selfieRef: string): Promise<ActionState> {
  const job = parseInput(idSchema, jobId);
  const selfie = parseInput(idSchema, selfieRef);
  if (!job.ok) return { error: job.error };
  if (!selfie.ok) return { error: "Take the arrival selfie first." };
  const id = await artisanId();
  return id ? settle(await markArrived(id, job.data, selfie.data)) : SIGNED_OUT;
}

export async function setWorkStageAction(jobId: string, stage: WorkStage): Promise<ActionState> {
  const job = parseInput(idSchema, jobId);
  const next = parseInput(workStageSchema, stage);
  if (!job.ok) return { error: job.error };
  if (!next.ok) return { error: next.error };
  const id = await artisanId();
  return id ? settle(await setWorkStage(id, job.data, next.data)) : SIGNED_OUT;
}

export async function enterCompletionCodeAction(jobId: string, code: string): Promise<ActionState> {
  const job = parseInput(idSchema, jobId);
  const entered = parseInput(completionCodeSchema, code);
  if (!job.ok) return { error: job.error };
  if (!entered.ok) return { error: entered.error };
  const id = await artisanId();
  if (!id) return SIGNED_OUT;
  const current = await getJob(job.data, { audience: "artisan" });
  if (!current.ok || current.data.artisanId !== id) return { error: "That job isn't yours." };
  return settle(await completeJob(job.data, entered.data));
}

export async function setAvailabilityAction(online: boolean): Promise<ActionState> {
  const next = parseInput(booleanSchema, online);
  if (!next.ok) return { error: next.error };
  const id = await artisanId();
  return id ? settle(await setAvailability(id, next.data)) : SIGNED_OUT;
}

export async function reportLocationAction(coords: Coordinates, accuracyM?: number): Promise<ActionState> {
  const report = parseInput(locationReportSchema, { coords, accuracyM });
  if (!report.ok) return { error: report.error };
  const result = await reportLocation(report.data.coords, report.data.accuracyM);
  return result.ok ? null : { error: result.error.message };
}
