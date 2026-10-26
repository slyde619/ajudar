import { CircleCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { confirmArrivalAction, demoEnterCodeAction } from "@/app/_actions/booking";
import { ActionButton } from "@/components/booking/action-button";
import { CompletionCode } from "@/components/jobs/completion-code";
import { isTravelPhase, JOB_PHASE_STATUS } from "@/components/jobs/job-phase";
import { JobProgress } from "@/components/jobs/job-progress";
import { RatingForm } from "@/components/jobs/rating-form";
import { WorkStatusCard } from "@/components/jobs/work-status-card";
import { LiveTrackingShell } from "@/components/map/shells/live-tracking-shell";
import { LineItems } from "@/components/negotiation/line-items";
import { RealtimeRefresh } from "@/components/shell/realtime-refresh";
import { StickyHeader } from "@/components/shell/sticky-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { OnArrivalCheck } from "@/components/verification/on-arrival-check";
import { getArtisan } from "@/lib/api/artisans";
import { isMockMode } from "@/lib/api/client";
import { getLga } from "@/lib/api/geo";
import { getJob, getJobReview, getWorkStatus } from "@/lib/api/jobs";
import { getRealtimeCursor } from "@/lib/api/realtime";
import { getSession } from "@/lib/api/session";
import { formatNaira } from "@/lib/utils/money";
import { formatClock, formatShortDate } from "@/lib/utils/time";
import { firstName } from "@/lib/utils/verification";

const PRE_ACCEPT = new Set(["draft", "estimating", "searching", "negotiating"]);

async function JobScreen({ id }: { id: string }) {
  const since = await getRealtimeCursor();
  const jobResult = await getJob(id, { audience: "customer" });
  if (!jobResult.ok) notFound();
  const job = jobResult.data;
  if (PRE_ACCEPT.has(job.phase)) redirect(`/booking/${job.id}`);

  const [artisanResult, lgaResult] = await Promise.all([
    job.artisanId ? getArtisan(job.artisanId) : Promise.resolve(null),
    getLga(job.site.lgaCode),
  ]);
  const lgaName = lgaResult.ok
    ? `${lgaResult.data.name}, ${lgaResult.data.stateName}`
    : job.site.lgaCode;
  const artisan = artisanResult?.ok ? artisanResult.data : null;
  const live = <RealtimeRefresh topic={`job:${job.id}`} since={since} types={["job.updated", "job.work"]} />;

  if (isTravelPhase(job.phase) && artisan) {
    return (
      <>
        {live}
        <LiveTrackingShell role="customer" job={job} artisan={artisan} lgaName={lgaName} since={since} />
      </>
    );
  }

  const status = JOB_PHASE_STATUS[job.phase];
  const name = artisan ? firstName(artisan.displayName) : "The artisan";
  const header = <StickyHeader title={job.title} subtitle={lgaName} back />;

  if (job.phase === "arrived" && artisan) {
    return (
      <>
        {live}
        {header}
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-lg flex-col px-5 pt-5 pb-safe">
          <JobProgress current="Arrived" className="mb-6" />
          <OnArrivalCheck
            artisan={artisan}
            landmark={job.site.landmark}
            selfie={job.arrivalSelfie}
            actions={
              <div className="flex flex-col gap-2 pb-4">
                <ActionButton action={confirmArrivalAction.bind(null, job.id, true)} pendingLabel="Starting the job…">
                  Yes, this is {name}
                </ActionButton>
                <ActionButton
                  action={confirmArrivalAction.bind(null, job.id, false)}
                  variant="ghost"
                  className="text-danger-600"
                  pendingLabel="Reporting…"
                >
                  This isn&apos;t them
                </ActionButton>
              </div>
            }
          />
        </div>
      </>
    );
  }

  if (job.phase === "working" && artisan) {
    const workResult = await getWorkStatus(job.id);
    const work = workResult.ok ? workResult.data : null;
    const ready = work?.stage === "complete";
    const session = await getSession();
    const simulated = !session.ok || session.data.artisanId !== artisan.id;
    return (
      <>
        {header}
        {live}
        <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
          <JobProgress current="Working" />
          <div className="mt-6 flex flex-col gap-3">
            {work ? <WorkStatusCard status={work} artisanFirstName={name} /> : null}
            {job.completionCode && job.agreedTotal !== undefined ? (
              <CompletionCode code={job.completionCode} amount={job.agreedTotal} artisanFirstName={name} ready={ready} />
            ) : null}
            {isMockMode() && ready && simulated ? (
              <div className="rounded-xl border border-dashed border-line-300 p-4">
                <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">Demo only</p>
                <p className="mt-1 text-sm text-ink-500">
                  In real use {name} types your code on their phone. Simulate that here.
                </p>
                <ActionButton
                  action={demoEnterCodeAction.bind(null, job.id)}
                  variant="outline"
                  size="lg"
                  className="mt-3"
                  pendingLabel="Releasing payment…"
                >
                  {name} enters the code
                </ActionButton>
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  }

  if (job.phase === "complete") {
    const reviewResult = await getJobReview(job.id);
    const review = reviewResult.ok ? reviewResult.data : null;
    const lines = job.negotiation?.rounds.find((round) => round.accepted)?.lineItems ?? job.estimate?.lineItems ?? [];
    return (
      <>
        {header}
        <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
          <JobProgress current="Done" />
          <div className="mt-6 flex flex-col items-center text-center">
            <span className="flex size-14 animate-in zoom-in-90 fade-in items-center justify-center rounded-full bg-success-100 text-success-600 duration-300">
              <CircleCheck className="size-7" aria-hidden />
            </span>
            <h2 className="mt-3 text-[22px] font-semibold tracking-tight text-ink-950">Job complete</h2>
            {job.agreedTotal !== undefined ? (
              <p className="mt-1 text-sm text-ink-500" data-tabular>
                {formatNaira(job.agreedTotal)} released to {name}
                {job.completedAt ? ` · ${formatShortDate(job.completedAt)}, ${formatClock(job.completedAt)}` : ""}
              </p>
            ) : null}
          </div>

          {lines.length > 0 ? (
            <section className="mt-6 rounded-2xl bg-surface-raised px-4 shadow-card ring-1 ring-line-200" aria-label="Receipt">
              <LineItems items={lines} />
              {job.agreedTotal !== undefined ? (
                <div className="flex items-center justify-between border-t border-line-200 py-3 text-sm font-semibold text-ink-950">
                  <span>Paid</span>
                  <span data-tabular>{formatNaira(job.agreedTotal)}</span>
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="mt-4">
            {review ? (
              <p className="rounded-xl bg-surface-sunken p-4 text-center text-sm text-ink-700">
                You rated {name} {review.rating} of 5. Thanks — it helps the next customer choose.
              </p>
            ) : artisan ? (
              <RatingForm jobId={job.id} artisanFirstName={name} />
            ) : null}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      {live}
      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8">
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        {job.phase === "disputed" ? (
          <div className="mt-4 flex gap-3 rounded-xl bg-danger-100 p-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger-600" aria-hidden />
            <p className="text-sm leading-relaxed text-ink-950">
              Don&apos;t let them in. Your escrow is frozen and we&apos;ve flagged this to the ajudar team.
            </p>
          </div>
        ) : null}
        <p className="mt-4 text-sm leading-relaxed text-ink-700">{job.description}</p>
        <p className="mt-4 font-mono text-[11px] text-ink-500">{job.site.landmark}</p>
        {job.phase === "cancelled" ? (
          <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/dashboard" />} className="mt-6">
            Book again
          </Button>
        ) : null}
      </div>
    </>
  );
}

function TrackingFallback() {
  return <div className="h-dvh w-full bg-ink-950" aria-busy="true" />;
}

export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <Suspense fallback={<TrackingFallback />}>
      {params.then(({ id }) => (
        <JobScreen id={id} />
      ))}
    </Suspense>
  );
}
