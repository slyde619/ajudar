/* ═══════════════════ Primitives ═══════════════════ */

export type StateCode = `NG-${string}`;
export type LgaCode = string;
export type Kobo = number;               // 1 NGN = 100 kobo, integers only
export type Currency = "NGN";
export type Id = string;
export type IsoDateTime = string;

export interface Coordinates { lat: number; lng: number; }

export interface GeoPolygon {
  type: "Polygon";
  coordinates: number[][][];             // [lng, lat] rings
}

/* ═══════════════════ Geography ═══════════════════ */

export interface Lga {
  code: LgaCode;
  name: string;
  stateCode: StateCode;
  stateName: string;
  centroid: Coordinates;
}

export interface SavedSite extends Coordinates {
  id: Id;
  label: string;
  landmark: string;
  lgaCode: LgaCode;
}

export interface JobSite extends Coordinates {
  lgaCode: LgaCode;
  landmark: string;                      // customer-authored — what the artisan navigates by
  pinConfirmedByUser: boolean;           // false = raw GPS. true = dragged + confirmed
  accuracyM?: number;
  savedLabel?: "home" | "work" | "other";
  plusCode?: string;
}

/* ═══════════════════ Location state machine ═══════════════════ */

export type LocationStatus =
  | "unknown" | "requesting" | "resolving" | "confirmed"
  | "manual" | "stale" | "denied" | "unavailable";

/** Only `confirmed` and `manual` unlock matching. */
export type LocationState =
  | { status: "unknown" }
  | { status: "requesting" }
  | { status: "resolving" }
  | { status: "confirmed"; site: JobSite; resolvedAt: IsoDateTime }
  | { status: "manual"; site: JobSite }
  | { status: "stale"; site: JobSite; resolvedAt: IsoDateTime }
  | { status: "denied" }
  | { status: "unavailable" };

/* ═══════════════════ Trades & categories ═══════════════════ */

export type Trade =
  | "plumber" | "electrician" | "carpenter" | "painter"
  | "tiler" | "welder" | "ac_technician" | "generator_mechanic"
  | "locksmith" | "cleaner" | "mason" | "roofer";

export type NegotiationMode = "bounded" | "fixed" | "none";

export interface TradeCategory {
  id: Id;
  slug: string;
  label: string;
  trade: Trade;
  iconKey: string;
  negotiation: NegotiationMode;
  bandPercent: number;
  maxNegotiationRounds: number;
  negotiationWindowMinutes: number;
  supportsEmergency: boolean;
  emergencySurgeMultiplier?: number;
}

/* ═══════════════════ Verification ═══════════════════ */

export type VerificationTier =
  | "unverified" | "pending" | "listed" | "certified" | "top";

export interface ArtisanVerification {
  tier: VerificationTier;

  /* L1 — identity */
  ninVerified: boolean;
  ninVerifiedAt?: IsoDateTime;
  bvnVerified: boolean;
  selfieMatchScore?: number;

  /* L2 — guarantor */
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorConfirmed: boolean;
  guarantorConfirmedAt?: IsoDateTime;

  /* L3 — skill evidence */
  portfolioPhotoCount: number;
  portfolioMinRequired: number;
  tradeCertificateUrl?: string;
  apprenticeshipYears?: number;
  skillVideoUrl?: string;

  /* L4 — address & area */
  addressConfirmed: boolean;
  serviceAreaConfirmed: boolean;

  /* L5 — probation (3–5 jobs, decrements) */
  probationJobsRemaining: number;

  /* L7 — on-arrival */
  onArrivalSelfieEnabled: boolean;

  /* Ops escape hatch — design "pending manual review" as a first-class state */
  manualReviewRequired: boolean;
  manualReviewReason?: string;
}

/** Derived by selector, never stored. */
export interface VerificationSignal {
  key: string;
  label: string;
  verified: boolean;
  detail?: string;
}

/* ═══════════════════ Artisan ═══════════════════ */

export interface RateCard {
  callOutFee: Kobo;
  hourlyRate?: Kobo;
  minimumCharge: Kobo;
  transportIncluded: boolean;
  transportFeePerKm?: Kobo;
  updatedAt: IsoDateTime;
}

export interface CoverageArea {
  homeLgaCode: LgaCode;
  servedLgaCodes: LgaCode[];
  driveTimeMinutes: number;
  polygonGeoJSON: GeoPolygon | null;     // null until isolines exist
  updatedAt: IsoDateTime;
}

export interface ArtisanStats {
  jobsCompleted: number;
  jobsCancelled: number;
  completionRate: number;
  averageRating: number;
  ratingCount: number;
  ratingTrend: number;                   // delta over last 20 jobs
  medianResponseSeconds: number;
  disputesOpened: number;
  disputesResolved: number;
}

export interface PortfolioItem {
  id: Id;
  imageUrl: string;
  caption?: string;
  trade: Trade;
  completedAt?: IsoDateTime;
  verified: boolean;                     // admin-confirmed real job-site photo
}

export interface ArtisanProfile {
  id: Id;
  displayName: string;
  avatarUrl?: string;
  phone: string;
  trade: Trade;
  specialties: string[];
  bio?: string;
  yearsExperience: number;

  baseAddress: string;
  base: Coordinates;
  coverage: CoverageArea;

  rateCard: RateCard;
  verification: ArtisanVerification;
  stats: ArtisanStats;
  portfolio: PortfolioItem[];

  isOnline: boolean;
  acceptsEmergency: boolean;
  suspended: boolean;
  suspendedReason?: string;

  createdAt: IsoDateTime;
  lastActiveAt?: IsoDateTime;
}

/** Foreground-only on web. `updatedAt` exists so the UI can say
 *  "Updated 2 min ago" honestly instead of pretending live. */
export interface ArtisanLocation {
  artisanId: Id;
  coords: Coordinates;
  accuracyM?: number;
  updatedAt: IsoDateTime;
  source: "foreground" | "base";
}

/* ═══════════════════ Estimate & negotiation ═══════════════════ */

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
  reason: string;                        // required for artisan + customer
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

/* ═══════════════════ Job ═══════════════════ */

export type JobPhase =
  | "draft" | "estimating" | "negotiating" | "searching" | "accepted"
  | "en_route"                           // travel mode — live map ON
  | "arrived" | "working"                // work mode — live map OFF
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
  completionCode?: string;               // NEVER exposed to the artisan

  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  scheduledFor?: IsoDateTime;
  startedAt?: IsoDateTime;
  completedAt?: IsoDateTime;
  cancelledAt?: IsoDateTime;
  cancellationReason?: string;
}

/* ═══════════════════ Eligibility ═══════════════════ */

export type IneligibilityReason =
  | "outside_lga" | "outside_coverage" | "offline"
  | "trade_mismatch" | "probation_limit" | "suspended";

export interface JobEligibilityMatch {
  eligible: true;
  jobId: Id;
  artisanId: Id;
  driveTimeToJobMinutes: number;         // RANKING only — never inclusion
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

/* ═══════════════════ Reviews & disputes ═══════════════════ */

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
  | "no_show" | "quality" | "overcharge" | "damage" | "abandoned" | "other";

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

/* ═══════════════════ Customer & admin ═══════════════════ */

export interface CustomerProfile {
  id: Id;
  displayName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  savedSites: SavedSite[];
  defaultLgaCode?: LgaCode;
  createdAt: IsoDateTime;
}

export interface AdminKpis {
  activeJobs: number;
  onlineArtisans: number;
  pendingVerifications: number;
  openDisputes: number;
  gmvToday: Kobo;
  completionRate7d: number;
  medianResponseSeconds: number;
}

/** High ratio = demand with no supply = the LGAs to onboard into next. */
export interface DemandSupplyGap {
  lgaCode: LgaCode;
  lgaName: string;
  openRequests: number;
  eligibleArtisans: number;
  ratio: number;
}

/* ═══════════════════ API envelope ═══════════════════ */

export type ApiMode = "mock" | "live";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export interface Paginated<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}
