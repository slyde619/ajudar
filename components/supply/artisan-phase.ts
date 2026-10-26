import type { StatusTone } from "@/components/ui/status-badge";
import type { JobPhase, JobRequest } from "@/lib/types";

export const ARTISAN_PHASE_STATUS: Record<JobPhase, { label: string; tone: StatusTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  estimating: { label: "Estimating", tone: "neutral" },
  searching: { label: "Open request", tone: "neutral" },
  negotiating: { label: "Agreeing price", tone: "warning" },
  accepted: { label: "Paid · head out", tone: "success" },
  en_route: { label: "On your way", tone: "warning" },
  arrived: { label: "At the gate", tone: "warning" },
  working: { label: "Working", tone: "warning" },
  complete: { label: "Paid", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  disputed: { label: "In dispute", tone: "danger" },
};

const ARTISAN_ACTIVE: ReadonlySet<JobPhase> = new Set(["negotiating", "accepted", "en_route", "arrived", "working", "disputed"]);

export function isArtisanActive(phase: JobPhase): boolean {
  return ARTISAN_ACTIVE.has(phase);
}

export function nextStepFor(job: JobRequest): string {
  switch (job.phase) {
    case "negotiating": {
      const last = job.negotiation?.rounds.at(-1);
      if (job.negotiation?.status === "agreed") return "Price agreed. Waiting for the customer to pay into escrow.";
      return last?.actor === "customer" ? "The customer countered. Your reply." : "The customer chose you. Waiting for their answer.";
    }
    case "accepted":
    case "en_route":
      return "Escrow is funded. Open the job to navigate.";
    case "arrived":
      return "Waiting for the customer to confirm it's you.";
    case "working":
      return "Update your progress. Ask for the code when you're done.";
    case "disputed":
      return "The customer flagged this job. The ajudar team will call you.";
    default:
      return "";
  }
}
