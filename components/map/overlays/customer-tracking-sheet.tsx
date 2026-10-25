import { LockKeyhole, MapPin, MessageSquare, Phone, Radio } from "lucide-react";
import Link from "next/link";
import { JobProgress } from "@/components/jobs/job-progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VerificationStrip } from "@/components/verification/verification-strip";
import type {
  ArtisanProfile,
  IsoDateTime,
  JobRequest,
  JobTracking,
} from "@/lib/types";
import { formatDistance } from "@/lib/utils/geo";
import { formatNaira } from "@/lib/utils/money";
import { formatAgo, formatClock, formatDuration } from "@/lib/utils/time";
import { deriveVerificationSignals, initialsOf } from "@/lib/utils/verification";

export interface CustomerTrackingSheetProps {
  job: JobRequest;
  artisan: ArtisanProfile;
  lgaName: string;
  tracking: JobTracking | null;
  now: IsoDateTime | null;
}

const TRADE_LABEL: Record<ArtisanProfile["trade"], string> = {
  plumber: "Plumber",
  electrician: "Electrician",
  carpenter: "Carpenter",
  painter: "Painter",
  tiler: "Tiler",
  welder: "Welder",
  ac_technician: "AC technician",
  generator_mechanic: "Generator mechanic",
  locksmith: "Locksmith",
  cleaner: "Cleaner",
  mason: "Mason",
  roofer: "Roofer",
};

function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

/**
 * Travel-mode sheet content. Pure: the shell owns polling, the drawer and the
 * layout. Peek shows the promise (ETA), half shows who, full shows the rest.
 */
export function CustomerTrackingSheet({
  job,
  artisan,
  lgaName,
  tracking,
  now,
}: CustomerTrackingSheetProps) {
  const name = firstName(artisan.displayName);
  const arrived = tracking !== null && tracking.route.durationSeconds === 0;
  const total = job.agreedTotal ?? job.estimate?.total;

  return (
    <div className="flex flex-col px-5 pb-safe">
      {/* Peek — the promise */}
      <section aria-live="polite" className="pt-3 pb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[0.16em] text-ink-500 uppercase">
            {arrived ? "Arrived" : "Arriving by"}
          </p>
          {tracking && now ? (
            <p className="inline-flex items-center gap-1.5 font-mono text-[10px] text-ink-400" data-tabular>
              <Radio className="size-3" aria-hidden />
              Updated {formatAgo(tracking.artisanLocation.updatedAt, now)}
            </p>
          ) : null}
        </div>

        {tracking ? (
          <>
            <h2 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-ink-950" data-tabular>
              {arrived ? `${name} is here` : formatClock(tracking.etaAt)}
            </h2>
            <p className="mt-2 text-sm text-ink-500" data-tabular>
              {arrived
                ? "Check their face matches the profile before they start."
                : `${name} is ${formatDuration(tracking.route.durationSeconds)} away · ${formatDistance(tracking.route.distanceM)}`}
            </p>
          </>
        ) : (
          <div className="mt-2 space-y-2" aria-label="Loading live location">
            <div className="h-8 w-36 animate-pulse rounded-md bg-surface-sunken" />
            <div className="h-4 w-52 animate-pulse rounded-md bg-surface-sunken" />
          </div>
        )}

        <JobProgress current={arrived ? "Arrived" : "On the way"} className="mt-5" />
      </section>

      <Separator />

      {/* Half — who is coming */}
      <section className="py-5" aria-labelledby="artisan-heading">
        <div className="flex items-center gap-3.5">
          <Avatar className="size-14">
            <AvatarFallback className="bg-ink-950 text-base font-semibold text-celo-500">
              {initialsOf(artisan.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 id="artisan-heading" className="truncate text-base font-semibold text-ink-950">
              {artisan.displayName}
            </h3>
            <p className="truncate text-sm text-ink-500">
              {TRADE_LABEL[artisan.trade]} · {artisan.yearsExperience} yrs experience
            </p>
          </div>
        </div>

        <VerificationStrip signals={deriveVerificationSignals(artisan)} className="mt-4" />

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button asChild variant="secondary" className="h-12 rounded-xl text-sm">
            <a href={`tel:${artisan.phone}`}>
              <Phone aria-hidden />
              Call
            </a>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-xl bg-surface-raised text-sm">
            <Link href="/messages">
              <MessageSquare aria-hidden />
              Message
            </Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* Full — where, how much, and the honest small print */}
      <section className="space-y-3 py-5">
        <div className="flex gap-3 rounded-xl bg-surface-warm p-4">
          <MapPin className="mt-0.5 size-4 shrink-0 text-ink-700" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-950">{job.site.landmark}</p>
            <p className="mt-0.5 font-mono text-[11px] text-ink-500">
              {lgaName} · {job.site.pinConfirmedByUser ? "Pin confirmed" : "Approximate pin"}
            </p>
          </div>
        </div>

        {total !== undefined ? (
          <div className="flex gap-3 rounded-xl bg-celo-100 p-4">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-ink-950" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-950">
                <span data-tabular>{formatNaira(total)}</span>{" "}
                {job.escrowFunded ? "held in escrow" : "agreed"}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-700">
                Released only when you share your completion code. The price
                can&apos;t change on arrival.
              </p>
            </div>
          </div>
        ) : null}

        <p className="px-1 text-xs leading-relaxed text-ink-400">
          {name}&apos;s location updates while their app is open. If it goes
          quiet, it&apos;s usually a weak signal, not a no-show.
        </p>
      </section>
    </div>
  );
}
