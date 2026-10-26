import { Radio } from "lucide-react";
import { Suspense } from "react";
import { CoverageMap } from "@/components/map/coverage-map";
import { RealtimeRefresh } from "@/components/shell/realtime-refresh";
import { ActiveJobBanner } from "@/components/supply/active-job-banner";
import { ARTISAN_PHASE_STATUS, isArtisanActive, nextStepFor } from "@/components/supply/artisan-phase";
import { AvailabilityToggle } from "@/components/supply/availability-toggle";
import { RequestCard } from "@/components/supply/request-card";
import { getArtisan } from "@/lib/api/artisans";
import { listCategories } from "@/lib/api/categories";
import { listLgas } from "@/lib/api/geo";
import { listJobs } from "@/lib/api/jobs";
import { getRealtimeCursor } from "@/lib/api/realtime";
import { getSession } from "@/lib/api/session";
import { listFeed } from "@/lib/api/supply";
import { formatAgo } from "@/lib/utils/time";
import { initialsOf } from "@/lib/utils/verification";

const FEED_COVERS = 0.55;

async function Feed() {
  const since = await getRealtimeCursor();
  const session = await getSession();
  const artisanId = session.ok ? session.data.artisanId : null;
  if (!artisanId) return <p className="p-6 text-sm text-ink-500">Sign in as an artisan to see requests.</p>;

  const [artisanResult, feedResult, jobsResult, categoriesResult, lgasResult] = await Promise.all([
    getArtisan(artisanId),
    listFeed(artisanId),
    listJobs({ artisanId, audience: "artisan" }),
    listCategories(),
    listLgas(),
  ]);
  if (!artisanResult.ok) return <p className="p-6 text-sm text-danger-600">{artisanResult.error.message}</p>;

  const artisan = artisanResult.data;
  const requests = feedResult.ok ? feedResult.data : [];
  const active = (jobsResult.ok ? jobsResult.data.items : []).filter((job) => isArtisanActive(job.phase));
  const categories = new Map((categoriesResult.ok ? categoriesResult.data : []).map((category) => [category.id, category.label]));
  const lgas = new Map((lgasResult.ok ? lgasResult.data : []).map((lga) => [lga.code, lga.name]));
  const served = [artisan.coverage.homeLgaCode, ...artisan.coverage.servedLgaCodes.filter((code) => code !== artisan.coverage.homeLgaCode)];
  const now = new Date().toISOString();

  return (
    <>
      <RealtimeRefresh topic={`artisan:${artisanId}`} since={since} />

      <div className="fixed inset-0 z-0 lg:left-64" aria-hidden>
        <CoverageMap lgaCodes={served} base={artisan.base} initials={initialsOf(artisan.displayName)} coveredFraction={FEED_COVERS} />
      </div>

      <div className="relative mx-auto w-full max-w-lg lg:mr-auto lg:ml-0">
        <div className="flex flex-col gap-3 px-4 pt-safe">
          <div className="pt-3">
            <AvailabilityToggle online={artisan.isOnline} areas={served.map((code) => lgas.get(code) ?? code).join(" · ")} />
          </div>
          {active.map((job) => {
            const status = ARTISAN_PHASE_STATUS[job.phase];
            return (
              <ActiveJobBanner
                key={job.id}
                title={job.title}
                status={status.label}
                tone={status.tone}
                hint={nextStepFor(job)}
                href={`/artisan/jobs/${job.id}`}
              />
            );
          })}
        </div>

        <div className="pointer-events-none h-[calc(45dvh-8rem)] min-h-24" />

        <section
          aria-labelledby="feed-heading"
          className="min-h-[55dvh] rounded-t-2xl bg-background px-4 pt-3 pb-8 shadow-sheet lg:rounded-2xl"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-300 lg:hidden" aria-hidden />
          <div className="flex items-baseline justify-between">
            <h1 id="feed-heading" className="text-lg font-semibold tracking-tight text-ink-950">
              Requests near you
            </h1>
            <p className="font-mono text-[11px] text-ink-500" data-tabular>
              {requests.length} open
            </p>
          </div>

          {requests.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-3" aria-label="Open requests">
              {requests.map((request) => (
                <li key={request.jobId}>
                  <RequestCard
                    request={request}
                    categoryLabel={categories.get(request.categoryId) ?? "Job"}
                    areaName={lgas.get(request.lgaCode) ?? request.lgaCode}
                    postedLabel={formatAgo(request.postedAt, now)}
                    href={`/artisan/requests/${request.jobId}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-2xl bg-surface-sunken px-6 py-8 text-center">
              <Radio className="size-6 text-ink-500" aria-hidden />
              <p className="mt-3 text-[15px] font-semibold text-ink-950">
                {artisan.isOnline ? "No requests right now" : "Nothing scheduled to answer"}
              </p>
              <p className="mt-1 max-w-72 text-sm leading-relaxed text-ink-500">
                {artisan.isOnline
                  ? "New jobs in your LGAs show up here the moment they're posted. Keep this screen open — ajudar can't reach you in the background."
                  : "Go online to get jobs that need someone now. Scheduled jobs in your LGAs still show up here."}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default function ArtisanFeedPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ink-950" aria-busy="true" />}>
      <Feed />
    </Suspense>
  );
}
