import type { NegotiationMode } from "./catalog";
import type { JobEligibilityMatch } from "./eligibility";
import type { JobTiming, Urgency } from "./job";
import type { Estimate, NegotiationRound } from "./negotiation";
import type { Id, IsoDateTime, Kobo, LgaCode } from "./primitives";

export type ArtisanOfferInput =
  | { kind: "accept" }
  | { kind: "counter"; total: Kobo; reason: string };

export interface FeedRequest {
  jobId: Id;
  categoryId: Id;
  title: string;
  description: string;
  photoCount: number;
  lgaCode: LgaCode;
  timing: JobTiming;
  urgency: Urgency;
  estimate: Estimate;
  mode: NegotiationMode;
  match: JobEligibilityMatch;
  postedAt: IsoDateTime;
  myOffer?: NegotiationRound;
}

export type PayoutStatus = "in_escrow" | "released" | "paid_out" | "refunded";

export interface EarningsLine {
  jobId: Id;
  title: string;
  categoryId: Id;
  amount: Kobo;
  status: PayoutStatus;
  at: IsoDateTime;
}

export interface ArtisanEarnings {
  artisanId: Id;
  inEscrow: Kobo;
  released: Kobo;
  paidOut: Kobo;
  lines: EarningsLine[];
}
