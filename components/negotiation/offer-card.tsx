import { CaretRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import type { ArtisanProfile, JobOffer, Kobo } from "@/lib/types";
import { formatNaira } from "@/lib/utils/money";
import { ArtisanSummary } from "./artisan-summary";

interface OfferCardProps {
  offer: JobOffer;
  artisan: ArtisanProfile;
  estimateTotal: Kobo;
  profileHref: string;
  action: React.ReactNode;
}

/** One artisan's answer to the estimate: an acceptance, or a counter with a reason. */
export function OfferCard({ offer, artisan, estimateTotal, profileHref, action }: OfferCardProps) {
  const round = offer.negotiation.rounds.at(-1);
  if (!round) return null;
  const delta = round.total - estimateTotal;

  return (
    <article className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl bg-surface-raised p-4 shadow-card ring-1 ring-line-200 duration-300 ease-out-quint">
      <ArtisanSummary
        artisan={artisan}
        meta={`${offer.match.driveTimeToJobMinutes} min away · ${offer.match.distanceKm} km`}
        action={
          <Link
            href={profileHref}
            className="-mr-2 flex h-10 items-center gap-0.5 rounded-lg px-2 text-xs font-medium text-ink-500 hover:text-ink-950"
          >
            Profile
            <CaretRightIcon className="size-3.5" aria-hidden />
          </Link>
        }
      />

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line-200 pt-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-widest text-ink-500 uppercase">
            {delta === 0 ? "Accepts the estimate" : "Counter-offer"}
          </p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-ink-950" data-tabular>
            {formatNaira(round.total)}
          </p>
          {delta !== 0 ? (
            <p className="text-xs text-ink-500" data-tabular>
              {delta > 0 ? "+" : "−"}
              {formatNaira(Math.abs(delta))} on labour
            </p>
          ) : null}
        </div>
      </div>
      <blockquote className="mt-3 rounded-lg bg-surface-sunken px-3 py-2.5 text-sm leading-relaxed text-ink-700">
        “{round.reason}”
      </blockquote>
      <div className="mt-4">{action}</div>
    </article>
  );
}
