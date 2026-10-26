import type {
  ArtisanApplication,
  Id,
  JobRequest,
  Negotiation,
  RealtimeEvent,
  RealtimeTopic,
  Review,
  WorkStage,
} from "@/lib/types";
import { jobs as seedJobs } from "./jobs";

export interface PlannedOffer {
  artisanId: Id;
  arrivesAtMs: number;
  negotiation: Negotiation;
  distanceKm: number;
  driveTimeToJobMinutes: number;
  rank: number;
  announced: boolean;
}

export interface MockTrip {
  artisanId: Id;
  path: [number, number][];
  startsAtMs: number;
}

type Unsequenced<T> = T extends RealtimeEvent ? Omit<T, "seq" | "at"> : never;
export type OutboxDraft = Unsequenced<RealtimeEvent>;

interface MockStore {
  version: number;
  seq: number;
  jobs: JobRequest[];
  offers: Map<Id, PlannedOffer[]>;
  pendingReplyAtMs: Map<Id, number>;
  trips: Map<Id, MockTrip>;
  workStartedAtMs: Map<Id, number>;
  workStage: Map<Id, { stage: WorkStage; atMs: number }>;
  feedSeeded: boolean;
  reviews: Review[];
  passed: Map<Id, Set<Id>>;
  online: Map<Id, boolean>;
  applications: Map<Id, ArtisanApplication>;
  verdictAtMs: Map<Id, number>;
  trackingEmittedAtMs: Map<Id, number>;
  outbox: RealtimeEvent[];
  outboxSeq: number;
}

const STORE_VERSION = 3;

export const OUTBOX_RETAIN = 2000;

function seed(): MockStore {
  return {
    version: STORE_VERSION,
    seq: 100,
    jobs: structuredClone(seedJobs),
    offers: new Map(),
    pendingReplyAtMs: new Map(),
    trips: new Map(),
    workStartedAtMs: new Map(),
    workStage: new Map(),
    feedSeeded: false,
    reviews: [],
    passed: new Map(),
    online: new Map(),
    applications: new Map(),
    verdictAtMs: new Map(),
    trackingEmittedAtMs: new Map(),
    outbox: [],
    outboxSeq: 0,
  };
}

const holder = globalThis as typeof globalThis & { __ajudarMock?: MockStore };

export function mockStore(): MockStore {
  if (holder.__ajudarMock?.version !== STORE_VERSION) holder.__ajudarMock = seed();
  return holder.__ajudarMock;
}

export function nextId(prefix: string): Id {
  const store = mockStore();
  store.seq += 1;
  return `${prefix}_${store.seq}`;
}

export function emit(draft: OutboxDraft, atMs: number): void {
  const store = mockStore();
  store.outboxSeq += 1;
  store.outbox.push({ ...draft, seq: store.outboxSeq, at: new Date(atMs).toISOString() } as RealtimeEvent);
  if (store.outbox.length > OUTBOX_RETAIN) store.outbox.splice(0, store.outbox.length - OUTBOX_RETAIN);
}

export function jobTopic(jobId: Id): RealtimeTopic {
  return `job:${jobId}`;
}

export function artisanTopic(artisanId: Id): RealtimeTopic {
  return `artisan:${artisanId}`;
}

export function applicantTopic(applicantId: Id): RealtimeTopic {
  return `applicant:${applicantId}`;
}
