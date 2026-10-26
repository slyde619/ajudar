import { CameraIcon, CaretRightIcon, ClockIcon, MapPinIcon, SirenIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { FeedRequest } from "@/lib/types";
import { formatNaira } from "@/lib/utils/money";
import { formatTiming } from "@/lib/utils/time";

interface RequestCardProps {
  request: FeedRequest;
  categoryLabel: string;
  areaName: string;
  postedLabel: string;
  href: string;
}

/** One open job in the artisan's feed, showing area and distance only. */
export function RequestCard({ request, categoryLabel, areaName, postedLabel, href }: RequestCardProps) {
  const { estimate, match, myOffer } = request;
  return (
    <Link
      href={href}
      className="group/request block animate-in rounded-2xl bg-surface-raised p-4 shadow-card ring-1 ring-line-200 duration-300 ease-out-quint fade-in slide-in-from-bottom-3 active:scale-[0.99] motion-reduce:animate-none"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] tracking-widest text-ink-500 uppercase">
          {categoryLabel} · {postedLabel}
        </p>
        {request.urgency === "emergency" ? (
          <StatusBadge tone="danger">
            <SirenIcon aria-hidden />
            Emergency
          </StatusBadge>
        ) : null}
      </div>
      <h3 className="mt-1.5 text-[17px] leading-snug font-semibold tracking-tight text-ink-950">{request.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">{request.description}</p>

      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-700">
        <li className="flex items-center gap-1">
          <MapPinIcon className="size-3.5 text-ink-400" aria-hidden />
          {areaName} · <span data-tabular>{match.distanceKm} km</span>
        </li>
        <li className="flex items-center gap-1">
          <ClockIcon className="size-3.5 text-ink-400" aria-hidden />
          {formatTiming(request.timing)}
        </li>
        {request.photoCount > 0 ? (
          <li className="flex items-center gap-1">
            <CameraIcon className="size-3.5 text-ink-400" aria-hidden />
            {request.photoCount} {request.photoCount === 1 ? "photo" : "photos"}
          </li>
        ) : null}
      </ul>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line-200 pt-3">
        {myOffer ? (
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-widest text-ink-500 uppercase">You offered</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight text-ink-950" data-tabular>
              {formatNaira(myOffer.total)}
            </p>
            <p className="text-xs text-ink-500">Waiting for the customer to choose</p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-widest text-ink-500 uppercase">
              {request.mode === "bounded" ? "Estimate · you can counter" : "Fixed price"}
            </p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight text-ink-950" data-tabular>
              {formatNaira(estimate.total)}
            </p>
            {request.mode === "bounded" ? (
              <p className="text-xs text-ink-500" data-tabular>
                Fair range {formatNaira(estimate.negotiableBand.min)} – {formatNaira(estimate.negotiableBand.max)}
              </p>
            ) : null}
          </div>
        )}
        <span className="flex h-10 shrink-0 items-center gap-0.5 rounded-pill bg-ink-950 pr-3 pl-4 text-sm font-semibold text-surface-raised">
          {myOffer ? "View" : "Respond"}
          <CaretRightIcon className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
