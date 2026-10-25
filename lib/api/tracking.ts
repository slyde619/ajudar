import type { JobTracking, Result } from "@/lib/types";
import { getMockJobTracking } from "@/lib/mock/tracking";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

/** Travel-mode snapshot. Polled only while the screen is visible (§10.6). */
export async function getJobTracking(jobId: string): Promise<Result<JobTracking>> {
  if (isMockMode()) {
    const tracking = getMockJobTracking(jobId, Date.now());
    return tracking
      ? ok(tracking)
      : fail("TRACKING_UNAVAILABLE", `Job ${jobId} is not being tracked.`);
  }
  return apiRequest<JobTracking>(endpoints.jobs.tracking(jobId));
}
