import type { JobPhase, JobTracking, JobWorkStatus } from "./job";
import type { CheckStatus, OnboardingCheck } from "./onboarding";
import type { Id, IsoDateTime } from "./primitives";

export type RealtimeTopic =
  | `job:${string}`
  | `artisan:${string}`
  | `applicant:${string}`;

interface RealtimeEventBase {
  seq: number;
  topic: RealtimeTopic;
  at: IsoDateTime;
}

export type RealtimeEvent = RealtimeEventBase & (
  | { type: "job.updated"; jobId: Id; phase: JobPhase }
  | { type: "job.offer"; jobId: Id; negotiationId: Id }
  | { type: "job.tracking"; tracking: JobTracking }
  | { type: "job.work"; status: JobWorkStatus }
  | { type: "feed.request"; jobId: Id }
  | { type: "feed.withdrawn"; jobId: Id }
  | { type: "verification.updated"; applicantId: Id; check: OnboardingCheck; status: CheckStatus }
);

export type RealtimeEventType = RealtimeEvent["type"];

export interface RealtimeSubscription {
  topic: RealtimeTopic;
  since: number;
}

export interface RealtimeBatch {
  events: RealtimeEvent[];
  cursors: Partial<Record<RealtimeTopic, number>>;
  resync: RealtimeTopic[];
}
