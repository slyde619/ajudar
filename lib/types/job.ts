import type { ArtisanLocation } from "./artisan";
import type { RoutePath } from "./geo";
import type { JobSite } from "./location";
import type { Estimate, Negotiation } from "./negotiation";
import type { CheckStatus } from "./onboarding";
import type { Id, IsoDateTime, Kobo } from "./primitives";
import type { PayoutStatus } from "./supply";

export type JobPhase =
  | "draft" | "estimating" | "negotiating" | "searching" | "accepted"
  | "en_route"
  | "arrived" | "working"
  | "complete" | "cancelled" | "disputed";

export type JobTiming =
  | { mode: "now" }
  | { mode: "scheduled"; scheduledFor: IsoDateTime; windowMinutes: number };

export type Urgency = "standard" | "emergency";

export interface JobAttachment {
  id: Id;
  url: string;
  kind: "photo" | "video" | "voice";
  uploadedAt: IsoDateTime;
}

export interface JobRequest {
  id: Id;
  customerId: Id;
  categoryId: Id;

  title: string;
  description: string;
  attachments: JobAttachment[];

  site: JobSite;
  timing: JobTiming;
  urgency: Urgency;

  phase: JobPhase;

  artisanId?: Id;
  estimate?: Estimate;
  negotiation?: Negotiation;
  agreedTotal?: Kobo;

  escrowFunded: boolean;
  payoutStatus?: PayoutStatus;
  completionCode?: string;
  refundedAmount?: Kobo;

  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  scheduledFor?: IsoDateTime;
  startedAt?: IsoDateTime;
  arrivedAt?: IsoDateTime;
  arrivalSelfie?: { status: CheckStatus; checkedAt?: IsoDateTime };
  completedAt?: IsoDateTime;
  cancelledAt?: IsoDateTime;
  cancellationReason?: string;
}

export interface JobTracking {
  jobId: Id;
  artisanLocation: ArtisanLocation;
  route: RoutePath;
  etaAt: IsoDateTime;
}

export interface CreateJobInput {
  categoryId: Id;
  title: string;
  description: string;
  site: JobSite;
  timing: JobTiming;
  urgency: Urgency;
}

export type EscrowMethod = "card" | "bank_transfer";

export type WorkStage = "started" | "in_progress" | "wrapping_up" | "complete";

export interface JobWorkStatus {
  jobId: Id;
  stage: WorkStage;
  startedAt: IsoDateTime;
  estimatedMinutes: { min: number; max: number };
  updatedAt: IsoDateTime;
}
