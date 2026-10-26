import { Check, Hammer } from "lucide-react";
import type { JobWorkStatus, WorkStage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/utils/time";

const STAGES: { key: WorkStage; label: string }[] = [
  { key: "started", label: "Started" },
  { key: "in_progress", label: "In progress" },
  { key: "wrapping_up", label: "Wrapping up" },
  { key: "complete", label: "Complete" },
];

function hours(minutes: number): string {
  return minutes % 60 === 0 ? String(minutes / 60) : (minutes / 60).toFixed(1);
}

/** Work-mode status card showing the stages the artisan has reached. */
interface WorkStatusCardProps {
  status: JobWorkStatus;
  artisanFirstName: string;
  viewer?: "customer" | "artisan";
  children?: React.ReactNode;
}

export function WorkStatusCard({ status, artisanFirstName, viewer = "customer", children }: WorkStatusCardProps) {
  const current = STAGES.findIndex((stage) => stage.key === status.stage);
  const done = status.stage === "complete";
  const doneTitle = viewer === "artisan" ? "Done — ask for the code" : `${artisanFirstName} says it's done`;
  return (
    <section className="rounded-2xl bg-surface-raised p-5 shadow-card ring-1 ring-line-200" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-ink-950 text-celo-500">
          {done ? <Check className="size-5" strokeWidth={2.5} aria-hidden /> : <Hammer className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0">
          <p className="text-[17px] font-semibold tracking-tight text-ink-950">
            {done ? doneTitle : "Working"}
          </p>
          <p className="text-sm text-ink-500" data-tabular>
            Started {formatClock(status.startedAt)} · est {hours(status.estimatedMinutes.min)}–
            {hours(status.estimatedMinutes.max)} hrs
          </p>
        </div>
      </div>

      <ol className="mt-5 flex flex-col gap-0">
        {STAGES.map((stage, index) => (
          <li key={stage.key} className="flex items-center gap-3">
            <span className="flex w-5 flex-col items-center self-stretch" aria-hidden>
              <span className={cn("w-px flex-1", index === 0 ? "bg-transparent" : index <= current ? "bg-ink-950" : "bg-line-200")} />
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  index < current && "bg-ink-950",
                  index === current && "bg-celo-500 ring-2 ring-ink-950",
                  index > current && "bg-line-300",
                )}
              />
              <span
                className={cn(
                  "w-px flex-1",
                  index === STAGES.length - 1 ? "bg-transparent" : index < current ? "bg-ink-950" : "bg-line-200",
                )}
              />
            </span>
            <span
              className={cn("py-2 text-sm", index === current ? "font-semibold text-ink-950" : index < current ? "text-ink-700" : "text-ink-400")}
              aria-current={index === current ? "step" : undefined}
            >
              {stage.label}
            </span>
          </li>
        ))}
      </ol>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
