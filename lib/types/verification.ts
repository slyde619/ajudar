import type { IsoDateTime } from "./primitives";

export type VerificationTier =
  | "unverified" | "pending" | "listed" | "certified" | "top";

export interface ArtisanVerification {
  tier: VerificationTier;

  ninVerified: boolean;
  ninVerifiedAt?: IsoDateTime;
  bvnVerified: boolean;
  selfieMatchScore?: number;

  guarantorName?: string;
  guarantorPhone?: string;
  guarantorConfirmed: boolean;
  guarantorConfirmedAt?: IsoDateTime;

  portfolioPhotoCount: number;
  portfolioMinRequired: number;
  tradeCertificateUrl?: string;
  apprenticeshipYears?: number;
  skillVideoUrl?: string;

  addressConfirmed: boolean;
  serviceAreaConfirmed: boolean;

  probationJobsRemaining: number;

  onArrivalSelfieEnabled: boolean;

  manualReviewRequired: boolean;
  manualReviewReason?: string;
}

export interface VerificationSignal {
  key: string;
  label: string;
  verified: boolean;
  detail?: string;
}
