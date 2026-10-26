"use client";

import { acceptOfferAction, counterOfferAction, releaseOfferAction } from "@/app/_actions/booking";
import type { Kobo } from "@/lib/types";
import { formatNaira } from "@/lib/utils/money";
import { OfferResponder } from "./offer-responder";

const STEP: Kobo = 50_000;
const QUICK_REASONS = ["It's a small job", "I already have the parts", "Budget is tight this week"];

interface NegotiationActionsProps {
  jobId: string;
  artisanFirstName: string;
  offerTotal: Kobo;
  band: { min: Kobo; max: Kobo };
  canCounter: boolean;
}

/** Customer-side controls for accepting or countering an artisan's offer. */
export function NegotiationActions({ jobId, artisanFirstName, offerTotal, band, canCounter }: NegotiationActionsProps) {
  const ceiling = offerTotal - STEP;
  const floor = band.min;
  const start = Math.max(floor, Math.round((floor + offerTotal) / 2 / STEP) * STEP);

  return (
    <OfferResponder
      accept={{
        label: `Accept ${formatNaira(offerTotal)}`,
        pendingLabel: "Locking the price…",
        action: () => acceptOfferAction(jobId),
      }}
      counter={
        canCounter
          ? {
              min: floor,
              max: ceiling,
              start,
              hint: `Fair range starts at ${formatNaira(floor)} · their offer ${formatNaira(offerTotal)}`,
              quickReasons: QUICK_REASONS,
              placeholder: `Tell ${artisanFirstName} why`,
              send: (total, reason) => counterOfferAction(jobId, total, reason),
            }
          : undefined
      }
      release={{ label: "Someone else", pendingLabel: "Going back…", action: () => releaseOfferAction(jobId) }}
    />
  );
}
