import type { ArtisanProfile } from "./artisan";
import type { Trade } from "./catalog";
import type { Coordinates } from "./geo";
import type { JobPhase, JobRequest } from "./job";
import type { ArtisanApplication, OnboardingCheck } from "./onboarding";
import type { Id, IsoDateTime, Kobo, LgaCode, StateCode } from "./primitives";
import type { Dispute } from "./review";

export interface AdminKpis {
  activeJobs: number;
  onlineArtisans: number;
  pendingVerifications: number;
  openDisputes: number;
  gmvToday: Kobo;
  completionRate7d: number;
  medianResponseSeconds: number;
}

export interface DemandSupplyGap {
  lgaCode: LgaCode;
  lgaName: string;
  openRequests: number;
  eligibleArtisans: number;
  ratio: number;
}

export type AdminRange = "today" | "7d" | "30d";

export type ArtisanPresence = "online" | "offline" | "suspended";

export type NetworkPoint =
  | { kind: "artisan"; id: Id; position: Coordinates; label: string; trade: Trade; presence: ArtisanPresence }
  | { kind: "job"; id: Id; position: Coordinates; label: string; phase: JobPhase; trade: Trade };

export interface DemandPoint {
  position: Coordinates;
  lgaCode: LgaCode;
  trade: Trade;
  at: IsoDateTime;
}

export interface NetworkFilters {
  range: AdminRange;
  stateCode?: StateCode;
  trade?: Trade;
}

export interface NetworkSnapshot {
  kpis: AdminKpis;
  points: NetworkPoint[];
  demand: DemandPoint[];
  gaps: DemandSupplyGap[];
  generatedAt: IsoDateTime;
  synthetic: boolean;
}

export interface AdminSearchHit {
  kind: "artisan" | "job" | "customer";
  id: Id;
  title: string;
  subtitle: string;
}

export interface AdminCustomerSummary {
  id: Id;
  displayName: string;
  phoneLast4: string;
  createdAt: IsoDateTime;
}

export type AdminEntity =
  | { kind: "artisan"; artisan: ArtisanProfile; presence: ArtisanPresence; jobs: JobRequest[] }
  | { kind: "job"; job: JobRequest; customer: AdminCustomerSummary; artisan?: ArtisanProfile; dispute?: Dispute }
  | { kind: "customer"; customer: AdminCustomerSummary; jobs: JobRequest[] };

export type GuarantorCallOutcome = "confirmed" | "no_answer" | "declined" | "wrong_number";

export interface GuarantorCall {
  id: Id;
  applicantId: Id;
  adminId: Id;
  outcome: GuarantorCallOutcome;
  note?: string;
  at: IsoDateTime;
}

export interface VerificationQueueItem {
  application: ArtisanApplication;
  pendingChecks: OnboardingCheck[];
  guarantorCalls: GuarantorCall[];
  waitingSince: IsoDateTime;
}

export interface CheckReviewInput {
  check: OnboardingCheck;
  decision: "verified" | "rejected";
  note: string;
}

export interface GuarantorCallInput {
  outcome: GuarantorCallOutcome;
  note?: string;
}

export interface DisputeRow {
  dispute: Dispute;
  job: JobRequest;
  customerName: string;
  artisanName?: string;
}

export type DisputeUpdateInput = { action: "assign" } | { action: "investigate" };

export type DisputeRuling =
  | { outcome: "refund_customer" }
  | { outcome: "release_artisan" }
  | { outcome: "split"; refundAmount: Kobo };

export type ResolveDisputeInput = DisputeRuling & { resolution: string };
