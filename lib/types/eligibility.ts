import type { Id } from "./primitives";

export type IneligibilityReason =
  | "outside_lga" | "outside_coverage" | "offline"
  | "trade_mismatch" | "probation_limit" | "suspended";

export interface JobEligibilityMatch {
  eligible: true;
  jobId: Id;
  artisanId: Id;
  driveTimeToJobMinutes: number;
  distanceKm: number;
  rank: number;
}

export interface JobIneligibility {
  eligible: false;
  jobId: Id;
  artisanId: Id;
  reason: IneligibilityReason;
}

export type JobEligibility = JobEligibilityMatch | JobIneligibility;
