export type StateCode = `NG-${string}`;
export type LgaCode = string;
export type Kobo = number;
export type Currency = "NGN";
export type Id = string;
export type IsoDateTime = string;

export interface Coordinates { lat: number; lng: number; }

export interface GeoPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

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
  landmark: string;
  pinConfirmedByUser: boolean;
  accuracyM?: number;
  savedLabel?: "home" | "work" | "other";
  plusCode?: string;
}

export type LocationStatus =
  | "unknown" | "requesting" | "resolving" | "confirmed"
  | "manual" | "stale" | "denied" | "unavailable";

export type LocationState =
  | { status: "unknown" }
  | { status: "requesting" }
  | { status: "resolving" }
  | { status: "confirmed"; site: JobSite; resolvedAt: IsoDateTime }
  | { status: "manual"; site: JobSite }
  | { status: "stale"; site: JobSite; resolvedAt: IsoDateTime }
  | { status: "denied" }
  | { status: "unavailable" };

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

export type VerificationTier =
  | "unverified" | "pending" | "listed" | "certified" | "top";

export interface ArtisanVerification {
  tier: VerificationTier;

  ninVerified: boolean;
  ninVerifiedAt?: IsoDateTime;
  bvnVerified: boolean;
  selfieMatchScore?: number;

  guarantorName?: string;
  guarantorPhone?: string;
  guarantorConfirmed: boolean;
  guarantorConfirmedAt?: IsoDateTime;

  portfolioPhotoCount: number;
  portfolioMinRequired: number;
  tradeCertificateUrl?: string;
  apprenticeshipYears?: number;
  skillVideoUrl?: string;

  addressConfirmed: boolean;
  serviceAreaConfirmed: boolean;

  probationJobsRemaining: number;

  onArrivalSelfieEnabled: boolean;

  manualReviewRequired: boolean;
  manualReviewReason?: string;
}

export interface VerificationSignal {
  key: string;
  label: string;
  verified: boolean;
  detail?: string;
}

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
  polygonGeoJSON: GeoPolygon | null;
  updatedAt: IsoDateTime;
}

export interface ArtisanStats {
  jobsCompleted: number;
  jobsCancelled: number;
  completionRate: number;
  averageRating: number;
  ratingCount: number;
  ratingTrend: number;
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
  verified: boolean;
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

export interface ArtisanLocation {
  artisanId: Id;
  coords: Coordinates;
  accuracyM?: number;
  updatedAt: IsoDateTime;
  source: "foreground" | "base";
}

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

export interface DemandSupplyGap {
  lgaCode: LgaCode;
  lgaName: string;
  openRequests: number;
  eligibleArtisans: number;
  ratio: number;
}

export interface LgaBoundary {
  lgaCode: LgaCode;
  name: string;
  stateCode: StateCode;
  polygons: GeoPolygon[];
}

export interface RoutePath {
  coordinates: [lng: number, lat: number][];
  distanceM: number;
  durationSeconds: number;
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

export interface JobOffer {
  negotiation: Negotiation;
  match: JobEligibilityMatch;
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

export interface CreateReviewInput {
  rating: Review["rating"];
  tags: string[];
  comment?: string;
}

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

export type OnboardingCheck =
  | "profile" | "identity" | "guarantor" | "portfolio"
  | "skill_video" | "address" | "consent";

export type CheckStatus =
  | "not_started" | "in_progress" | "pending_review" | "verified" | "rejected";

export interface ApplicationCheck {
  status: CheckStatus;
  note?: string;
  updatedAt?: IsoDateTime;
}

export interface ArtisanApplication {
  id: Id;
  profile: { displayName: string; phone: string; trade?: Trade; yearsExperience?: number; specialties: string[] };
  identity: { ninLast4?: string; providerRef?: string };
  guarantor: { name?: string; phone?: string; relationship?: string };
  portfolio: { photoUrls: string[]; certificateUrl?: string; apprenticeshipYears?: number };
  skillVideoUrl?: string;
  address: { baseAddress?: string; homeLgaCode?: LgaCode; servedLgaCodes: LgaCode[] };
  consent: { acceptedAt?: IsoDateTime; version?: string };
  checks: Record<OnboardingCheck, ApplicationCheck>;
  submittedAt?: IsoDateTime;
  updatedAt: IsoDateTime;
}

export type ApplicationStepInput =
  | { step: "profile"; displayName: string; trade: Trade; yearsExperience: number; specialties: string[] }
  | { step: "identity"; nin: string; providerRef: string }
  | { step: "guarantor"; name: string; phone: string; relationship: string }
  | { step: "portfolio"; photoUrls: string[]; certificateUrl?: string; apprenticeshipYears?: number }
  | { step: "skill_video"; videoUrl?: string }
  | { step: "address"; baseAddress: string; homeLgaCode: LgaCode; servedLgaCodes: LgaCode[] }
  | { step: "consent"; version: string };

export interface IdentityCheckSession {
  provider: "smile_id";
  partnerId: string;
  token: string;
  jobId: string;
  environment: "sandbox" | "production";
  product: "biometric_kyc" | "smartselfie_authentication";
}

export interface UploadTicket {
  uploadUrl: string | null;
  fileUrl: string;
  headers?: Record<string, string>;
}

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
