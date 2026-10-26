import { ScanFace } from "lucide-react";
import { ArtisanSummary } from "@/components/negotiation/artisan-summary";
import type { ArtisanProfile, JobRequest } from "@/lib/types";
import { formatClock } from "@/lib/utils/time";

interface OnArrivalCheckProps {
  artisan: ArtisanProfile;
  landmark: string;
  selfie?: JobRequest["arrivalSelfie"];
  actions: React.ReactNode;
}

/** Lets the customer confirm the person at the gate is the artisan they booked. */
export function OnArrivalCheck({ artisan, landmark, selfie, actions }: OnArrivalCheckProps) {
  const first = artisan.displayName.split(" ")[0];
  const matched = selfie?.status === "verified";
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-mono text-[11px] tracking-widest text-ink-500 uppercase">Arrived · {landmark}</p>
      <h1 className="mt-1 text-[26px] leading-tight font-semibold tracking-tight text-ink-950">
        Is this who you booked?
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
        Check their face and name before you open the gate. Work and payment only start once you confirm.
      </p>

      <ArtisanSummary artisan={artisan} size="lg" className="mt-6 rounded-2xl bg-surface-raised p-4 shadow-card ring-1 ring-line-200" />

      <div className="mt-4 flex gap-3 rounded-xl bg-surface-sunken p-4">
        <ScanFace className="mt-0.5 size-5 shrink-0 text-ink-700" aria-hidden />
        <p className="text-sm leading-relaxed text-ink-700">
          {matched ? (
            <>
              {first} took a selfie at your gate
              {selfie?.checkedAt ? <span data-tabular> at {formatClock(selfie.checkedAt)}</span> : null}, and it matched
              their NIN photo. Ask to see the job on their ajudar app — it shows your landmark.
            </>
          ) : (
            <>
              {first}&apos;s face was matched to their NIN when they joined. Ask to see the job on their ajudar app — it
              shows your landmark.
            </>
          )}
        </p>
      </div>

      <div className="mt-auto pt-8">{actions}</div>
    </div>
  );
}
