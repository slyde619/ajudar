"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cancelJob, completeJob, confirmArrival, createJob, getJob, reviewJob } from "@/lib/api/jobs";
import {
  acceptOffer,
  counterOffer,
  fundEscrow,
  releaseOffer,
  selectOffer,
  startSearch,
} from "@/lib/api/negotiations";
import { isMockMode } from "@/lib/api/client";
import { getJobTracking } from "@/lib/api/tracking";
import {
  completionCodeSchema,
  counterInputSchema,
  createJobInputSchema,
  createReviewInputSchema,
  escrowMethodSchema,
} from "@/lib/schemas/booking";
import { idSchema, parseInput } from "@/lib/schemas/primitives";
import type {
  CreateJobInput,
  CreateReviewInput,
  EscrowMethod,
  JobTracking,
  Kobo,
  Result,
} from "@/lib/types";

export type ActionState = { error: string } | null;

function failed(result: Result<unknown>): ActionState {
  return result.ok ? null : { error: result.error.message };
}

function settle(result: Result<unknown>): ActionState {
  if (result.ok) refresh();
  return failed(result);
}

const booleanSchema = z.boolean();

export async function createJobAction(input: CreateJobInput): Promise<ActionState> {
  const parsed = parseInput(createJobInputSchema, input);
  if (!parsed.ok) return { error: parsed.error };
  const result = await createJob(parsed.data);
  if (!result.ok) return failed(result);
  redirect(`/booking/${result.data.id}`);
}

export async function startSearchAction(jobId: string): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  if (!id.ok) return { error: id.error };
  return settle(await startSearch(id.data));
}

export async function selectOfferAction(jobId: string, negotiationId: string): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  const offer = parseInput(idSchema, negotiationId);
  if (!id.ok) return { error: id.error };
  if (!offer.ok) return { error: offer.error };
  return settle(await selectOffer(id.data, offer.data));
}

export async function counterOfferAction(jobId: string, total: Kobo, reason: string): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  const counter = parseInput(counterInputSchema, { total, reason });
  if (!id.ok) return { error: id.error };
  if (!counter.ok) return { error: counter.error };
  return settle(await counterOffer(id.data, counter.data.total, counter.data.reason));
}

export async function acceptOfferAction(jobId: string): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  if (!id.ok) return { error: id.error };
  return settle(await acceptOffer(id.data));
}

export async function releaseOfferAction(jobId: string): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  if (!id.ok) return { error: id.error };
  return settle(await releaseOffer(id.data));
}

export async function fundEscrowAction(jobId: string, method: EscrowMethod): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  const how = parseInput(escrowMethodSchema, method);
  if (!id.ok) return { error: id.error };
  if (!how.ok) return { error: how.error };
  const result = await fundEscrow(id.data, how.data);
  if (!result.ok) return failed(result);
  redirect(`/jobs/${id.data}`);
}

export async function cancelJobAction(jobId: string): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  if (!id.ok) return { error: id.error };
  const result = await cancelJob(id.data, "Cancelled by customer before booking");
  if (!result.ok) return failed(result);
  redirect("/jobs");
}

export async function confirmArrivalAction(jobId: string, isBookedPerson: boolean): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  const answer = parseInput(booleanSchema, isBookedPerson);
  if (!id.ok) return { error: id.error };
  if (!answer.ok) return { error: answer.error };
  return settle(await confirmArrival(id.data, answer.data));
}

export async function demoEnterCodeAction(jobId: string): Promise<ActionState> {
  if (!isMockMode()) return { error: "Not available." };
  const id = parseInput(idSchema, jobId);
  if (!id.ok) return { error: id.error };
  const job = await getJob(id.data, { audience: "customer" });
  if (!job.ok) return failed(job);
  const code = parseInput(completionCodeSchema, job.data.completionCode);
  if (!code.ok) return { error: "This job has no completion code." };
  return settle(await completeJob(id.data, code.data));
}

export async function reviewJobAction(jobId: string, input: CreateReviewInput): Promise<ActionState> {
  const id = parseInput(idSchema, jobId);
  const review = parseInput(createReviewInputSchema, input);
  if (!id.ok) return { error: id.error };
  if (!review.ok) return { error: review.error };
  return settle(await reviewJob(id.data, review.data));
}

export async function loadTrackingAction(jobId: string): Promise<Result<JobTracking>> {
  const id = parseInput(idSchema, jobId);
  if (!id.ok) return { ok: false, error: { code: "INVALID_INPUT", message: id.error } };
  return getJobTracking(id.data);
}
