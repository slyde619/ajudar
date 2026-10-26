"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
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

export async function createJobAction(input: CreateJobInput): Promise<ActionState> {
  const result = await createJob(input);
  if (!result.ok) return failed(result);
  redirect(`/booking/${result.data.id}`);
}

export async function startSearchAction(jobId: string): Promise<ActionState> {
  return settle(await startSearch(jobId));
}

export async function selectOfferAction(jobId: string, negotiationId: string): Promise<ActionState> {
  return settle(await selectOffer(jobId, negotiationId));
}

export async function counterOfferAction(jobId: string, total: Kobo, reason: string): Promise<ActionState> {
  return settle(await counterOffer(jobId, total, reason));
}

export async function acceptOfferAction(jobId: string): Promise<ActionState> {
  return settle(await acceptOffer(jobId));
}

export async function releaseOfferAction(jobId: string): Promise<ActionState> {
  return settle(await releaseOffer(jobId));
}

export async function fundEscrowAction(jobId: string, method: EscrowMethod): Promise<ActionState> {
  const result = await fundEscrow(jobId, method);
  if (!result.ok) return failed(result);
  redirect(`/jobs/${jobId}`);
}

export async function cancelJobAction(jobId: string): Promise<ActionState> {
  const result = await cancelJob(jobId, "Cancelled by customer before booking");
  if (!result.ok) return failed(result);
  redirect("/jobs");
}

export async function confirmArrivalAction(jobId: string, isBookedPerson: boolean): Promise<ActionState> {
  return settle(await confirmArrival(jobId, isBookedPerson));
}

export async function demoEnterCodeAction(jobId: string): Promise<ActionState> {
  if (!isMockMode()) return { error: "Not available." };
  const job = await getJob(jobId, { audience: "customer" });
  if (!job.ok) return failed(job);
  if (!job.data.completionCode) return { error: "This job has no completion code." };
  return settle(await completeJob(jobId, job.data.completionCode));
}

export async function reviewJobAction(jobId: string, input: CreateReviewInput): Promise<ActionState> {
  return settle(await reviewJob(jobId, input));
}

export async function loadTrackingAction(jobId: string): Promise<Result<JobTracking>> {
  return getJobTracking(jobId);
}
