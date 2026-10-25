import { ArrowUpRight, Hammer, PaintRoller, PlugZap, Wrench } from "lucide-react";
import Link from "next/link";
import { CategoryTile } from "@/components/dashboard/category-tile";
import { JobCard } from "@/components/jobs/job-card";
import { StickyHeader } from "@/components/shell/sticky-header";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { StatusTone } from "@/components/ui/status-badge";

const categories = [
  { label: "Plumbing", hint: "Leaks, pipes, tanks", icon: Wrench },
  { label: "Electrical", hint: "Wiring, sockets", icon: PlugZap },
  { label: "Carpentry", hint: "Doors, wardrobes", icon: Hammer },
  { label: "Painting", hint: "Interior, texture", icon: PaintRoller },
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
    location: "Ikeja, Lagos",
    when: "Today",
    status: "En route",
    tone: "warning",
  },
  {
    title: "Bedroom AC servicing",
    location: "Umuahia South, Abia",
    when: "Yesterday",
    status: "Completed",
    tone: "success",
  },
];

export default function DashboardPage() {
  return (
    <>
      <StickyHeader title="ajudar" subtitle="Lagos · Abia pilot" />

      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <p className="font-mono text-[11px] tracking-widest text-ink-500 uppercase">
          This afternoon
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">
          What needs fixing?
        </h2>

        <Button
          asChild
          size="lg"
          className="mt-5 h-auto w-full justify-between rounded-xl px-5 py-4 text-left whitespace-normal"
        >
          <Link href="/jobs">
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-semibold">
                Find a verified artisan
              </span>
              <span className="text-xs font-normal text-ink-950/70">
                Upfront estimate · escrow protected
              </span>
            </span>
            <ArrowUpRight className="size-5" aria-hidden />
          </Link>
        </Button>

        <section className="mt-7" aria-labelledby="categories-heading">
          <SectionHeading id="categories-heading" title="Categories" />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <CategoryTile key={category.label} {...category} />
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
