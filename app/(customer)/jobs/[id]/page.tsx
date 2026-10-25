import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isTravelPhase, JOB_PHASE_STATUS } from "@/components/jobs/job-phase";
import { LiveTrackingShell } from "@/components/map/shells/live-tracking-shell";
import { StickyHeader } from "@/components/shell/sticky-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getArtisan } from "@/lib/api/artisans";
import { getLga } from "@/lib/api/geo";
import { getJob } from "@/lib/api/jobs";

async function JobScreen({ id }: { id: string }) {
  const jobResult = await getJob(id, { audience: "customer" });
  if (!jobResult.ok) notFound();
  const job = jobResult.data;

  const [artisanResult, lgaResult] = await Promise.all([
    job.artisanId ? getArtisan(job.artisanId) : Promise.resolve(null),
    getLga(job.site.lgaCode),
  ]);
  const lgaName = lgaResult.ok
    ? `${lgaResult.data.name}, ${lgaResult.data.stateName}`
    : job.site.lgaCode;

  if (isTravelPhase(job.phase) && artisanResult?.ok) {
    return (
      <LiveTrackingShell
        role="customer"
        job={job}
        artisan={artisanResult.data}
        lgaName={lgaName}
      />
    );
  }

  // Pre-accept, work mode and completion screens land in Phase 4 (§16).
  const status = JOB_PHASE_STATUS[job.phase];
  return (
    <>
      <StickyHeader title={job.title} subtitle={lgaName} back />
      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8">
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        <p className="mt-4 text-sm leading-relaxed text-ink-700">{job.description}</p>
        <p className="mt-4 font-mono text-[11px] text-ink-500">{job.site.landmark}</p>
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
