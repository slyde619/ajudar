import type {
  ArtisanEarnings,
  ArtisanOfferInput,
  Coordinates,
  EarningsLine,
  FeedRequest,
  JobRequest,
  Negotiation,
  Result,
  WorkStage,
} from "@/lib/types";
import { haversineM } from "@/lib/utils/geo";
import { getMockArtisanById } from "./artisans";
import {
  agree,
  createMockJob,
  effectiveMode,
  evaluateEligibility,
  findJob,
  getMockJobTracking,
  isDemoArtisan,
  lastRound,
  listMockJobs,
  MOCK_ARTISAN_ID,
  MOCK_CUSTOMER_ID,
  notifyJob,
  openNegotiation,
  participantRounds,
  pushRound,
  setWorkStage,
  startMockSearch,
  validateCounter,
  WORK_STAGES,
} from "./booking";
import { getCategoryById } from "./categories";
import { artisanTopic, emit, jobTopic, mockStore, nextId } from "./store";

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = (code: string, message: string): Result<never> => ({ ok: false, error: { code, message } });

const iso = (ms: number) => new Date(ms).toISOString();

const ARRIVAL_RADIUS_M = 300;

const ACCEPT_REASON = "Happy with the estimate. I can come now.";

function ensureFeedSeeded(nowMs: number): void {
  const store = mockStore();
  if (store.feedSeeded) return;
  store.feedSeeded = true;

  const tomorrowTen = new Date(nowMs + 24 * 60 * 60 * 1000);
  tomorrowTen.setUTCHours(9, 0, 0, 0);

  const seeds: { customerId: string; minutesAgo: number; input: Parameters<typeof createMockJob>[0] }[] = [
    {
      customerId: "cust_kemi",
      minutesAgo: 2,
      input: {
        categoryId: "cat_plumbing_repair",
        title: "Kitchen tap won't stop dripping",
        description: "The mixer tap in the kitchen drips all night even when fully closed. I think the cartridge is gone.",
        site: { lat: 4.821, lng: 6.996, lgaCode: "NG-RI-OBIO-AKPOR", landmark: "GRA Phase 2, green gate beside the church on Tombia Street", pinConfirmedByUser: true },
        timing: { mode: "now" },
        urgency: "standard",
      },
    },
    {
      customerId: "cust_femi",
      minutesAgo: 6,
      input: {
        categoryId: "cat_plumbing_repair",
        title: "Toilet cistern keeps running",
        description: "Water keeps running into the bowl after flushing. The float seems stuck. Upstairs bathroom.",
        site: { lat: 4.792, lng: 7.02, lgaCode: "NG-RI-PORT-HARCOURT", landmark: "Old GRA, white duplex opposite the park", pinConfirmedByUser: true },
        timing: { mode: "scheduled", scheduledFor: tomorrowTen.toISOString(), windowMinutes: 120 },
        urgency: "standard",
      },
    },
  ];

  for (const seed of seeds) {
    const at = nowMs - seed.minutesAgo * 60_000;
    const created = createMockJob(seed.input, at, seed.customerId);
    if (created.ok) startMockSearch(created.data.id, at);
  }
}

function myOffer(jobId: string, artisanId: string) {
  return mockStore().offers.get(jobId)?.find((offer) => offer.artisanId === artisanId);
}

function toFeedRequest(job: JobRequest, artisanId: string): FeedRequest | null {
  const artisan = getMockArtisanById(artisanId);
  const category = getCategoryById(job.categoryId);
  if (!artisan || !category || !job.estimate) return null;
  const eligibility = evaluateEligibility(job, artisan, category.trade);
  if (!eligibility.eligible) return null;
  const offer = myOffer(job.id, artisanId);
  if (offer && offer.negotiation.status !== "open") return null;

  return {
    jobId: job.id,
    categoryId: job.categoryId,
    title: job.title,
    description: job.description,
    photoCount: job.attachments.filter((attachment) => attachment.kind === "photo").length,
    lgaCode: job.site.lgaCode,
    timing: job.timing,
    urgency: job.urgency,
    estimate: structuredClone(job.estimate),
    mode: effectiveMode(category, job),
    match: eligibility,
    postedAt: job.updatedAt,
    myOffer: offer ? structuredClone(offer.negotiation.rounds[1]) : undefined,
  };
}

export function listMockFeed(artisanId: string, nowMs: number): FeedRequest[] {
  ensureFeedSeeded(nowMs);
  const passed = mockStore().passed.get(artisanId);
  return listMockJobs(nowMs)
    .filter((job) => job.phase === "searching" && !passed?.has(job.id))
    .map((job) => toFeedRequest(job, artisanId))
    .filter((request): request is FeedRequest => request !== null)
    .toSorted((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
}

export function getMockFeedRequest(jobId: string, artisanId: string, nowMs: number): FeedRequest | undefined {
  return listMockFeed(artisanId, nowMs).find((request) => request.jobId === jobId);
}

export function respondMockFeed(jobId: string, artisanId: string, input: ArtisanOfferInput, nowMs: number): Result<FeedRequest> {
  const request = getMockFeedRequest(jobId, artisanId, nowMs);
  const job = findJob(jobId, nowMs);
  const category = job ? getCategoryById(job.categoryId) : undefined;
  if (!request || !job || !job.estimate || !category) return fail("REQUEST_GONE", "This request is no longer open.");
  if (request.myOffer) return fail("ALREADY_ANSWERED", "You've already answered this request.");

  const estimate = job.estimate;
  let total = estimate.total;
  let reason = ACCEPT_REASON;
  if (input.kind === "counter") {
    if (request.mode !== "bounded") return fail("NEGOTIATION_NOT_ALLOWED", "This job is fixed-price. Accept it or pass.");
    const invalid = validateCounter(job, input.total, input.reason, estimate.total);
    if (invalid) return { ok: false, error: invalid };
    total = input.total;
    reason = input.reason.trim();
  }

  const fixed = estimate.lineItems.filter((item) => !item.negotiable).reduce((sum, item) => sum + item.amount, 0);
  if (total - fixed <= 0) return fail("OUT_OF_BAND", "That leaves nothing for labour.");
  const negotiation: Negotiation = {
    id: nextId("neg"),
    jobId,
    artisanId,
    maxRounds: request.mode === "bounded" ? category.maxNegotiationRounds : 1,
    expiresAt: estimate.expiresAt,
    status: "open",
    rounds: [
      {
        index: 0,
        actor: "system",
        total: estimate.total,
        lineItems: estimate.lineItems,
        reason: `System estimate for ${category.label.toLowerCase()}.`,
        createdAt: estimate.createdAt,
        accepted: false,
      },
      {
        index: 1,
        actor: "artisan",
        total,
        lineItems: estimate.lineItems.map((item) => ({
          ...item,
          id: nextId("li"),
          amount: item.negotiable ? total - fixed : item.amount,
        })),
        reason: reason.slice(0, 200),
        createdAt: iso(nowMs),
        accepted: false,
      },
    ],
  };

  const store = mockStore();
  const offers = store.offers.get(jobId) ?? [];
  offers.push({
    artisanId,
    arrivesAtMs: nowMs,
    negotiation,
    distanceKm: request.match.distanceKm,
    driveTimeToJobMinutes: request.match.driveTimeToJobMinutes,
    rank: request.match.driveTimeToJobMinutes,
    announced: true,
  });
  store.offers.set(jobId, offers);
  emit({ type: "job.offer", topic: jobTopic(jobId), jobId, negotiationId: negotiation.id }, nowMs);

  return ok({ ...request, myOffer: structuredClone(negotiation.rounds[1]) });
}

export function passMockFeed(jobId: string, artisanId: string, nowMs: number): Result<null> {
  const store = mockStore();
  const offer = myOffer(jobId, artisanId);
  if (offer && offer.negotiation.status === "open") offer.negotiation.status = "withdrawn";
  store.passed.set(artisanId, (store.passed.get(artisanId) ?? new Set()).add(jobId));
  emit({ type: "feed.withdrawn", topic: artisanTopic(artisanId), jobId }, nowMs);
  if (offer) emit({ type: "job.updated", topic: jobTopic(jobId), jobId, phase: "searching" }, nowMs);
  return ok(null);
}

function ownJob(jobId: string, artisanId: string, nowMs: number): Result<JobRequest> {
  const job = findJob(jobId, nowMs);
  if (!job || job.artisanId !== artisanId) return fail("JOB_NOT_FOUND", "That job isn't yours.");
  return ok(job);
}

export function artisanRespondMock(jobId: string, artisanId: string, input: ArtisanOfferInput, nowMs: number): Result<JobRequest> {
  const owned = ownJob(jobId, artisanId, nowMs);
  if (!owned.ok) return owned;
  const job = owned.data;
  const open = openNegotiation(job, nowMs);
  if (!open.ok) return open;
  const negotiation = open.data;
  const customer = lastRound(negotiation);
  if (customer.actor !== "customer") return fail("NOT_YOUR_TURN", "Wait for the customer.");

  if (input.kind === "accept") {
    agree(job, negotiation, nowMs);
  } else {
    if (participantRounds(negotiation) >= negotiation.maxRounds) {
      return fail("ROUNDS_EXHAUSTED", "No rounds left. Accept their price or let it go.");
    }
    const invalid = validateCounter(job, input.total, input.reason, customer.total);
    if (invalid) return { ok: false, error: invalid };
    const yours = [...negotiation.rounds].reverse().find((round) => round.actor === "artisan");
    if (input.total < customer.total || (yours && input.total > yours.total)) {
      return fail("OUT_OF_RANGE", "Your final offer has to sit between their price and your last one.");
    }
    pushRound(negotiation, "artisan", input.total, input.reason, nowMs);
  }
  job.updatedAt = iso(nowMs);
  notifyJob(job, nowMs);
  return ok(job);
}

export function mockArtisanPosition(jobId: string, nowMs: number): Coordinates | undefined {
  return getMockJobTracking(jobId, nowMs)?.artisanLocation.coords;
}

export function markMockArrived(jobId: string, artisanId: string, selfieRef: string, nowMs: number): Result<JobRequest> {
  const owned = ownJob(jobId, artisanId, nowMs);
  if (!owned.ok) return owned;
  const job = owned.data;
  if (job.phase !== "en_route") return fail("WRONG_PHASE", "You can only arrive while travelling to the job.");
  if (!selfieRef) return fail("SELFIE_REQUIRED", "Take the arrival selfie first.");
  const position = mockArtisanPosition(jobId, nowMs);
  const distance = position ? haversineM(position, job.site) : Infinity;
  if (distance > ARRIVAL_RADIUS_M) {
    const label = distance === Infinity ? "far" : distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`;
    return fail("TOO_FAR", `You're ${label} from the pin. Arrive when you're at the gate.`);
  }

  job.phase = "arrived";
  job.arrivedAt = iso(nowMs);
  job.arrivalSelfie = { status: "verified", checkedAt: iso(nowMs) };
  job.updatedAt = iso(nowMs);
  notifyJob(job, nowMs);
  return ok(job);
}

export function setMockWorkStage(jobId: string, artisanId: string, stage: WorkStage, nowMs: number): Result<JobRequest> {
  const owned = ownJob(jobId, artisanId, nowMs);
  if (!owned.ok) return owned;
  const job = owned.data;
  if (job.phase !== "working") return fail("WRONG_PHASE", "The job hasn't started.");
  const order = WORK_STAGES.map((entry) => entry.stage);
  const current = mockStore().workStage.get(jobId)?.stage ?? "started";
  if (order.indexOf(stage) <= order.indexOf(current)) return fail("STAGE_BACKWARDS", "That step is already done.");
  setWorkStage(job, stage, nowMs);
  job.updatedAt = iso(nowMs);
  return ok(job);
}

export function getMockSpokenCode(jobId: string, nowMs: number): string | undefined {
  const job = findJob(jobId, nowMs);
  if (!job || job.phase !== "working" || !isDemoArtisan(job)) return undefined;
  if (mockStore().workStage.get(jobId)?.stage !== "complete") return undefined;
  return job.customerId === MOCK_CUSTOMER_ID ? undefined : job.completionCode;
}

export function setMockOnline(artisanId: string, online: boolean): Result<boolean> {
  if (!getMockArtisanById(artisanId)) return fail("ARTISAN_NOT_FOUND", "No such artisan.");
  mockStore().online.set(artisanId, online);
  return ok(online);
}

export function getMockEarnings(artisanId: string, nowMs: number): ArtisanEarnings {
  const lines: EarningsLine[] = listMockJobs(nowMs)
    .filter((job) => job.artisanId === artisanId && job.escrowFunded && job.agreedTotal !== undefined)
    .filter((job) => job.phase !== "cancelled")
    .map((job) => ({
      jobId: job.id,
      title: job.title,
      categoryId: job.categoryId,
      amount: job.agreedTotal ?? 0,
      status: job.phase === "complete" ? (job.payoutStatus ?? "released") : "in_escrow",
      at: job.completedAt ?? job.startedAt ?? job.createdAt,
    }))
    .toSorted((a, b) => Date.parse(b.at) - Date.parse(a.at));

  const sum = (status: EarningsLine["status"]) =>
    lines.filter((line) => line.status === status).reduce((total, line) => total + line.amount, 0);
  return { artisanId, inEscrow: sum("in_escrow"), released: sum("released"), paidOut: sum("paid_out"), lines };
}

export { MOCK_ARTISAN_ID };
