import { Suspense } from "react";
import type { JobCardProps } from "@/components/jobs/job-card";
import { JobFilter } from "@/components/jobs/job-filter";
import { StickyHeader } from "@/components/shell/sticky-header";
import { ARTISAN_PHASE_STATUS, isArtisanActive } from "@/components/supply/artisan-phase";
import { listLgas } from "@/lib/api/geo";
import { listJobs } from "@/lib/api/jobs";
import { getSession } from "@/lib/api/session";
import type { JobRequest, Lga } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/time";

function toCard(job: JobRequest, lgas: Map<string, Lga>): JobCardProps {
  const lga = lgas.get(job.site.lgaCode);
  const status = ARTISAN_PHASE_STATUS[job.phase];
  return {
    title: job.title,
    location: lga ? `${lga.name}, ${lga.stateName}` : job.site.lgaCode,
    when: formatShortDate(job.completedAt ?? job.createdAt),
    status: status.label,
    tone: status.tone,
    href: `/artisan/jobs/${job.id}`,
  };
}

async function ArtisanJobs() {
  const session = await getSession();
  const artisanId = session.ok ? session.data.artisanId : null;
  const [jobsResult, lgasResult] = await Promise.all([
    artisanId ? listJobs({ artisanId, audience: "artisan" }) : Promise.resolve(null),
    listLgas(),
  ]);
  const lgas = new Map((lgasResult.ok ? lgasResult.data : []).map((lga) => [lga.code, lga]));
  const jobs = jobsResult?.ok ? jobsResult.data.items.filter((job) => job.phase !== "searching") : [];

  return (
    <JobFilter
      active={jobs.filter((job) => isArtisanActive(job.phase)).map((job) => toCard(job, lgas))}
      history={jobs.filter((job) => !isArtisanActive(job.phase)).map((job) => toCard(job, lgas))}
    />
  );
}

export default function ArtisanJobsPage() {
  return (
    <>
      <StickyHeader title="Jobs" subtitle="Your active and past work" />
      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface-sunken" />}>
          <ArtisanJobs />
        </Suspense>
      </div>
    </>
  );
}
