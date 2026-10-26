import { LockKeyIcon, MapPinIcon, BroadcastIcon, DeviceMobileIcon } from "@phosphor-icons/react/ssr";
import type { IsoDateTime, JobRequest, JobTracking } from "@/lib/types";
import { formatDistance } from "@/lib/utils/geo";
import { formatNaira } from "@/lib/utils/money";
import { formatAgo, formatClock, formatDuration } from "@/lib/utils/time";

interface EtaCardProps {
  tracking: JobTracking | null;
  now: IsoDateTime | null;
  landmark: string;
}

/** Travel-mode top card with the artisan's ETA and landmark. */
export function ArtisanEtaCard({ tracking, now, landmark }: EtaCardProps) {
  return (
    <section aria-live="polite" className="rounded-2xl bg-surface-raised p-4 shadow-pop ring-1 ring-line-200">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.16em] text-ink-500 uppercase">Arrive by</p>
        {tracking && now ? (
          <p className="inline-flex items-center gap-1.5 font-mono text-[10px] text-ink-400" data-tabular>
            <BroadcastIcon className="size-3" aria-hidden />
            {formatAgo(tracking.artisanLocation.updatedAt, now)}
          </p>
        ) : null}
      </div>
      {tracking ? (
        <>
          <p className="mt-0.5 text-[28px] leading-none font-semibold tracking-tight text-ink-950" data-tabular>
            {formatClock(tracking.etaAt)}
          </p>
          <p className="mt-1.5 truncate text-sm text-ink-500" data-tabular>
            {formatDuration(tracking.route.durationSeconds)} · {formatDistance(tracking.route.distanceM)} to {landmark}
          </p>
        </>
      ) : (
        <div className="mt-1.5 space-y-2" aria-label="Loading route">
          <div className="h-7 w-28 animate-pulse rounded-md bg-surface-sunken" />
          <div className="h-4 w-48 animate-pulse rounded-md bg-surface-sunken" />
        </div>
      )}
    </section>
  );
}

interface NavigationPanelProps {
  job: JobRequest;
  lgaName: string;
  action: React.ReactNode;
}

/** Travel-mode bottom panel with the destination, the held amount and the arrival action. */
export function ArtisanNavigationPanel({ job, lgaName, action }: NavigationPanelProps) {
  return (
    <div className="flex flex-col gap-3 px-5 pt-4 pb-safe">
      <div className="flex gap-3 rounded-xl bg-surface-warm p-3.5">
        <MapPinIcon className="mt-0.5 size-4 shrink-0 text-ink-700" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-950">{job.site.landmark}</p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-500">
            {lgaName} · {job.site.pinConfirmedByUser ? "Pin confirmed by customer" : "Approximate pin"}
          </p>
        </div>
      </div>
      {job.agreedTotal !== undefined ? (
        <div className="flex gap-3 rounded-xl bg-celo-100 p-3.5">
          <LockKeyIcon className="mt-0.5 size-4 shrink-0 text-ink-950" aria-hidden />
          <p className="text-sm leading-snug text-ink-950">
            <span className="font-semibold" data-tabular>
              {formatNaira(job.agreedTotal)}
            </span>{" "}
            is in escrow. It&apos;s yours when you type the customer&apos;s code at the end.
          </p>
        </div>
      ) : null}
      <p className="flex items-center gap-2 px-1 text-xs text-ink-500">
        <DeviceMobileIcon className="size-3.5 shrink-0" aria-hidden />
        Keep this screen open while you travel — ajudar can&apos;t see you in the background.
      </p>
      <div className="pb-4">{action}</div>
    </div>
  );
}
