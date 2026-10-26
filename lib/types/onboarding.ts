import type { Trade } from "./catalog";
import type { Id, IsoDateTime, LgaCode } from "./primitives";

export type OnboardingCheck =
  | "profile" | "identity" | "guarantor" | "portfolio"
  | "skill_video" | "address" | "consent";

export type CheckStatus =
  | "not_started" | "in_progress" | "pending_review" | "verified" | "rejected";

export interface ApplicationCheck {
  status: CheckStatus;
  note?: string;
  updatedAt?: IsoDateTime;
}

export interface ArtisanApplication {
  id: Id;
  profile: { displayName: string; phone: string; trade?: Trade; yearsExperience?: number; specialties: string[] };
  identity: { ninLast4?: string; providerRef?: string };
  guarantor: { name?: string; phone?: string; relationship?: string };
  portfolio: { photoUrls: string[]; certificateUrl?: string; apprenticeshipYears?: number };
  skillVideoUrl?: string;
  address: { baseAddress?: string; homeLgaCode?: LgaCode; servedLgaCodes: LgaCode[] };
  consent: { acceptedAt?: IsoDateTime; version?: string };
  checks: Record<OnboardingCheck, ApplicationCheck>;
  submittedAt?: IsoDateTime;
  updatedAt: IsoDateTime;
}

export type ApplicationStepInput =
  | { step: "profile"; displayName: string; trade: Trade; yearsExperience: number; specialties: string[] }
  | { step: "identity"; nin: string; providerRef: string }
  | { step: "guarantor"; name: string; phone: string; relationship: string }
  | { step: "portfolio"; photoUrls: string[]; certificateUrl?: string; apprenticeshipYears?: number }
  | { step: "skill_video"; videoUrl?: string }
  | { step: "address"; baseAddress: string; homeLgaCode: LgaCode; servedLgaCodes: LgaCode[] }
  | { step: "consent"; version: string };

export interface IdentityCheckSession {
  provider: "smile_id";
  partnerId: string;
  token: string;
  jobId: string;
  environment: "sandbox" | "production";
  product: "biometric_kyc" | "smartselfie_authentication";
}

export interface UploadTicket {
  uploadUrl: string | null;
  fileUrl: string;
  headers?: Record<string, string>;
}
