import { ArrowUpRightIcon, HammerIcon, PaintRollerIcon, PlugsConnectedIcon, WrenchIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { CategoryTile } from "@/components/dashboard/category-tile";
import { JobCard } from "@/components/jobs/job-card";
import { StickyHeader } from "@/components/shell/sticky-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import type { StatusTone } from "@/components/ui/status-badge";

const categories = [
  { label: "Plumbing", hint: "Leaks, pipes, tanks", icon: WrenchIcon, slug: "plumbing-repair" },
  { label: "Electrical", hint: "Wiring, sockets", icon: PlugsConnectedIcon, slug: "electrical-repair" },
  { label: "Carpentry", hint: "Doors, wardrobes", icon: HammerIcon, slug: "carpentry" },
  { label: "Painting", hint: "Interior, texture", icon: PaintRollerIcon, slug: "painting" },
];

const recentJobs: Array<{
  title: string;
  location: string;
  when: string;
  status: string;
  tone: StatusTone;
}> = [
  {
    title: "Burst pipe under the kitchen sink",
    location: "Rumuola, Port Harcourt",
    when: "Today",
    status: "En route",
    tone: "warning",
  },
  {
    title: "Bedroom AC servicing",
    location: "Ewet Housing, Uyo",
    when: "Yesterday",
    status: "Completed",
    tone: "success",
  },
];

export default function DashboardPage() {
  return (
    <>
      <StickyHeader title="ajudar" subtitle="Rivers · Akwa Ibom" />

      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <p className="font-mono text-[11px] tracking-widest text-ink-500 uppercase">
          This afternoon
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">
          What needs fixing?
        </h2>

        <Link href="/jobs" className={cn(buttonVariants({ size: "lg" }), "mt-5 h-auto w-full justify-between rounded-xl px-5 py-4 text-left whitespace-normal")}>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-semibold">
                Find a verified artisan
              </span>
              <span className="text-xs font-normal text-ink-950/70">
                Upfront estimate · escrow protected
              </span>
            </span>
            <ArrowUpRightIcon className="size-5" aria-hidden />
        </Link>

        <section className="mt-7" aria-labelledby="categories-heading">
          <SectionHeading id="categories-heading" title="Categories" />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map(({ slug, ...category }) => (
              <CategoryTile key={slug} href={`/booking/new?category=${slug}`} {...category} />
            ))}
          </div>
        </section>

        <section className="mt-7" aria-labelledby="recent-heading">
          <SectionHeading
            id="recent-heading"
            title="Recent"
            action={
              <Link
                href="/jobs"
                className="text-xs font-medium text-ink-500 hover:text-ink-700"
              >
                View jobs
              </Link>
            }
          />
          <div className="mt-3 space-y-3">
            {recentJobs.map((job) => (
              <JobCard key={job.title} {...job} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
