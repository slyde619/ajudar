import { ClockIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BookingFrame } from "@/components/booking/booking-frame";
import { StartOverButton } from "@/components/onboarding/start-over-button";
import { CHECK_LABEL, ONBOARDING_STEPS } from "@/components/onboarding/steps";
import { RealtimeRefresh } from "@/components/shell/realtime-refresh";
import { buttonVariants } from "@/components/ui/button";
import { VerificationChecklist } from "@/components/verification/verification-checklist";
import { isMockMode } from "@/lib/api/client";
import { getApplication } from "@/lib/api/onboarding";
import { getRealtimeCursor } from "@/lib/api/realtime";
import { getSession } from "@/lib/api/session";

async function ApplicationStatus() {
  const since = await getRealtimeCursor();
  const session = await getSession();
  if (!session.ok) redirect("/signup");
  if (!session.data.applicantId) redirect("/artisan/profile");
  const result = await getApplication(session.data.applicantId);
  if (!result.ok) throw new Error(result.error.message);
  const application = result.data;
  if (!application.submittedAt) redirect("/artisan/onboarding");

  const rejected = ONBOARDING_STEPS.filter((check) => application.checks[check].status === "rejected");
  const waiting = ONBOARDING_STEPS.some((check) => application.checks[check].status === "pending_review");

  return (
    <BookingFrame label="Your application" closeHref="/artisan/profile" closeLabel="Close">
      <RealtimeRefresh topic={`applicant:${application.id}`} since={since} types={["verification.updated"]} notify={{ "verification.updated": "One of your checks was updated" }} />
      <span className="flex size-14 items-center justify-center rounded-full bg-ink-950 text-celo-500">
        <ClockIcon className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-[24px] leading-tight font-semibold tracking-tight text-ink-950">
        {rejected.length > 0 ? "One thing needs another try" : waiting ? "We're checking your details" : "You're verified"}
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
        {rejected.length > 0
          ? "Fix it and the rest carries on. Nothing else needs redoing."
          : waiting
            ? "Usually 1–3 days. We'll text you as each check clears, and you'll start seeing requests once your ID and guarantor are confirmed."
            : "Requests near you will start showing up."}
      </p>

      <VerificationChecklist
        className="mt-6"
        items={ONBOARDING_STEPS.map((check) => ({
          key: check,
          label: CHECK_LABEL[check],
          status: application.checks[check].status,
          note: application.checks[check].note,
          optional: check === "skill_video",
        }))}
      />

      <div className="mt-6 flex flex-col gap-2">
        {rejected.length > 0 ? (
          <p className="text-sm text-ink-500">The ajudar team will call you about the retry.</p>
        ) : null}
        <Link href="/artisan" className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Back to requests
        </Link>
        {isMockMode() ? <StartOverButton /> : null}
      </div>
    </BookingFrame>
  );
}

export default function ApplicationStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      <ApplicationStatus />
    </Suspense>
  );
}
