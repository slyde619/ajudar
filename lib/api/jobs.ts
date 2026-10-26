import { connection } from "next/server";
import type {
  CreateJobInput,
  CreateReviewInput,
  JobPhase,
  JobRequest,
  JobWorkStatus,
  Paginated,
  Result,
  Review,
} from "@/lib/types";
import {
  cancelMockJob,
  completeMockJob,
  confirmMockArrival,
  createMockJob,
  getMockJob,
  getMockReview,
  getMockWorkStatus,
  listMockJobs,
  reviewMockJob,
} from "@/lib/mock/booking";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

export type JobAudience = "customer" | "artisan";

export interface JobFilters {
  customerId?: string;
  artisanId?: string;
  phase?: JobPhase | JobPhase[];
  audience?: JobAudience;
}

export interface GetJobOptions {
  audience?: JobAudience;
}

function forAudience(job: JobRequest, audience: JobAudience): JobRequest {
  const copy = structuredClone(job);
  if (audience === "artisan") delete copy.completionCode;
  return copy;
}

function matchesPhase(job: JobRequest, phase: JobFilters["phase"]): boolean {
  if (!phase) return true;
  return Array.isArray(phase) ? phase.includes(job.phase) : job.phase === phase;
}

function toQuery(filters: JobFilters): string {
  const params = new URLSearchParams();
  if (filters.customerId) params.set("customerId", filters.customerId);
  if (filters.artisanId) params.set("artisanId", filters.artisanId);
  if (filters.phase) {
    const phases = Array.isArray(filters.phase) ? filters.phase : [filters.phase];
    params.set("phase", phases.join(","));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

function post<T>(path: string, body?: unknown): Promise<Result<T>> {
  return apiRequest<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

export async function listJobs(
  filters: JobFilters = {},
): Promise<Result<Paginated<JobRequest>>> {
  const audience = filters.audience ?? "customer";

  if (isMockMode()) {
    await connection();
    const items = listMockJobs(Date.now())
      .filter((job) => {
        if (filters.customerId && job.customerId !== filters.customerId) return false;
        if (filters.artisanId && job.artisanId !== filters.artisanId) return false;
        return matchesPhase(job, filters.phase);
      })
      .map((job) => forAudience(job, audience));
    return ok({ items, total: items.length });
  }

  const result = await apiRequest<Paginated<JobRequest>>(
    `${endpoints.jobs.list}${toQuery(filters)}`,
  );
  if (!result.ok) return result;

  return ok({
    ...result.data,
    items: result.data.items.map((job) => forAudience(job, audience)),
  });
}

export async function getJob(
  id: string,
  options: GetJobOptions = {},
): Promise<Result<JobRequest>> {
  const audience = options.audience ?? "customer";

  if (isMockMode()) {
    await connection();
    const job = getMockJob(id, Date.now());
    return job
      ? ok(forAudience(job, audience))
      : fail("JOB_NOT_FOUND", `No job found with id ${id}.`);
  }

  const result = await apiRequest<JobRequest>(endpoints.jobs.detail(id));
  if (!result.ok) return result;

  return ok(forAudience(result.data, audience));
}

export async function createJob(input: CreateJobInput): Promise<Result<JobRequest>> {
  if (isMockMode()) {
    const result = createMockJob(input, Date.now());
    return result.ok ? ok(forAudience(result.data, "customer")) : result;
  }
  return post<JobRequest>(endpoints.jobs.create, input);
}

export async function cancelJob(id: string, reason: string): Promise<Result<JobRequest>> {
  if (isMockMode()) return cancelMockJob(id, reason, Date.now());
  return post<JobRequest>(endpoints.jobs.cancel(id), { reason });
}

export async function confirmArrival(id: string, isBookedPerson: boolean): Promise<Result<JobRequest>> {
  if (isMockMode()) return confirmMockArrival(id, isBookedPerson, Date.now());
  return post<JobRequest>(endpoints.jobs.arrival(id), { isBookedPerson });
}

export async function getWorkStatus(id: string): Promise<Result<JobWorkStatus>> {
  if (isMockMode()) {
    await connection();
    const status = getMockWorkStatus(id, Date.now());
    return status ? ok(status) : fail("NOT_WORKING", `Job ${id} is not in work mode.`);
  }
  return apiRequest<JobWorkStatus>(endpoints.jobs.work(id));
}

export async function completeJob(id: string, code: string): Promise<Result<JobRequest>> {
  if (isMockMode()) {
    const result = completeMockJob(id, code, Date.now());
    return result.ok ? ok(forAudience(result.data, "artisan")) : result;
  }
  return post<JobRequest>(endpoints.jobs.complete(id), { code });
}

export async function getJobReview(id: string): Promise<Result<Review | null>> {
  if (isMockMode()) {
    await connection();
    return ok(getMockReview(id) ?? null);
  }
  return apiRequest<Review | null>(endpoints.jobs.review(id));
}

export async function reviewJob(id: string, input: CreateReviewInput): Promise<Result<Review>> {
  if (isMockMode()) return reviewMockJob(id, input, Date.now());
  return post<Review>(endpoints.jobs.review(id), input);
}
