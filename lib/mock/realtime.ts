import type { RealtimeBatch, RealtimeSubscription, RealtimeTopic } from "@/lib/types";
import { findJob, listMockJobs, pumpMockTracking } from "./booking";
import { advanceMockApplication } from "./onboarding";
import { mockStore } from "./store";

export function pullMockEvents(subscriptions: RealtimeSubscription[], nowMs: number): RealtimeBatch {
  for (const { topic } of subscriptions) {
    const [kind, id] = topic.split(":") as [string, string];
    if (kind === "job") {
      findJob(id, nowMs);
      pumpMockTracking(id, nowMs);
    } else if (kind === "artisan") {
      listMockJobs(nowMs);
    } else if (kind === "applicant") {
      advanceMockApplication(id, nowMs);
    }
  }

  const store = mockStore();
  const oldest = store.outbox[0]?.seq ?? store.outboxSeq + 1;
  const head = store.outboxSeq;
  const batch: RealtimeBatch = { events: [], cursors: {}, resync: [] };

  for (const { topic, since } of subscriptions) {
    if (since < oldest - 1) {
      batch.resync.push(topic);
    } else {
      batch.events.push(...store.outbox.filter((event) => event.topic === topic && event.seq > since));
    }
    batch.cursors[topic] = head;
  }
  batch.events.sort((a, b) => a.seq - b.seq);
  return batch;
}

export function getMockRealtimeCursor(): number {
  return mockStore().outboxSeq;
}

export function isRealtimeTopic(value: string): value is RealtimeTopic {
  return /^(job|artisan|applicant):[\w-]+$/.test(value);
}
