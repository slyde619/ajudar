import { JobFilter } from "@/components/jobs/job-filter";
import type { JobCardProps } from "@/components/jobs/job-card";
import { StickyHeader } from "@/components/shell/sticky-header";

const activeJobs: JobCardProps[] = [
  {
    title: "Two sockets sparking in the sitting room",
    location: "Lekki Phase 1, Lagos",
    when: "Today",
    status: "Searching",
    tone: "neutral",
  },
  {
    title: "Burst pipe under the kitchen sink",
    location: "Ikeja, Lagos",
    when: "Today",
    status: "En route",
    tone: "warning",
  },
];

const historyJobs: JobCardProps[] = [
  {
    title: "Bedroom AC servicing",
    location: "Umuahia South, Abia",
    when: "Yesterday",
    status: "Completed",
    tone: "success",
  },
];

export default function JobsPage() {
  return (
    <>
      <StickyHeader title="Jobs" subtitle="Active and past work" />

      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <JobFilter active={activeJobs} history={historyJobs} />
      </div>
    </>
  );
}
