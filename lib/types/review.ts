import type { Id, IsoDateTime, Kobo } from "./primitives";

export interface Review {
  id: Id;
  jobId: Id;
  artisanId: Id;
  customerId: Id;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  tags: string[];
  createdAt: IsoDateTime;
  artisanReply?: string;
}

export type DisputeReason =
  | "no_show" | "quality" | "overcharge" | "damage" | "abandoned"
  | "wrong_person"
  | "other";

export type DisputeStatus =
  | "open" | "investigating"
  | "resolved_customer" | "resolved_artisan" | "resolved_split" | "closed";

export interface Dispute {
  id: Id;
  jobId: Id;
  raisedBy: "customer" | "artisan";
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolution?: string;
  refundAmount?: Kobo;
  assignedAdminId?: Id;
  createdAt: IsoDateTime;
  resolvedAt?: IsoDateTime;
}

export interface CreateReviewInput {
  rating: Review["rating"];
  tags: string[];
  comment?: string;
}
