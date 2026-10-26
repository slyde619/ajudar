import type { StatusTone } from "@/components/ui/status-badge";
import type { JobPhase } from "@/lib/types";

export const JOB_PHASE_STATUS: Record<JobPhase, { label: string; tone: StatusTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  estimating: { label: "Estimating", tone: "neutral" },
  negotiating: { label: "Agreeing price", tone: "neutral" },
  searching: { label: "Finding artisans", tone: "neutral" },
  accepted: { label: "Accepted", tone: "success" },
  en_route: { label: "On the way", tone: "warning" },
  arrived: { label: "Arrived", tone: "success" },
  working: { label: "Working", tone: "warning" },
  complete: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  disputed: { label: "In dispute", tone: "danger" },
};

const ACTIVE: ReadonlySet<JobPhase> = new Set([
  "draft",
  "estimating",
  "negotiating",
  "searching",
  "accepted",
  "en_route",
  "arrived",
  "working",
  "disputed",
]);

export function isActivePhase(phase: JobPhase): boolean {
  return ACTIVE.has(phase);
}

export function isTravelPhase(phase: JobPhase): boolean {
  return phase === "accepted" || phase === "en_route";
}
