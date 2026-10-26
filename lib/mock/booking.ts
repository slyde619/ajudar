import type {
  ApiError,
  ArtisanProfile,
  CreateJobInput,
  CreateReviewInput,
  Estimate,
  EstimateLineItem,
  EscrowMethod,
  JobEligibility,
  JobOffer,
  JobRequest,
  JobTracking,
  JobWorkStatus,
  Kobo,
  Negotiation,
  NegotiationMode,
  NegotiationRound,
  Result,
  Review,
  Trade,
  TradeCategory,
  WorkStage,
} from "@/lib/types";
import { haversineM } from "@/lib/utils/geo";
import { artisans, getMockArtisanById, isOnlineNow } from "./artisans";
import { getCategoryById } from "./categories";
import { getLgaByCode } from "./lgas";
import { artisanTopic, emit, jobTopic, mockStore, nextId, type PlannedOffer } from "./store";
import { SEED_TRIP_PATHS, synthesizePath, trackingSnapshot, tripFraction } from "./tracking";

export const MOCK_CUSTOMER_ID = "cust_adaeze";

export const MOCK_ARTISAN_ID = "art_chinedu_okafor";

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = (code: string, message: string): { ok: false; error: ApiError } => ({
  ok: false,
  error: { code, message },
});

const NAIRA = 100;
const STEP: Kobo = 500 * NAIRA;

function toStep(amount: number): Kobo {
  return Math.round(amount / STEP) * STEP;
}

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

const BASELINE: Record<Trade, { labour: number; materials: number; job: string; parts: string }> = {
  plumber: { labour: 14000, materials: 8000, job: "Plumbing repair", parts: "Pipe, fittings, sealant" },
  electrician: { labour: 12000, materials: 6000, job: "Fault finding and repair", parts: "Sockets, cable, breaker" },
  carpenter: { labour: 18000, materials: 12000, job: "Carpentry work", parts: "Timber, hinges, fixings" },
  painter: { labour: 25000, materials: 30000, job: "Painting, one room", parts: "Paint, primer, filler" },
  tiler: { labour: 20000, materials: 25000, job: "Tiling", parts: "Adhesive, grout, spacers" },
  welder: { labour: 18000, materials: 10000, job: "Welding and fabrication", parts: "Rods, steel, paint" },
  ac_technician: { labour: 7000, materials: 0, job: "Standard AC servicing", parts: "" },
  generator_mechanic: { labour: 15000, materials: 8000, job: "Generator diagnosis and repair", parts: "Plugs, filters, oil" },
  locksmith: { labour: 10000, materials: 3000, job: "Lock opening or change", parts: "Cylinder, keys" },
  cleaner: { labour: 15000, materials: 0, job: "Cleaning, standard home", parts: "" },
  mason: { labour: 20000, materials: 20000, job: "Masonry work", parts: "Cement, sand, blocks" },
  roofer: { labour: 25000, materials: 20000, job: "Roof repair", parts: "Sheets, nails, sealant" },
};

const TRANSPORT: Kobo = 3000 * NAIRA;
const ESTIMATE_TTL_MS = 2 * 60 * 60 * 1000;

export function effectiveMode(category: TradeCategory, job: Pick<JobRequest, "urgency">): NegotiationMode {
  return job.urgency === "emergency" ? "fixed" : category.negotiation;
}

function line(kind: EstimateLineItem["kind"], label: string, amount: Kobo, negotiable: boolean, note?: string): EstimateLineItem {
  return { id: nextId("li"), kind, label, amount, negotiable, note };
}

function buildEstimate(job: JobRequest, category: TradeCategory, nowMs: number): Estimate {
  const base = BASELINE[category.trade];
  const mode = effectiveMode(category, job);
  const labour = base.labour * NAIRA;
  const lga = getLgaByCode(job.site.lgaCode);

  const lineItems: EstimateLineItem[] = [line("labour", base.job, labour, mode === "bounded")];
  if (job.urgency === "emergency" && category.emergencySurgeMultiplier) {
    const surge = Math.round(labour * (category.emergencySurgeMultiplier - 1));
    lineItems.push(
      line("labour", "Emergency call-out", surge, false, `×${category.emergencySurgeMultiplier} on labour — they leave now`),
    );
  }
  lineItems.push(line("transport", `Call-out and transport within ${lga?.name ?? "your LGA"}`, TRANSPORT, false));
  if (base.materials > 0) {
    lineItems.push(line("materials", base.parts, base.materials * NAIRA, false, "Receipted. You pay what they cost"));
  }

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const band = mode === "bounded" ? category.bandPercent : 0;
  return {
    id: nextId("est"),
    jobId: job.id,
    lineItems,
    subtotal: total,
    total,
    negotiableBand: {
      min: band ? toStep((total * (100 - band)) / 100) : total,
      max: band ? toStep((total * (100 + band)) / 100) : total,
    },
    createdAt: iso(nowMs),
    expiresAt: iso(nowMs + ESTIMATE_TTL_MS),
  };
}

export function evaluateEligibility(job: JobRequest, artisan: ArtisanProfile, trade: Trade): JobEligibility {
  const base = { eligible: false as const, jobId: job.id, artisanId: artisan.id };
  if (artisan.suspended) return { ...base, reason: "suspended" };
  if (artisan.trade !== trade) return { ...base, reason: "trade_mismatch" };
  const { homeLgaCode, servedLgaCodes } = artisan.coverage;
  if (homeLgaCode !== job.site.lgaCode && !servedLgaCodes.includes(job.site.lgaCode)) {
    return { ...base, reason: "outside_lga" };
  }
  if (job.timing.mode === "now" && !isOnlineNow(artisan)) return { ...base, reason: "offline" };

  const distanceKm = Math.round(haversineM(artisan.base, job.site) / 100) / 10;
  return {
    eligible: true,
    jobId: job.id,
    artisanId: artisan.id,
    distanceKm,
    driveTimeToJobMinutes: Math.max(5, Math.round(distanceKm * 1.3 * 3)),
    rank: 0,
  };
}

export function notifyJob(job: JobRequest, atMs: number): void {
  emit({ type: "job.updated", topic: jobTopic(job.id), jobId: job.id, phase: job.phase }, atMs);
  if (job.artisanId) {
    emit({ type: "job.updated", topic: artisanTopic(job.artisanId), jobId: job.id, phase: job.phase }, atMs);
  }
}

export function eligibleArtisanIds(job: JobRequest): string[] {
  const category = getCategoryById(job.categoryId);
  if (!category) return [];
  return artisans
    .filter((artisan) => evaluateEligibility(job, artisan, category.trade).eligible)
    .map((artisan) => artisan.id);
}

function notifyFeed(job: JobRequest, type: "feed.request" | "feed.withdrawn", atMs: number, except?: string): void {
  for (const artisanId of eligibleArtisanIds(job)) {
    if (artisanId !== except) emit({ type, topic: artisanTopic(artisanId), jobId: job.id }, atMs);
  }
}

const COUNTER_REASONS: Partial<Record<Trade, string[]>> = {
  plumber: [
    "Joint looks corroded — I'll replace the section, not patch it.",
    "Includes a pressure test after the fix so it doesn't leak again tonight.",
    "I'll bring a spare valve in case the old one won't seal.",
  ],
};
const GENERIC_REASONS = [
  "Includes testing everything before I leave.",
  "From the photos it needs a little more time than standard.",
  "I'll bring spare parts so it's done in one visit.",
];

function planOffers(job: JobRequest, category: TradeCategory, nowMs: number): PlannedOffer[] {
  const estimate = job.estimate;
  if (!estimate) return [];
  const mode = effectiveMode(category, job);

  const matches = artisans
    .map((artisan) => ({ artisan, eligibility: evaluateEligibility(job, artisan, category.trade) }))
    .filter((entry) => entry.eligibility.eligible && entry.artisan.id !== MOCK_ARTISAN_ID)
    .sort((a, b) =>
      a.eligibility.eligible && b.eligibility.eligible
        ? a.eligibility.driveTimeToJobMinutes - b.eligibility.driveTimeToJobMinutes
        : 0,
    );

  const reasons = COUNTER_REASONS[category.trade] ?? GENERIC_REASONS;

  return matches.flatMap(({ artisan, eligibility }, index) => {
    if (!eligibility.eligible) return [];
    const arrivesAtMs = nowMs + 4000 + index * 5000;
    const system = estimate.lineItems;

    let lineItems = system.map((item) => ({ ...item, id: nextId("li") }));
    let reason = "Happy with the estimate. I can come now.";
    const hourly = artisan.rateCard.hourlyRate ?? 0;
    if (mode === "bounded" && hourly > 4000 * NAIRA) {
      const labourIndex = lineItems.findIndex((item) => item.negotiable);
      const fixed = estimate.total - lineItems[labourIndex].amount;
      const wanted = toStep(lineItems[labourIndex].amount * (hourly / (4000 * NAIRA)));
      const total = Math.min(fixed + wanted, estimate.negotiableBand.max);
      lineItems = lineItems.map((item, i) =>
        i === labourIndex ? { ...item, amount: total - fixed } : item,
      );
      reason = reasons[index % reasons.length];
    }

    const rounds: NegotiationRound[] = [
      {
        index: 0,
        actor: "system",
        total: estimate.total,
        lineItems: system,
        reason: `System estimate for ${category.label.toLowerCase()}.`,
        createdAt: estimate.createdAt,
        accepted: false,
      },
      {
        index: 1,
        actor: "artisan",
        total: lineItems.reduce((sum, item) => sum + item.amount, 0),
        lineItems,
        reason,
        createdAt: iso(arrivesAtMs),
        accepted: false,
      },
    ];
    const negotiation: Negotiation = {
      id: nextId("neg"),
      jobId: job.id,
      artisanId: artisan.id,
      rounds,
      maxRounds: mode === "bounded" ? category.maxNegotiationRounds : 1,
      expiresAt: estimate.expiresAt,
      status: "open",
    };
    return [{
      artisanId: artisan.id,
      arrivesAtMs,
      negotiation,
      distanceKm: eligibility.distanceKm,
      driveTimeToJobMinutes: eligibility.driveTimeToJobMinutes,
      rank: index + 1,
      announced: false,
    }];
  });
}

const ACCEPT_TO_DEPART_MS = 6000;
const REPLY_DELAY_MS = 6000;
const SIM_CUSTOMER_PICK_MS = 8000;
const SIM_CUSTOMER_CONFIRM_MS = 5000;
const TRACKING_EVERY_MS = 3000;
const WORK_STAGES: { stage: WorkStage; atSeconds: number }[] = [
  { stage: "started", atSeconds: 0 },
  { stage: "in_progress", atSeconds: 15 },
  { stage: "wrapping_up", atSeconds: 45 },
  { stage: "complete", atSeconds: 75 },
];

function participantRounds(negotiation: Negotiation): number {
  return negotiation.rounds.filter((round) => round.actor !== "system").length;
}

function lastRound(negotiation: Negotiation): NegotiationRound {
  return negotiation.rounds[negotiation.rounds.length - 1];
}

function agree(job: JobRequest, negotiation: Negotiation, nowMs: number): void {
  const last = lastRound(negotiation);
  last.accepted = true;
  negotiation.status = "agreed";
  negotiation.agreedTotal = last.total;
  negotiation.agreedAt = iso(nowMs);
  job.agreedTotal = last.total;
}

function artisanReply(job: JobRequest, negotiation: Negotiation, atMs: number): void {
  const customer = lastRound(negotiation);
  const previous = [...negotiation.rounds].reverse().find((round) => round.actor === "artisan");
  if (!previous) return;
  const gap = previous.total - customer.total;

  if (gap <= 2000 * NAIRA || participantRounds(negotiation) >= negotiation.maxRounds) {
    agree(job, negotiation, atMs);
    return;
  }
  const total = toStep(customer.total + gap / 2);
  const fixed = customer.lineItems.filter((item) => !item.negotiable).reduce((sum, item) => sum + item.amount, 0);
  negotiation.rounds.push({
    index: negotiation.rounds.length,
    actor: "artisan",
    total,
    lineItems: customer.lineItems.map((item) => ({
      ...item,
      id: nextId("li"),
      amount: item.negotiable ? total - fixed : item.amount,
    })),
    reason: "Meet you halfway — that still covers the parts run. Final from me.",
    createdAt: iso(atMs),
    accepted: false,
  });
}

function ensureTrip(job: JobRequest, nowMs: number) {
  const store = mockStore();
  const existing = store.trips.get(job.id);
  if (existing) return existing;
  const seed = SEED_TRIP_PATHS[job.id];
  if (seed) {
    const trip = { artisanId: seed.artisanId, path: seed.path, startsAtMs: nowMs };
    store.trips.set(job.id, trip);
    return trip;
  }
  return undefined;
}

function isSimulatedCustomer(job: JobRequest): boolean {
  return job.customerId !== MOCK_CUSTOMER_ID;
}

function isDemoArtisan(job: JobRequest): boolean {
  return job.artisanId === MOCK_ARTISAN_ID;
}

function setWorkStage(job: JobRequest, stage: WorkStage, atMs: number): void {
  mockStore().workStage.set(job.id, { stage, atMs });
  const status = workStatusOf(job.id);
  if (status) emit({ type: "job.work", topic: jobTopic(job.id), status }, atMs);
}

function dispatch(job: JobRequest, artisan: ArtisanProfile, nowMs: number): void {
  job.escrowFunded = true;
  job.phase = "accepted";
  job.completionCode = String(100000 + ((nowMs * 7919) % 900000));
  job.startedAt = iso(nowMs);
  job.updatedAt = iso(nowMs);
  mockStore().trips.set(job.id, {
    artisanId: artisan.id,
    path: synthesizePath(artisan.base, job.site),
    startsAtMs: nowMs + ACCEPT_TO_DEPART_MS,
  });
}

function startWork(job: JobRequest, nowMs: number): void {
  job.phase = "working";
  job.updatedAt = iso(nowMs);
  mockStore().workStartedAtMs.set(job.id, nowMs);
  notifyJob(job, nowMs);
  setWorkStage(job, "started", nowMs);
}

function advance(job: JobRequest, nowMs: number): JobRequest {
  const store = mockStore();
  const negotiation = job.negotiation;

  if (job.phase === "searching") {
    for (const offer of store.offers.get(job.id) ?? []) {
      if (!offer.announced && nowMs >= offer.arrivesAtMs) {
        offer.announced = true;
        emit({ type: "job.offer", topic: jobTopic(job.id), jobId: job.id, negotiationId: offer.negotiation.id }, offer.arrivesAtMs);
      }
    }
    const mine = store.offers.get(job.id)?.find((offer) => offer.artisanId === MOCK_ARTISAN_ID);
    const pickAt = mine ? mine.arrivesAtMs + SIM_CUSTOMER_PICK_MS : Infinity;
    const artisan = getMockArtisanById(MOCK_ARTISAN_ID);
    if (isSimulatedCustomer(job) && mine?.negotiation.status === "open" && nowMs >= pickAt && artisan) {
      job.phase = "negotiating";
      job.artisanId = MOCK_ARTISAN_ID;
      job.negotiation = structuredClone(mine.negotiation);
      agree(job, job.negotiation, pickAt);
      notifyFeed(job, "feed.withdrawn", pickAt, MOCK_ARTISAN_ID);
      dispatch(job, artisan, pickAt);
      notifyJob(job, pickAt);
    }
  }

  if (job.phase === "negotiating" && negotiation?.status === "open") {
    const replyAt = store.pendingReplyAtMs.get(job.id);
    if (replyAt !== undefined && nowMs >= replyAt) {
      store.pendingReplyAtMs.delete(job.id);
      artisanReply(job, negotiation, replyAt);
      job.updatedAt = iso(replyAt);
      notifyJob(job, replyAt);
    }
    if (negotiation.status === "open" && nowMs > Date.parse(negotiation.expiresAt)) {
      negotiation.status = "expired";
      notifyJob(job, Date.parse(negotiation.expiresAt));
    }
  }

  if (job.phase === "accepted") {
    const trip = store.trips.get(job.id);
    if (trip && nowMs >= trip.startsAtMs) {
      job.phase = "en_route";
      job.updatedAt = iso(trip.startsAtMs);
      notifyJob(job, trip.startsAtMs);
    }
  }

  if (job.phase === "en_route" && !isDemoArtisan(job)) {
    const trip = ensureTrip(job, nowMs);
    if (trip && tripFraction(trip, nowMs) >= 1) {
      job.phase = "arrived";
      job.arrivedAt = iso(nowMs);
      job.arrivalSelfie = { status: "verified", checkedAt: iso(nowMs) };
      job.updatedAt = iso(nowMs);
      notifyJob(job, nowMs);
    }
  }

  if (job.phase === "arrived" && isSimulatedCustomer(job) && job.arrivedAt) {
    const confirmAt = Date.parse(job.arrivedAt) + SIM_CUSTOMER_CONFIRM_MS;
    if (nowMs >= confirmAt) startWork(job, confirmAt);
  }

  if (job.phase === "working" && !isDemoArtisan(job)) {
    const startedAtMs = store.workStartedAtMs.get(job.id);
    if (startedAtMs !== undefined) {
      const elapsed = (nowMs - startedAtMs) / 1000;
      const due = WORK_STAGES.findLast((entry) => elapsed >= entry.atSeconds) ?? WORK_STAGES[0];
      if (store.workStage.get(job.id)?.stage !== due.stage) {
        setWorkStage(job, due.stage, startedAtMs + due.atSeconds * 1000);
      }
    }
  }

  return job;
}

export function findJob(id: string, nowMs: number): JobRequest | undefined {
  const job = mockStore().jobs.find((entry) => entry.id === id);
  return job ? advance(job, nowMs) : undefined;
}

export function pumpMockTracking(jobId: string, nowMs: number): void {
  const store = mockStore();
  const job = findJob(jobId, nowMs);
  if (!job || job.phase !== "en_route") return;
  const last = store.trackingEmittedAtMs.get(jobId) ?? 0;
  if (nowMs - last < TRACKING_EVERY_MS) return;
  const tracking = getMockJobTracking(jobId, nowMs);
  if (!tracking) return;
  store.trackingEmittedAtMs.set(jobId, nowMs);
  emit({ type: "job.tracking", topic: jobTopic(jobId), tracking }, nowMs);
}

export function listMockJobs(nowMs: number): JobRequest[] {
  return mockStore()
    .jobs.map((job) => advance(job, nowMs))
    .toSorted((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getMockJob(id: string, nowMs: number): JobRequest | undefined {
  return findJob(id, nowMs);
}

export function listMockOffers(jobId: string, nowMs: number): JobOffer[] {
  const job = findJob(jobId, nowMs);
  if (!job || job.phase !== "searching") return [];
  return (mockStore().offers.get(jobId) ?? [])
    .filter((offer) => nowMs >= offer.arrivesAtMs && offer.negotiation.status === "open")
    .toSorted((a, b) => a.driveTimeToJobMinutes - b.driveTimeToJobMinutes)
    .map((offer, index) => ({
      negotiation: offer.negotiation,
      match: {
        eligible: true,
        jobId,
        artisanId: offer.artisanId,
        distanceKm: offer.distanceKm,
        driveTimeToJobMinutes: offer.driveTimeToJobMinutes,
        rank: index + 1,
      },
    }));
}

export function getMockJobTracking(jobId: string, nowMs: number): JobTracking | undefined {
  const job = findJob(jobId, nowMs);
  if (!job || (job.phase !== "accepted" && job.phase !== "en_route")) return undefined;
  const trip = ensureTrip(job, nowMs);
  return trip ? trackingSnapshot(job.id, trip, Math.max(nowMs, trip.startsAtMs)) : undefined;
}

function workStatusOf(jobId: string): JobWorkStatus | undefined {
  const store = mockStore();
  const startedAtMs = store.workStartedAtMs.get(jobId);
  const current = store.workStage.get(jobId);
  if (startedAtMs === undefined || !current) return undefined;
  return {
    jobId,
    stage: current.stage,
    startedAt: iso(startedAtMs),
    estimatedMinutes: { min: 60, max: 120 },
    updatedAt: iso(current.atMs),
  };
}

export function getMockWorkStatus(jobId: string, nowMs: number): JobWorkStatus | undefined {
  const job = findJob(jobId, nowMs);
  if (!job || job.phase !== "working") return undefined;
  return workStatusOf(jobId);
}

export function listMockReviews(artisanId: string): Review[] {
  return mockStore()
    .reviews.filter((review) => review.artisanId === artisanId)
    .toSorted((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getMockReview(jobId: string): Review | undefined {
  return mockStore().reviews.find((review) => review.jobId === jobId);
}

export function createMockJob(input: CreateJobInput, nowMs: number, customerId = MOCK_CUSTOMER_ID): Result<JobRequest> {
  const category = getCategoryById(input.categoryId);
  if (!category) return fail("CATEGORY_NOT_FOUND", "That category doesn't exist.");
  if (input.title.trim().length < 4) return fail("TITLE_REQUIRED", "Give the job a short title.");
  if (input.description.trim().length < 10) {
    return fail("DESCRIPTION_REQUIRED", "Describe the problem in a sentence or two.");
  }
  if (!getLgaByCode(input.site.lgaCode)) return fail("OUTSIDE_PILOT", "We're not in that area yet.");
  if (input.urgency === "emergency" && !category.supportsEmergency) {
    return fail("EMERGENCY_UNSUPPORTED", `${category.label} doesn't take emergency call-outs.`);
  }

  const job: JobRequest = {
    id: nextId("job"),
    customerId,
    categoryId: category.id,
    title: input.title.trim(),
    description: input.description.trim(),
    attachments: [],
    site: input.site,
    timing: input.timing,
    urgency: input.urgency,
    phase: "estimating",
    escrowFunded: false,
    createdAt: iso(nowMs),
    updatedAt: iso(nowMs),
    scheduledFor: input.timing.mode === "scheduled" ? input.timing.scheduledFor : undefined,
  };
  job.estimate = buildEstimate(job, category, nowMs);
  mockStore().jobs.push(job);
  return ok(job);
}

export function startMockSearch(jobId: string, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job) return fail("JOB_NOT_FOUND", "That job doesn't exist.");
  const category = getCategoryById(job.categoryId);
  if (!category || !job.estimate) return fail("NO_ESTIMATE", "This job has no estimate yet.");
  if (job.phase !== "estimating") return fail("WRONG_PHASE", "This job is already past the estimate.");
  if (nowMs > Date.parse(job.estimate.expiresAt)) {
    job.estimate = buildEstimate(job, category, nowMs);
    return fail("ESTIMATE_EXPIRED", "The estimate expired, so we refreshed it. Check the new total.");
  }

  job.phase = "searching";
  job.updatedAt = iso(nowMs);
  mockStore().offers.set(job.id, planOffers(job, category, nowMs));
  notifyJob(job, nowMs);
  notifyFeed(job, "feed.request", nowMs);
  return ok(job);
}

export function selectMockOffer(jobId: string, negotiationId: string, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job) return fail("JOB_NOT_FOUND", "That job doesn't exist.");
  if (job.phase !== "searching") return fail("WRONG_PHASE", "You've already chosen an artisan.");
  const offer = listMockOffers(jobId, nowMs).find((entry) => entry.negotiation.id === negotiationId);
  if (!offer) return fail("OFFER_UNAVAILABLE", "That offer is no longer available.");
  const category = getCategoryById(job.categoryId);
  const windowMinutes = category?.negotiationWindowMinutes || 30;

  job.phase = "negotiating";
  job.artisanId = offer.match.artisanId;
  job.negotiation = { ...structuredClone(offer.negotiation), expiresAt: iso(nowMs + windowMinutes * 60_000) };
  job.updatedAt = iso(nowMs);
  notifyJob(job, nowMs);
  notifyFeed(job, "feed.withdrawn", nowMs, job.artisanId);
  return ok(job);
}

function validateCounter(job: JobRequest, total: Kobo, reason: string, previousTotal: Kobo): ApiError | null {
  if (!job.estimate) return { code: "NO_ESTIMATE", message: "This job has no estimate." };
  if (!Number.isInteger(total) || total % STEP !== 0) return { code: "INVALID_AMOUNT", message: "Counter in steps of ₦500." };
  const { min, max } = job.estimate.negotiableBand;
  if (total < min || total > max) return { code: "OUT_OF_BAND", message: "That's outside the fair range for this job." };
  if (total === previousTotal) return { code: "NOT_A_COUNTER", message: "That's the same price — accept it instead." };
  if (reason.trim().length < 3) return { code: "REASON_REQUIRED", message: "Say why — it helps them agree." };
  return null;
}

function pushRound(negotiation: Negotiation, actor: "customer" | "artisan", total: Kobo, reason: string, nowMs: number): void {
  const last = lastRound(negotiation);
  const fixed = last.lineItems.filter((item) => !item.negotiable).reduce((sum, item) => sum + item.amount, 0);
  negotiation.rounds.push({
    index: negotiation.rounds.length,
    actor,
    total,
    lineItems: last.lineItems.map((item) => ({
      ...item,
      id: nextId("li"),
      amount: item.negotiable ? total - fixed : item.amount,
    })),
    reason: reason.trim().slice(0, 200),
    createdAt: iso(nowMs),
    accepted: false,
  });
}

function openNegotiation(job: JobRequest, nowMs: number): Result<Negotiation> {
  const negotiation = job.negotiation;
  const category = getCategoryById(job.categoryId);
  if (job.phase !== "negotiating" || !negotiation || !category || !job.estimate) {
    return fail("WRONG_PHASE", "There's no open negotiation on this job.");
  }
  if (negotiation.status === "expired" || nowMs > Date.parse(negotiation.expiresAt)) {
    return fail("NEGOTIATION_EXPIRED", "Time ran out on this negotiation.");
  }
  if (negotiation.status !== "open") return fail("NEGOTIATION_CLOSED", "This negotiation is closed.");
  return ok(negotiation);
}

export function counterMock(jobId: string, total: Kobo, reason: string, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job) return fail("JOB_NOT_FOUND", "That job doesn't exist.");
  const open = openNegotiation(job, nowMs);
  if (!open.ok) return open;
  const negotiation = open.data;
  const category = getCategoryById(job.categoryId);
  if (!category || effectiveMode(category, job) !== "bounded") {
    return fail("NEGOTIATION_NOT_ALLOWED", "This price is fixed — it can't be countered.");
  }
  const last = lastRound(negotiation);
  if (last.actor !== "artisan" || mockStore().pendingReplyAtMs.has(jobId)) {
    return fail("NOT_YOUR_TURN", "Wait for the artisan's reply.");
  }
  if (participantRounds(negotiation) >= negotiation.maxRounds) {
    return fail("ROUNDS_EXHAUSTED", "That was the final offer. Accept it or choose someone else.");
  }
  const invalid = validateCounter(job, total, reason, last.total);
  if (invalid) return { ok: false, error: invalid };
  if (total > last.total) return fail("NOT_A_COUNTER", "That's not lower than their offer — just accept it.");
  const fixed = last.lineItems.filter((item) => !item.negotiable).reduce((sum, item) => sum + item.amount, 0);
  if (total - fixed <= 0) return fail("OUT_OF_BAND", "That leaves nothing for labour.");

  pushRound(negotiation, "customer", total, reason, nowMs);
  if (!isDemoArtisan(job)) mockStore().pendingReplyAtMs.set(jobId, nowMs + REPLY_DELAY_MS);
  job.updatedAt = iso(nowMs);
  notifyJob(job, nowMs);
  return ok(job);
}

export function acceptMockOffer(jobId: string, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  const negotiation = job?.negotiation;
  if (!job || job.phase !== "negotiating" || !negotiation) {
    return fail("WRONG_PHASE", "There's no offer to accept on this job.");
  }
  if (negotiation.status !== "open") return fail("NEGOTIATION_CLOSED", "This negotiation is closed.");
  if (lastRound(negotiation).actor !== "artisan") return fail("NOT_YOUR_TURN", "Wait for the artisan's reply.");
  agree(job, negotiation, nowMs);
  job.updatedAt = iso(nowMs);
  notifyJob(job, nowMs);
  return ok(job);
}

export function releaseMockOffer(jobId: string, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job || job.phase !== "negotiating" || !job.negotiation) {
    return fail("WRONG_PHASE", "There's no negotiation to leave.");
  }
  if (job.negotiation.status === "agreed") return fail("NEGOTIATION_CLOSED", "You've already agreed a price.");
  const store = mockStore();
  const releasedId = job.negotiation.id;
  const releasedArtisan = job.artisanId;
  store.offers.get(jobId)?.forEach((offer) => {
    if (offer.negotiation.id === releasedId) offer.negotiation.status = "withdrawn";
  });
  store.pendingReplyAtMs.delete(jobId);
  job.phase = "searching";
  job.artisanId = undefined;
  job.negotiation = undefined;
  job.agreedTotal = undefined;
  job.updatedAt = iso(nowMs);
  notifyJob(job, nowMs);
  if (releasedArtisan) {
    emit({ type: "feed.withdrawn", topic: artisanTopic(releasedArtisan), jobId }, nowMs);
    store.passed.set(releasedArtisan, (store.passed.get(releasedArtisan) ?? new Set()).add(jobId));
  }
  notifyFeed(job, "feed.request", nowMs, releasedArtisan);
  return ok(job);
}

export function fundMockEscrow(jobId: string, method: EscrowMethod, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job || job.negotiation?.status !== "agreed" || !job.artisanId) {
    return fail("PRICE_NOT_LOCKED", "Agree a price before paying into escrow.");
  }
  if (job.escrowFunded) return fail("ALREADY_FUNDED", "Escrow is already funded.");
  if (method !== "card" && method !== "bank_transfer") return fail("INVALID_METHOD", "Choose card or bank transfer.");
  const artisan = getMockArtisanById(job.artisanId);
  if (!artisan) return fail("ARTISAN_NOT_FOUND", "That artisan is no longer available.");

  dispatch(job, artisan, nowMs);
  notifyJob(job, nowMs);
  return ok(job);
}

export function confirmMockArrival(jobId: string, isBookedPerson: boolean, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job || job.phase !== "arrived") return fail("WRONG_PHASE", "The artisan hasn't arrived yet.");
  if (!isBookedPerson) {
    job.phase = "disputed";
    job.cancellationReason = "Customer reported the person at the door is not the booked artisan.";
    job.updatedAt = iso(nowMs);
    notifyJob(job, nowMs);
    return ok(job);
  }
  startWork(job, nowMs);
  return ok(job);
}

export function completeMockJob(jobId: string, code: string, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job || job.phase !== "working") return fail("WRONG_PHASE", "This job isn't in progress.");
  if (code.trim() !== job.completionCode) return fail("WRONG_CODE", "That code doesn't match. Ask the customer to read it again.");
  job.phase = "complete";
  job.payoutStatus = "released";
  job.completedAt = iso(nowMs);
  job.updatedAt = iso(nowMs);
  mockStore().workStartedAtMs.delete(jobId);
  mockStore().workStage.delete(jobId);
  notifyJob(job, nowMs);
  return ok(job);
}

export function reviewMockJob(jobId: string, input: CreateReviewInput, nowMs: number): Result<Review> {
  const job = findJob(jobId, nowMs);
  if (!job || job.phase !== "complete" || !job.artisanId) {
    return fail("WRONG_PHASE", "You can rate a job once it's complete.");
  }
  if (getMockReview(jobId)) return fail("ALREADY_REVIEWED", "You've already rated this job.");
  if (![1, 2, 3, 4, 5].includes(input.rating)) return fail("INVALID_RATING", "Pick 1 to 5 stars.");

  const review: Review = {
    id: nextId("rev"),
    jobId,
    artisanId: job.artisanId,
    customerId: job.customerId,
    rating: input.rating,
    tags: input.tags.slice(0, 5),
    comment: input.comment?.trim().slice(0, 500) || undefined,
    createdAt: iso(nowMs),
  };
  mockStore().reviews.push(review);
  notifyJob(job, nowMs);
  return ok(review);
}

const CANCELLABLE = new Set<JobRequest["phase"]>(["draft", "estimating", "searching", "negotiating"]);

export function cancelMockJob(jobId: string, reason: string, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job) return fail("JOB_NOT_FOUND", "That job doesn't exist.");
  if (!CANCELLABLE.has(job.phase) || job.escrowFunded) {
    return fail("NOT_CANCELLABLE", "This job can't be cancelled here.");
  }
  const store = mockStore();
  const wasOpen = job.phase === "searching";
  store.offers.delete(jobId);
  store.pendingReplyAtMs.delete(jobId);
  job.phase = "cancelled";
  job.cancelledAt = iso(nowMs);
  job.cancellationReason = reason.trim() || "Cancelled by customer";
  job.updatedAt = iso(nowMs);
  notifyJob(job, nowMs);
  if (wasOpen) notifyFeed(job, "feed.withdrawn", nowMs);
  return ok(job);
}

export { agree, dispatch, isDemoArtisan, lastRound, participantRounds, pushRound, openNegotiation, setWorkStage, validateCounter, WORK_STAGES };
