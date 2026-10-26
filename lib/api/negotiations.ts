import { connection } from "next/server";
import type { EscrowMethod, JobOffer, JobRequest, Kobo, Result } from "@/lib/types";
import {
  acceptMockOffer,
  counterMock,
  fundMockEscrow,
  listMockOffers,
  releaseMockOffer,
  selectMockOffer,
  startMockSearch,
} from "@/lib/mock/booking";
import { apiRequest, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

function post<T>(path: string, body?: unknown): Promise<Result<T>> {
  return apiRequest<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

function copy(result: Result<JobRequest>): Result<JobRequest> {
  return result.ok ? ok(structuredClone(result.data)) : result;
}

export async function startSearch(jobId: string): Promise<Result<JobRequest>> {
  if (isMockMode()) return copy(startMockSearch(jobId, Date.now()));
  return post<JobRequest>(endpoints.jobs.search(jobId));
}

export async function listOffers(jobId: string): Promise<Result<JobOffer[]>> {
  if (isMockMode()) {
    await connection();
    return ok(structuredClone(listMockOffers(jobId, Date.now())));
  }
  return apiRequest<JobOffer[]>(endpoints.jobs.offers(jobId));
}

export async function selectOffer(jobId: string, negotiationId: string): Promise<Result<JobRequest>> {
  if (isMockMode()) return copy(selectMockOffer(jobId, negotiationId, Date.now()));
  return post<JobRequest>(endpoints.jobs.selectOffer(jobId), { negotiationId });
}

export async function counterOffer(jobId: string, total: Kobo, reason: string): Promise<Result<JobRequest>> {
  if (isMockMode()) return copy(counterMock(jobId, total, reason, Date.now()));
  return post<JobRequest>(endpoints.jobs.counter(jobId), { total, reason });
}

export async function acceptOffer(jobId: string): Promise<Result<JobRequest>> {
  if (isMockMode()) return copy(acceptMockOffer(jobId, Date.now()));
  return post<JobRequest>(endpoints.jobs.accept(jobId));
}

export async function releaseOffer(jobId: string): Promise<Result<JobRequest>> {
  if (isMockMode()) return copy(releaseMockOffer(jobId, Date.now()));
  return post<JobRequest>(endpoints.jobs.release(jobId));
}

export async function fundEscrow(jobId: string, method: EscrowMethod): Promise<Result<JobRequest>> {
  if (isMockMode()) return copy(fundMockEscrow(jobId, method, Date.now()));
  return post<JobRequest>(endpoints.jobs.escrow(jobId), { method });
}
