import { ClockIcon } from "@phosphor-icons/react/ssr";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import {
  cancelJobAction,
  releaseOfferAction,
  selectOfferAction,
  startSearchAction,
} from "@/app/_actions/booking";
import { ActionButton } from "@/components/booking/action-button";
import { BookingFrame } from "@/components/booking/booking-frame";
import { AcceptLock } from "@/components/negotiation/accept-lock";
import { ArtisanSummary } from "@/components/negotiation/artisan-summary";
import { EstimateReveal } from "@/components/negotiation/estimate-reveal";
import { NegotiationActions } from "@/components/negotiation/negotiation-actions";
import { NegotiationRound } from "@/components/negotiation/negotiation-round";
import { OfferCard } from "@/components/negotiation/offer-card";
import { SearchingPulse } from "@/components/negotiation/searching-pulse";
import { TimeLeft } from "@/components/negotiation/time-left";
import { RealtimeRefresh } from "@/components/shell/realtime-refresh";
import { SwitchAt } from "@/components/shell/switch-at";
import { listArtisans } from "@/lib/api/artisans";
import { getCategory } from "@/lib/api/categories";
import { getLga } from "@/lib/api/geo";
import { getJob } from "@/lib/api/jobs";
import { listOffers } from "@/lib/api/negotiations";
import { getRealtimeCursor } from "@/lib/api/realtime";
import type { ArtisanProfile, JobRequest, NegotiationMode, TradeCategory } from "@/lib/types";
import { firstName } from "@/lib/utils/verification";

const QUIET_AFTER_S = 30;

function modeFor(category: TradeCategory, job: JobRequest): NegotiationMode {
  return job.urgency === "emergency" ? "fixed" : category.negotiation;
}

async function artisansById(): Promise<Map<string, ArtisanProfile>> {
  const result = await listArtisans({ includeSuspended: true });
  return new Map((result.ok ? result.data.items : []).map((artisan) => [artisan.id, artisan]));
}

interface ScreenProps {
  job: JobRequest;
  closeHref: string;
  since: number;
}

async function Searching({ job, closeHref, since }: ScreenProps) {
  const [offersResult, artisans] = await Promise.all([listOffers(job.id), artisansById()]);
  const offers = offersResult.ok ? offersResult.data : [];
  const estimateTotal = job.estimate?.total ?? 0;
  const quietAt = new Date(Date.parse(job.updatedAt) + QUIET_AFTER_S * 1000).toISOString();

  return (
    <BookingFrame
      step="Offers"
      closeHref={closeHref}
      footer={
        <ActionButton action={cancelJobAction.bind(null, job.id)} variant="ghost" pendingLabel="Cancelling…">
          Cancel request
        </ActionButton>
      }
    >
      <RealtimeRefresh topic={`job:${job.id}`} since={since} notify={{ "job.offer": "A new offer just came in" }} />
      {offers.length > 0 ? (
        <SearchingPulse
          label={`${offers.length} ${offers.length === 1 ? "artisan has" : "artisans have"} answered`}
          detail="Only verified artisans who serve your LGA can see this job. Pick one when you're ready."
        />
      ) : (
        <SwitchAt
          at={quietAt}
          before={
            <SearchingPulse
              label="Asking artisans near you"
              detail="Only verified artisans who serve your LGA can see this job. Pick one when you're ready."
            />
          }
          after={
            <SearchingPulse
              label="No one has answered yet"
              detail="Everyone who serves your LGA has your request. Keep this open, or cancel for free — nothing has been charged."
            />
          }
        />
      )}

      {offers.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-3" aria-label="Offers">
          {offers.map((offer) => {
            const artisan = artisans.get(offer.match.artisanId);
            if (!artisan) return null;
            return (
              <li key={offer.negotiation.id}>
                <OfferCard
                  offer={offer}
                  artisan={artisan}
                  estimateTotal={estimateTotal}
                  profileHref={`/artisans/${artisan.id}`}
                  action={
                    <ActionButton
                      action={selectOfferAction.bind(null, job.id, offer.negotiation.id)}
                      variant="secondary"
                      size="cta"
                      pendingLabel="Opening…"
                    >
                      Choose {firstName(artisan.displayName)}
                    </ActionButton>
                  }
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </BookingFrame>
  );
}

async function Negotiating({ job, category, closeHref, since }: ScreenProps & { category: TradeCategory }) {
  const negotiation = job.negotiation;
  const artisans = await artisansById();
  const artisan = job.artisanId ? artisans.get(job.artisanId) : undefined;
  if (!negotiation || !artisan || !job.estimate) notFound();
  const name = firstName(artisan.displayName);

  if (negotiation.status === "agreed" && negotiation.agreedTotal !== undefined) {
    return (
      <BookingFrame step="Pay" closeHref={closeHref}>
        <AcceptLock jobId={job.id} total={negotiation.agreedTotal} artisanFirstName={name} />
      </BookingFrame>
    );
  }

  const last = negotiation.rounds.at(-1);
  const participant = negotiation.rounds.filter((round) => round.actor !== "system").length;
  const awaitingReply = last?.actor === "customer" && negotiation.status === "open";
  const expired = negotiation.status === "expired";
  const mode = modeFor(category, job);

  return (
    <BookingFrame
      step="Agree"
      closeHref={closeHref}
      footer={
        expired ? (
          <ActionButton action={releaseOfferAction.bind(null, job.id)} variant="secondary" pendingLabel="Going back…">
            Back to offers
          </ActionButton>
        ) : awaitingReply || !last ? null : (
          <NegotiationActions
            jobId={job.id}
            artisanFirstName={name}
            offerTotal={last.total}
            band={job.estimate.negotiableBand}
            canCounter={mode === "bounded" && participant < negotiation.maxRounds}
          />
        )
      }
    >
      <RealtimeRefresh topic={`job:${job.id}`} since={since} notify={{ "job.offer": "A new offer just came in" }} />
      <ArtisanSummary artisan={artisan} />

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-950" data-tabular>
          {mode === "bounded" ? `Round ${participant} of ${negotiation.maxRounds}` : "Fixed price"}
        </p>
        <p className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-500">
          <ClockIcon className="size-3.5" aria-hidden />
          {expired ? "Time's up" : <TimeLeft until={negotiation.expiresAt} />}
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-2.5">
        {negotiation.rounds.map((round, index) => (
          <NegotiationRound
            key={`${round.index}-${round.actor}`}
            round={round}
            previous={negotiation.rounds[index - 1]}
            counterpartName={name}
            latest={index === negotiation.rounds.length - 1}
          />
        ))}
      </ol>

      {awaitingReply ? (
        <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-500">
          <span className="size-1.5 animate-pulse rounded-full bg-ink-500" aria-hidden />
          Waiting for {name} to reply…
        </p>
      ) : expired ? (
        <p role="status" className="mt-4 text-center text-sm text-ink-500">
          This negotiation timed out. Choose someone else — nothing was charged.
        </p>
      ) : participant >= negotiation.maxRounds && mode === "bounded" ? (
        <p className="mt-4 text-center text-sm text-ink-500">That&apos;s {name}&apos;s final offer.</p>
      ) : null}
    </BookingFrame>
  );
}

async function BookingScreen({ jobId }: { jobId: string }) {
  const since = await getRealtimeCursor();
  const jobResult = await getJob(jobId, { audience: "customer" });
  if (!jobResult.ok) notFound();
  const job = jobResult.data;

  const [categoryResult, lgaResult] = await Promise.all([getCategory(job.categoryId), getLga(job.site.lgaCode)]);
  if (!categoryResult.ok) notFound();
  const category = categoryResult.data;
  const closeHref = "/jobs";

  switch (job.phase) {
    case "estimating": {
      if (!job.estimate) notFound();
      return (
        <BookingFrame
          step="Estimate"
          closeHref={closeHref}
          footer={
            <ActionButton action={startSearchAction.bind(null, job.id)} pendingLabel="Sending to artisans…">
              Find an artisan
            </ActionButton>
          }
        >
          <EstimateReveal
            estimate={job.estimate}
            mode={modeFor(category, job)}
            categoryLabel={category.label}
            areaName={lgaResult.ok ? lgaResult.data.name : job.site.lgaCode}
          />
        </BookingFrame>
      );
    }
    case "searching":
      return <Searching job={job} closeHref={closeHref} since={since} />;
    case "negotiating":
      return <Negotiating job={job} category={category} closeHref={closeHref} since={since} />;
    default:
      redirect(`/jobs/${job.id}`);
  }
}

export default function BookingPage({ params }: PageProps<"/booking/[jobId]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      {params.then(({ jobId }) => (
        <BookingScreen jobId={jobId} />
      ))}
    </Suspense>
  );
}
