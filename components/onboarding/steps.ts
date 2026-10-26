import type { OnboardingCheck } from "@/lib/types";

export const ONBOARDING_STEPS: readonly OnboardingCheck[] = ["profile", "identity", "guarantor", "portfolio", "skill_video", "address", "consent"];

export const STEP_LABEL: Record<OnboardingCheck, string> = {
  profile: "Trade",
  identity: "ID",
  guarantor: "Guarantor",
  portfolio: "Work",
  skill_video: "Video",
  address: "Base",
  consent: "Consent",
};

export const CHECK_LABEL: Record<OnboardingCheck, string> = {
  profile: "Your trade",
  identity: "NIN and selfie",
  guarantor: "Guarantor",
  portfolio: "Work photos",
  skill_video: "Skill video",
  address: "Base address",
  consent: "Data consent",
};

export function isOnboardingStep(value: unknown): value is OnboardingCheck {
  return typeof value === "string" && (ONBOARDING_STEPS as readonly string[]).includes(value);
}
