import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BookingFrame } from "@/components/booking/booking-frame";
import { AddressStep } from "@/components/onboarding/address-step";
import { ConsentStep } from "@/components/onboarding/consent-step";
import { GuarantorStep } from "@/components/onboarding/guarantor-step";
import { IdentityStep } from "@/components/onboarding/identity-step";
import { PortfolioStep } from "@/components/onboarding/portfolio-step";
import { ProfileStep } from "@/components/onboarding/profile-step";
import { SkillVideoStep } from "@/components/onboarding/skill-video-step";
import { isOnboardingStep, ONBOARDING_STEPS, STEP_LABEL } from "@/components/onboarding/steps";
import { listLgas } from "@/lib/api/geo";
import { CONSENT_VERSION, getApplication } from "@/lib/api/onboarding";
import { getSession } from "@/lib/api/session";
import type { OnboardingCheck } from "@/lib/types";

async function OnboardingStep({ requested }: { requested: unknown }) {
  const session = await getSession();
  if (!session.ok) redirect("/signup");
  if (!session.data.applicantId) redirect("/artisan/profile");
  const result = await getApplication(session.data.applicantId);
  if (!result.ok) throw new Error(result.error.message);
  const application = result.data;
  if (application.submittedAt) redirect("/artisan/onboarding/status");

  const firstOpen = ONBOARDING_STEPS.find((check) => application.checks[check].status === "not_started") ?? "consent";
  const step: OnboardingCheck =
    isOnboardingStep(requested) && ONBOARDING_STEPS.indexOf(requested) <= ONBOARDING_STEPS.indexOf(firstOpen) ? requested : firstOpen;
  if (requested !== step) redirect(`/artisan/onboarding?step=${step}`);

  let body: React.ReactNode;
  switch (step) {
    case "profile":
      body = <ProfileStep application={application} />;
      break;
    case "identity":
      body = <IdentityStep application={application} />;
      break;
    case "guarantor":
      body = <GuarantorStep application={application} />;
      break;
    case "portfolio":
      body = <PortfolioStep application={application} />;
      break;
    case "skill_video":
      body = <SkillVideoStep application={application} />;
      break;
    case "address": {
      const lgas = await listLgas();
      body = <AddressStep application={application} lgas={lgas.ok ? lgas.data : []} />;
      break;
    }
    case "consent":
      body = <ConsentStep version={CONSENT_VERSION} />;
      break;
  }

  return (
    <BookingFrame
      step={STEP_LABEL[step]}
      steps={ONBOARDING_STEPS.map((check) => STEP_LABEL[check])}
      progressLabel="Application progress"
      closeHref="/artisan/profile"
      closeLabel="Leave and finish later"
    >
      <div key={step} className="flex flex-1 flex-col">
        {body}
      </div>
    </BookingFrame>
  );
}

/** Artisan onboarding, one verification step per screen, saved as you go. */
export default function ArtisanOnboardingPage({ searchParams }: PageProps<"/artisan/onboarding">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      {searchParams.then(({ step }) => (
        <OnboardingStep requested={step} />
      ))}
    </Suspense>
  );
}
