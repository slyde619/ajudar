"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { JobCard, type JobCardProps } from "./job-card";

type JobFilterValue = "active" | "history";

export interface JobFilterProps {
  active: JobCardProps[];
  history: JobCardProps[];
}

/**
 * Local UI state only. The cards themselves stay pure presentational
 * components; the filter owns the smallest piece of state it needs.
 */
export function JobFilter({ active, history }: JobFilterProps) {
  const [filter, setFilter] = useState<JobFilterValue>("active");
  const jobs = filter === "active" ? active : history;

  return (
    <>
      <div
        className="inline-flex rounded-pill bg-surface-sunken p-1"
        role="group"
        aria-label="Job filter"
      >
        <Button
          type="button"
          variant={filter === "active" ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={filter === "active"}
          onClick={() => setFilter("active")}
          className={cn(
            "h-11 rounded-pill px-4 lg:h-9",
            filter !== "active" && "text-ink-500",
          )}
        >
          Active
        </Button>
        <Button
          type="button"
          variant={filter === "history" ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={filter === "history"}
          onClick={() => setFilter("history")}
          className={cn(
            "h-11 rounded-pill px-4 lg:h-9",
            filter !== "history" && "text-ink-500",
          )}
        >
          History
        </Button>
      </div>

      <section className="mt-6" aria-live="polite">
        <SectionHeading
          id="jobs-list-heading"
          title={filter === "active" ? "Active" : "History"}
        />

        {jobs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">Nothing here yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.title} {...job} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
