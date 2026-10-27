import { CameraIcon, ClockIcon, LockIcon, MapPinIcon, SirenIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { passRequestAction } from "@/app/_actions/supply";
import { ActionButton } from "@/components/booking/action-button";
import { BookingFrame } from "@/components/booking/booking-frame";
import { LineItems } from "@/components/negotiation/line-items";
import { RealtimeRefresh } from "@/components/shell/realtime-refresh";
import { RequestActions } from "@/components/supply/request-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCategory } from "@/lib/api/categories";
import { getLga } from "@/lib/api/geo";
import { getJob } from "@/lib/api/jobs";
import { getRealtimeCursor } from "@/lib/api/realtime";
import { getSession } from "@/lib/api/session";
import { getFeedRequest } from "@/lib/api/supply";
import { formatNaira } from "@/lib/utils/money";
import { formatTiming } from "@/lib/utils/time";

function Gone() {
  return (
    <BookingFrame label="Request" closeHref="/artisan">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold text-ink-950">This request has closed</p>
        <p className="mt-1 max-w-72 text-sm text-ink-500">The customer chose someone else or cancelled. Nothing was charged to anyone.</p>
        <Link href="/artisan" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-6")}>
          Back to requests
        </Link>
      </div>
    </BookingFrame>
  );
}

async function RequestScreen({ jobId }: { jobId: string }) {
  const since = await getRealtimeCursor();
  const session = await getSession();
  const artisanId = session.ok ? session.data.artisanId : null;
  if (!artisanId) redirect("/artisan");

  const requestResult = await getFeedRequest(artisanId, jobId);
  if (!requestResult.ok) {
    const job = await getJob(jobId, { audience: "artisan" });
    if (job.ok && job.data.artisanId === artisanId) redirect(`/artisan/jobs/${jobId}`);
    return <Gone />;
  }
  const request = requestResult.data;
  const [categoryResult, lgaResult] = await Promise.all([getCategory(request.categoryId), getLga(request.lgaCode)]);
  const categoryLabel = categoryResult.ok ? categoryResult.data.label : "Job";
  const area = lgaResult.ok ? `${lgaResult.data.name}, ${lgaResult.data.stateName}` : request.lgaCode;
  const { estimate, match, myOffer } = request;

  return (
    <BookingFrame
      label="Request"
      closeHref="/artisan"
      footer={
        myOffer ? (
          <ActionButton action={passRequestAction.bind(null, jobId)} variant="ghost" pendingLabel="Withdrawing…">
            Withdraw my offer
          </ActionButton>
        ) : (
          <RequestActions jobId={jobId} estimate={estimate} mode={request.mode} />
        )
      }
    >
      <RealtimeRefresh topic={`artisan:${artisanId}`} since={since} />

      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-widest text-ink-500 uppercase">{categoryLabel}</p>
        {request.urgency === "emergency" ? (
          <StatusBadge tone="danger">
            <SirenIcon aria-hidden />
            Emergency · fixed price
          </StatusBadge>
        ) : null}
      </div>
      <h1 className="mt-1 text-[24px] leading-tight font-semibold tracking-tight text-ink-950">{request.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{request.description}</p>

      <ul className="mt-4 flex flex-col gap-2 rounded-2xl bg-surface-raised p-4 text-sm text-ink-700 ring-1 ring-line-200">
        <li className="flex items-center gap-2.5">
          <MapPinIcon className="size-4 shrink-0 text-ink-400" aria-hidden />
          <span>
            {area} · <span data-tabular>{match.distanceKm} km, about {match.driveTimeToJobMinutes} min</span>
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <ClockIcon className="size-4 shrink-0 text-ink-400" aria-hidden />
          {formatTiming(request.timing)}
        </li>
        {request.photoCount > 0 ? (
          <li className="flex items-center gap-2.5">
            <CameraIcon className="size-4 shrink-0 text-ink-400" aria-hidden />
            {request.photoCount} {request.photoCount === 1 ? "photo" : "photos"} from the customer
          </li>
        ) : null}
        <li className="flex items-start gap-2.5 text-ink-500">
          <LockIcon className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden />
          The exact pin and landmark unlock when the customer chooses you.
        </li>
      </ul>

      <section className="mt-5 rounded-2xl bg-surface-raised px-4 shadow-card ring-1 ring-line-200" aria-label="ajudar estimate">
        <p className="pt-4 font-mono text-[10px] tracking-widest text-ink-500 uppercase">ajudar estimate</p>
        <LineItems items={estimate.lineItems} />
        <div className="flex items-center justify-between border-t border-line-200 py-3 text-sm font-semibold text-ink-950">
          <span>Total</span>
          <span data-tabular>{formatNaira(estimate.total)}</span>
        </div>
      </section>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">
        {request.mode === "bounded" ? (
          <>
            You can counter on labour only, between{" "}
            <span data-tabular>
              {formatNaira(estimate.negotiableBand.min)} and {formatNaira(estimate.negotiableBand.max)}
            </span>
            , with a reason. The customer sees every answer and picks one.
          </>
        ) : (
          "This price is fixed. Accept it or pass."
        )}
      </p>

      {myOffer ? (
        <div className="mt-5 rounded-2xl bg-surface-sunken p-4" role="status">
          <p className="font-mono text-[10px] tracking-widest text-ink-500 uppercase">You offered</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-ink-950" data-tabular>
            {formatNaira(myOffer.total)}
          </p>
          <p className="mt-1.5 text-sm text-ink-700">“{myOffer.reason}”</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
            <span className="size-1.5 animate-pulse rounded-full bg-ink-500" aria-hidden />
            Waiting for the customer to choose
          </p>
        </div>
      ) : null}
    </BookingFrame>
  );
}

export default function RequestPage({ params }: PageProps<"/artisan/requests/[jobId]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      {params.then(({ jobId }) => (
        <RequestScreen jobId={jobId} />
      ))}
    </Suspense>
  );
}
