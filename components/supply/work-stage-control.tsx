import { setWorkStageAction } from "@/app/_actions/supply";
import { ActionButton } from "@/components/booking/action-button";
import type { WorkStage } from "@/lib/types";

const NEXT: Partial<Record<WorkStage, { stage: WorkStage; label: string }>> = {
  started: { stage: "in_progress", label: "Mark in progress" },
  in_progress: { stage: "wrapping_up", label: "Wrapping up" },
  wrapping_up: { stage: "complete", label: "It's done" },
};

/** One-tap control that moves the job's work stage forward. */
export function WorkStageControl({ jobId, stage }: { jobId: string; stage: WorkStage }) {
  const next = NEXT[stage];
  if (!next) return null;
  return (
    <ActionButton
      action={setWorkStageAction.bind(null, jobId, next.stage)}
      variant={next.stage === "complete" ? "default" : "secondary"}
      pendingLabel="Updating…"
    >
      {next.label}
    </ActionButton>
  );
}
