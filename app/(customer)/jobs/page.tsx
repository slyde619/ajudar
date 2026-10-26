import { Suspense } from "react";
import type { JobCardProps } from "@/components/jobs/job-card";
import { JobFilter } from "@/components/jobs/job-filter";
import { isActivePhase, JOB_PHASE_STATUS } from "@/components/jobs/job-phase";
import { StickyHeader } from "@/components/shell/sticky-header";
import { listLgas } from "@/lib/api/geo";
import { listJobs } from "@/lib/api/jobs";
import { getSession } from "@/lib/api/session";
import type { JobRequest, Lga } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/time";

function toCard(job: JobRequest, lgas: Map<string, Lga>): JobCardProps {
  const lga = lgas.get(job.site.lgaCode);
  const status = JOB_PHASE_STATUS[job.phase];
  return {
    title: job.title,
    location: lga ? `${lga.name}, ${lga.stateName}` : job.site.landmark,
    when: formatShortDate(job.completedAt ?? job.createdAt),
    status: status.label,
    tone: status.tone,
    href: `/jobs/${job.id}`,
  };
}

async function JobLists() {
  const session = await getSession();
  const customerId = session.ok ? (session.data.customerId ?? undefined) : undefined;
  const [jobsResult, lgasResult] = await Promise.all([
    listJobs({ audience: "customer", customerId }),
    listLgas(),
  ]);
  const lgas = new Map((lgasResult.ok ? lgasResult.data : []).map((lga) => [lga.code, lga]));
  const jobs = jobsResult.ok ? jobsResult.data.items : [];

  return (
    <JobFilter
      active={jobs.filter((job) => isActivePhase(job.phase)).map((job) => toCard(job, lgas))}
      history={jobs.filter((job) => !isActivePhase(job.phase)).map((job) => toCard(job, lgas))}
    />
  );
}

/** Customer jobs list with active and past jobs. */
export default function JobsPage() {
  return (
    <>
      <StickyHeader title="Jobs" subtitle="Active and past work" />

      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface-sunken" />}>
          <JobLists />
        </Suspense>
      </div>
    </>
  );
}
