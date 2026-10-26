import type { JobEligibilityMatch } from "./eligibility";
import type { Id, IsoDateTime, Kobo } from "./primitives";

export type EstimateLineKind = "labour" | "transport" | "materials";

export interface EstimateLineItem {
  id: Id;
  kind: EstimateLineKind;
  label: string;
  amount: Kobo;
  negotiable: boolean;
  note?: string;
}

export interface Estimate {
  id: Id;
  jobId: Id;
  lineItems: EstimateLineItem[];
  subtotal: Kobo;
  total: Kobo;
  negotiableBand: { min: Kobo; max: Kobo };
  createdAt: IsoDateTime;
  expiresAt: IsoDateTime;
}

export type OfferActor = "system" | "artisan" | "customer";

export interface NegotiationRound {
  index: number;
  actor: OfferActor;
  total: Kobo;
  lineItems: EstimateLineItem[];
  reason: string;
  createdAt: IsoDateTime;
  accepted: boolean;
}

export type NegotiationStatus = "open" | "agreed" | "expired" | "withdrawn";

export interface Negotiation {
  id: Id;
  jobId: Id;
  artisanId: Id;
  rounds: NegotiationRound[];
  maxRounds: number;
  expiresAt: IsoDateTime;
  status: NegotiationStatus;
  agreedTotal?: Kobo;
  agreedAt?: IsoDateTime;
}

export interface JobOffer {
  negotiation: Negotiation;
  match: JobEligibilityMatch;
}
