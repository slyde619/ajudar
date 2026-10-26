"use client";

import { respondToCounterAction } from "@/app/_actions/supply";
import { OfferResponder } from "@/components/negotiation/offer-responder";
import type { Kobo } from "@/lib/types";
import { formatNaira } from "@/lib/utils/money";

const STEP: Kobo = 50_000;
const QUICK_REASONS = ["Covers the parts run", "It's more work than it looks", "Meet me halfway"];

interface CounterReplyActionsProps {
  jobId: string;
  customerTotal: Kobo;
  yourLastTotal: Kobo;
  canCounter: boolean;
}

/** Artisan's reply to a customer counter: accept it, or send one final price. */
export function CounterReplyActions({ jobId, customerTotal, yourLastTotal, canCounter }: CounterReplyActionsProps) {
  const min = customerTotal + STEP;
  const max = yourLastTotal;
  const start = Math.round((customerTotal + yourLastTotal) / 2 / STEP) * STEP;
  return (
    <OfferResponder
      accept={{
        label: `Accept ${formatNaira(customerTotal)}`,
        pendingLabel: "Agreeing…",
        action: () => respondToCounterAction(jobId, { kind: "accept" }),
      }}
      counter={
        canCounter
          ? {
              min,
              max,
              start,
              hint: `Between their ${formatNaira(customerTotal)} and your ${formatNaira(yourLastTotal)} · final round`,
              quickReasons: QUICK_REASONS,
              placeholder: "Tell the customer why",
              send: (total, reason) => respondToCounterAction(jobId, { kind: "counter", total, reason }),
            }
          : undefined
      }
    />
  );
}
