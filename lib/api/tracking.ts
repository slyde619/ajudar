import { connection } from "next/server";
import type { JobTracking, Result } from "@/lib/types";
import { getMockJobTracking } from "@/lib/mock/booking";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

export async function getJobTracking(jobId: string): Promise<Result<JobTracking>> {
  if (isMockMode()) {
    await connection();
    const tracking = getMockJobTracking(jobId, Date.now());
    return tracking
      ? ok(tracking)
      : fail("TRACKING_UNAVAILABLE", `Job ${jobId} is not being tracked.`);
  }
  return apiRequest<JobTracking>(endpoints.jobs.tracking(jobId));
}
