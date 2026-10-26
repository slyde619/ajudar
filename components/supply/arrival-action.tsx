"use client";

import { ScanFace } from "lucide-react";
import { useState } from "react";
import { arrivalSelfieSessionAction, markArrivedAction } from "@/app/_actions/supply";
import { Button } from "@/components/ui/button";
import { IdentityCaptureSheet } from "@/components/verification/identity-capture-sheet";
import { formatDistance } from "@/lib/utils/geo";

const ARRIVAL_RADIUS_M = 300;

interface ArrivalActionProps {
  jobId: string;
  distanceM: number | null;
}

/** "I've arrived" button, gated by distance and followed by a gate selfie. */
export function ArrivalAction({ jobId, distanceM }: ArrivalActionProps) {
  const [open, setOpen] = useState(false);
  const near = distanceM !== null && distanceM <= ARRIVAL_RADIUS_M;

  return (
    <>
      <Button size="cta" className="w-full" disabled={!near} onClick={() => setOpen(true)}>
        <ScanFace aria-hidden />
        {near ? "I've arrived" : distanceM === null ? "Finding you…" : `I've arrived · ${formatDistance(distanceM)} to go`}
      </Button>
      <IdentityCaptureSheet
        open={open}
        onOpenChange={setOpen}
        title="Selfie at the gate"
        description="The customer sees that it matched before they let you in. It protects you too: nobody can take a job in your name."
        requestSession={() => arrivalSelfieSessionAction(jobId)}
        onComplete={async (providerRef) => {
          const result = await markArrivedAction(jobId, providerRef);
          if (result) return result.error;
          setOpen(false);
          return null;
        }}
      />
    </>
  );
}
