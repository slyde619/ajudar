import { CheckCircleIcon, ClockIcon, MapPinIcon, UserFocusIcon, ShieldWarningIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BookingFrame } from "@/components/booking/booking-frame";
import { JobProgress } from "@/components/jobs/job-progress";
import { WorkStatusCard } from "@/components/jobs/work-status-card";
import { LiveTrackingShell } from "@/components/map/shells/live-tracking-shell";
import { NegotiationRound } from "@/components/negotiation/negotiation-round";
import { TimeLeft } from "@/components/negotiation/time-left";
import { RealtimeRefresh } from "@/components/shell/realtime-refresh";
import { StickyHeader } from "@/components/shell/sticky-header";
import { ARTISAN_PHASE_STATUS } from "@/components/supply/artisan-phase";
import { CodeEntry } from "@/components/supply/code-entry";
import { CounterReplyActions } from "@/components/supply/counter-reply-actions";
import { WorkStageControl } from "@/components/supply/work-stage-control";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getArtisan } from "@/lib/api/artisans";
import { getCategory } from "@/lib/api/categories";
import { getLga } from "@/lib/api/geo";
import { getJob, getJobReview, getWorkStatus } from "@/lib/api/jobs";
import { getRealtimeCursor } from "@/lib/api/realtime";
import { getSession } from "@/lib/api/session";
import { getDemoSpokenCode } from "@/lib/api/supply";
import { formatNaira } from "@/lib/utils/money";
import { formatClock, formatTiming } from "@/lib/utils/time";
import { firstName } from "@/lib/utils/verification";

const CUSTOMER = "Customer";

async function ArtisanJobScreen({ id }: { id: string }) {
  const since = await getRealtimeCursor();
  const session = await getSession();
  const artisanId = session.ok ? session.data.artisanId : null;
  const jobResult = await getJob(id, { audience: "artisan" });
  if (!jobResult.ok || !artisanId) notFound();
  const job = jobResult.data;
  if (job.phase === "searching") redirect(`/artisan/requests/${job.id}`);
  if (job.artisanId !== artisanId) notFound();

  const [artisanResult, lgaResult, categoryResult] = await Promise.all([
    getArtisan(artisanId),
    getLga(job.site.lgaCode),
    getCategory(job.categoryId),
  ]);
  if (!artisanResult.ok) notFound();
  const artisan = artisanResult.data;
  const lgaName = lgaResult.ok ? `${lgaResult.data.name}, ${lgaResult.data.stateName}` : job.site.lgaCode;
  const categoryLabel = categoryResult.ok ? categoryResult.data.label : "Job";
  const live = <RealtimeRefresh topic={`job:${job.id}`} since={since} types={["job.updated", "job.work"]} />;

  if (job.phase === "negotiating" && job.negotiation && job.estimate) {
    const negotiation = job.negotiation;
    const last = negotiation.rounds.at(-1);
    const yours = negotiation.rounds.findLast((round) => round.actor === "artisan");
    const participant = negotiation.rounds.filter((round) => round.actor !== "system").length;
    const yourTurn = negotiation.status === "open" && last?.actor === "customer";
    const agreed = negotiation.status === "agreed";

    return (
      <BookingFrame
        label="Agree the price"
        closeHref="/artisan"
        footer={
          yourTurn && last && yours ? (
            <CounterReplyActions
              jobId={job.id}
              customerTotal={last.total}
              yourLastTotal={yours.total}
              canCounter={participant < negotiation.maxRounds}
            />
          ) : null
        }
      >
        {live}
        <p className="font-mono text-[11px] tracking-widest text-ink-500 uppercase">
          {categoryLabel} · {lgaName}
        </p>
        <h1 className="mt-1 text-[22px] leading-tight font-semibold tracking-tight text-ink-950">{job.title}</h1>
        <p className="mt-1 text-sm text-ink-500">The customer chose you. {formatTiming(job.timing)}.</p>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-950" data-tabular>
            Round {participant} of {negotiation.maxRounds}
          </p>
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-500">
            <ClockIcon className="size-3.5" aria-hidden />
            {negotiation.status === "expired" ? "Time's up" : <TimeLeft until={negotiation.expiresAt} />}
          </p>
        </div>
        <ol className="mt-3 flex flex-col gap-2.5">
          {negotiation.rounds.map((round, index) => (
            <NegotiationRound
              key={`${round.index}-${round.actor}`}
              round={round}
              previous={negotiation.rounds[index - 1]}
              counterpartName={CUSTOMER}
              latest={index === negotiation.rounds.length - 1}
              viewer="artisan"
            />
          ))}
        </ol>
        <p role="status" className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-ink-500">
          {agreed ? (
            <>
              <CheckCircleIcon className="size-4 text-success-600" aria-hidden />
              Price agreed. Waiting for the customer to pay into escrow — don&apos;t set off yet.
            </>
          ) : negotiation.status === "expired" ? (
            "This negotiation timed out. Nothing was charged."
          ) : yourTurn ? (
            participant >= negotiation.maxRounds ? "Their counter is the last round. Accept it, or let it lapse." : null
          ) : (
            <>
              <span className="size-1.5 animate-pulse rounded-full bg-ink-500" aria-hidden />
              Waiting for the customer
            </>
          )}
        </p>
      </BookingFrame>
    );
  }

  if (job.phase === "accepted" || job.phase === "en_route") {
    return (
      <>
        {live}
        <LiveTrackingShell role="artisan" job={job} artisan={artisan} lgaName={lgaName} since={since} />
      </>
    );
  }

  const status = ARTISAN_PHASE_STATUS[job.phase];
  const header = <StickyHeader title={job.title} subtitle={lgaName} back />;

  if (job.phase === "arrived") {
    return (
      <>
        {live}
        {header}
        <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
          <JobProgress current="Arrived" />
          <div className="mt-8 flex flex-col items-center text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-ink-950 text-celo-500">
              <UserFocusIcon className="size-7" aria-hidden />
            </span>
            <h1 className="mt-4 text-[22px] font-semibold tracking-tight text-ink-950">Waiting for the customer</h1>
            <p className="mt-1.5 max-w-80 text-sm leading-relaxed text-ink-500">
              They&apos;re checking your face and name against the booking. Work and the timer start when they confirm.
            </p>
          </div>
          {job.arrivalSelfie?.status === "verified" ? (
            <p className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-success-100 px-4 py-3 text-sm text-success-600">
              <CheckCircleIcon className="size-4" aria-hidden />
              Selfie matched{job.arrivalSelfie.checkedAt ? ` at ${formatClock(job.arrivalSelfie.checkedAt)}` : ""}
            </p>
          ) : null}
          <div className="mt-4 flex gap-3 rounded-xl bg-surface-warm p-4">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-ink-700" aria-hidden />
            <p className="text-sm text-ink-950">{job.site.landmark}</p>
          </div>
        </div>
      </>
    );
  }

  if (job.phase === "working") {
    const [workResult, demoCode] = await Promise.all([getWorkStatus(job.id), getDemoSpokenCode(job.id)]);
    const work = workResult.ok ? workResult.data : null;
    return (
      <>
        {live}
        {header}
        <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
          <JobProgress current="Working" />
          <div className="mt-6 flex flex-col gap-3">
            {work ? (
              <WorkStatusCard status={work} artisanFirstName={firstName(artisan.displayName)} viewer="artisan">
                <WorkStageControl jobId={job.id} stage={work.stage} />
              </WorkStatusCard>
            ) : null}
            {work?.stage === "complete" && job.agreedTotal !== undefined ? (
              <CodeEntry jobId={job.id} amount={job.agreedTotal} demoCode={demoCode} />
            ) : (
              <p className="px-1 text-xs leading-relaxed text-ink-500">
                The customer sees each step as you mark it. When you&apos;re done, they read you their code.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  if (job.phase === "complete") {
    const reviewResult = await getJobReview(job.id);
    const review = reviewResult.ok ? reviewResult.data : null;
    return (
      <>
        {live}
        {header}
        <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
          <JobProgress current="Done" />
          <div className="mt-8 flex flex-col items-center text-center">
            <span className="flex size-14 animate-in items-center justify-center rounded-full bg-success-100 text-success-600 duration-300 zoom-in-90 fade-in">
              <CheckCircleIcon className="size-7" aria-hidden />
            </span>
            <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink-950">Paid</h1>
            {job.agreedTotal !== undefined ? (
              <p className="mt-1 text-sm text-ink-500" data-tabular>
                {formatNaira(job.agreedTotal)} released from escrow
                {job.completedAt ? ` · ${formatClock(job.completedAt)}` : ""}
              </p>
            ) : null}
          </div>
          {review ? (
            <p className="mt-6 rounded-xl bg-surface-sunken p-4 text-center text-sm text-ink-700">
              The customer rated you {review.rating} of 5{review.comment ? `: “${review.comment}”` : "."}
            </p>
          ) : (
            <p className="mt-6 text-center text-sm text-ink-500">The customer&apos;s rating shows up here.</p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Link href="/artisan/earnings" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Earnings
            </Link>
            <Link href="/artisan" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Back to requests
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {live}
      {header}
      <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        {job.phase === "disputed" ? (
          <div className="mt-4 flex gap-3 rounded-xl bg-danger-100 p-4">
            <ShieldWarningIcon className="mt-0.5 size-5 shrink-0 text-danger-600" aria-hidden />
            <p className="text-sm leading-relaxed text-ink-950">
              The customer said the person at the gate wasn&apos;t you. Escrow is frozen and the ajudar team will call you.
            </p>
          </div>
        ) : null}
        <p className="mt-4 text-sm leading-relaxed text-ink-700">{job.description}</p>
      </div>
    </>
  );
}

export default function ArtisanJobPage({ params }: PageProps<"/artisan/jobs/[id]">) {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-ink-950" aria-busy="true" />}>
      {params.then(({ id }) => (
        <ArtisanJobScreen id={id} />
      ))}
    </Suspense>
  );
}
