"use client";

import { passRequestAction, respondToRequestAction } from "@/app/_actions/supply";
import { OfferResponder } from "@/components/negotiation/offer-responder";
import type { Estimate, NegotiationMode } from "@/lib/types";
import { formatNaira } from "@/lib/utils/money";

const QUICK_REASONS = ["Needs a part replaced, not patched", "Includes testing before I leave", "It's a long way from my base"];

interface RequestActionsProps {
  jobId: string;
  estimate: Estimate;
  mode: NegotiationMode;
}

/** Artisan's first move on a request: accept the estimate, counter or pass. */
export function RequestActions({ jobId, estimate, mode }: RequestActionsProps) {
  const { min, max } = estimate.negotiableBand;
  return (
    <OfferResponder
      accept={{
        label: `Accept ${formatNaira(estimate.total)}`,
        pendingLabel: "Sending…",
        action: () => respondToRequestAction(jobId, { kind: "accept" }),
      }}
      counter={
        mode === "bounded"
          ? {
              min,
              max,
              start: Math.min(max, estimate.total + 2 * 50_000),
              hint: `Fair range ${formatNaira(min)} – ${formatNaira(max)} · estimate ${formatNaira(estimate.total)}`,
              quickReasons: QUICK_REASONS,
              placeholder: "Tell the customer why",
              send: (total, reason) => respondToRequestAction(jobId, { kind: "counter", total, reason }),
            }
          : undefined
      }
      release={{ label: "Pass", pendingLabel: "Passing…", action: () => passRequestAction(jobId) }}
    />
  );
}
