import type { ArtisanProfile, VerificationSignal } from "@/lib/types";

export function deriveVerificationSignals(artisan: ArtisanProfile): VerificationSignal[] {
  const { verification: v, stats } = artisan;
  const onProbation = v.probationJobsRemaining > 0;

  return [
    { key: "nin", label: "NIN", verified: v.ninVerified, detail: "Identity matched to a live selfie" },
    {
      key: "guarantor",
      label: "Guarantor",
      verified: v.guarantorConfirmed,
      detail: v.guarantorConfirmed ? "Called and confirmed" : "Awaiting confirmation call",
    },
    {
      key: "portfolio",
      label: `${v.portfolioPhotoCount} photos`,
      verified: v.portfolioPhotoCount >= v.portfolioMinRequired,
      detail: "Real job-site photos",
    },
    onProbation
      ? {
          key: "jobs",
          label: "New",
          verified: false,
          detail: `${v.probationJobsRemaining} probation jobs to go`,
        }
      : {
          key: "jobs",
          label: `${stats.jobsCompleted} jobs`,
          verified: stats.jobsCompleted > 0,
          detail: `${Math.round(stats.completionRate * 100)}% completed`,
        },
    {
      key: "rating",
      label: stats.ratingCount > 0 ? stats.averageRating.toFixed(1) : "No ratings",
      verified: stats.ratingCount > 0,
      detail: `${stats.ratingCount} ratings`,
    },
  ];
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const TRADE_LABEL: Record<ArtisanProfile["trade"], string> = {
  plumber: "Plumber",
  electrician: "Electrician",
  carpenter: "Carpenter",
  painter: "Painter",
  tiler: "Tiler",
  welder: "Welder",
  ac_technician: "AC technician",
  generator_mechanic: "Generator mechanic",
  locksmith: "Locksmith",
  cleaner: "Cleaner",
  mason: "Mason",
  roofer: "Roofer",
};

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}
