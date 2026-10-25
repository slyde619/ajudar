import type {
  JobPhase,
  JobRequest,
  Paginated,
  Result,
} from "@/lib/types";
import { getMockJobById, jobs as mockJobs } from "@/lib/mock/jobs";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

/** The completion code is never exposed to the artisan (§7). */
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
  if (audience !== "artisan") return job;

  const sanitized = { ...job };
  delete sanitized.completionCode;
  return sanitized;
}

function matchesPhase(job: JobRequest, phase: JobFilters["phase"]): boolean {
  if (!phase) return true;
  return Array.isArray(phase) ? phase.includes(job.phase) : job.phase === phase;
}

function filterMockJobs(filters: JobFilters): JobRequest[] {
  const audience = filters.audience ?? "customer";

  return mockJobs
    .filter((job) => {
      if (filters.customerId && job.customerId !== filters.customerId) return false;
      if (filters.artisanId && job.artisanId !== filters.artisanId) return false;
      return matchesPhase(job, filters.phase);
    })
    .map((job) => forAudience(job, audience));
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

export async function listJobs(
  filters: JobFilters = {},
): Promise<Result<Paginated<JobRequest>>> {
  const audience = filters.audience ?? "customer";

  if (isMockMode()) {
    const items = filterMockJobs({ ...filters, audience });
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
    const job = getMockJobById(id);
    return job
      ? ok(forAudience(job, audience))
      : fail("JOB_NOT_FOUND", `No job found with id ${id}.`);
  }

  const result = await apiRequest<JobRequest>(endpoints.jobs.detail(id));
  if (!result.ok) return result;

  return ok(forAudience(result.data, audience));
}
