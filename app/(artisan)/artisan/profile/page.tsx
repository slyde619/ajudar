import { ArrowLeftRight, ClipboardCheck, LogOut, MapPin } from "lucide-react";
import { Suspense } from "react";
import { ProfileRow } from "@/components/profile/profile-row";
import { StickyHeader } from "@/components/shell/sticky-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Separator } from "@/components/ui/separator";
import { VerificationChecklist, type ChecklistItem } from "@/components/verification/verification-checklist";
import { VerificationStrip } from "@/components/verification/verification-strip";
import { getArtisan } from "@/lib/api/artisans";
import { isMockMode } from "@/lib/api/client";
import { listLgas } from "@/lib/api/geo";
import { getSession } from "@/lib/api/session";
import type { ArtisanProfile } from "@/lib/types";
import { formatNaira } from "@/lib/utils/money";
import { deriveVerificationSignals, initialsOf, TRADE_LABEL } from "@/lib/utils/verification";

function checklistFor(artisan: ArtisanProfile): ChecklistItem[] {
  const v = artisan.verification;
  return [
    {
      key: "identity",
      label: "Identity",
      status: v.ninVerified ? "verified" : "pending_review",
      note: v.ninVerified ? "NIN matched to a live selfie" : "Usually a few minutes",
    },
    {
      key: "guarantor",
      label: "Guarantor",
      status: v.guarantorConfirmed ? "verified" : "pending_review",
      note: v.guarantorConfirmed ? `${v.guarantorName ?? "Guarantor"} confirmed by phone` : "We'll call them — usually within 2 days",
    },
    {
      key: "portfolio",
      label: "Job-site photos",
      status: v.portfolioPhotoCount >= v.portfolioMinRequired ? "verified" : "pending_review",
      note: `${v.portfolioPhotoCount} photos${v.apprenticeshipYears ? ` · ${v.apprenticeshipYears}-year apprenticeship` : ""}`,
    },
    {
      key: "address",
      label: "Base and service area",
      status: v.addressConfirmed && v.serviceAreaConfirmed ? "verified" : "pending_review",
      note: artisan.baseAddress,
    },
    {
      key: "probation",
      label: "First jobs",
      status: v.probationJobsRemaining > 0 ? "in_progress" : "verified",
      note:
        v.probationJobsRemaining > 0
          ? `${v.probationJobsRemaining} more before the "New" badge goes. We call each customer after.`
          : "Probation complete",
    },
  ];
}

async function ArtisanProfileScreen() {
  const session = await getSession();
  const artisanId = session.ok ? session.data.artisanId : null;
  const [artisanResult, lgasResult] = await Promise.all([
    artisanId ? getArtisan(artisanId) : Promise.resolve(null),
    listLgas(),
  ]);
  if (!artisanResult?.ok) return <p className="text-sm text-danger-600">Sign in as an artisan.</p>;
  const artisan = artisanResult.data;
  const lgas = new Map((lgasResult.ok ? lgasResult.data : []).map((lga) => [lga.code, lga.name]));
  const rate = artisan.rateCard;
  const rates = [
    { label: "Call-out fee", value: formatNaira(rate.callOutFee) },
    ...(rate.hourlyRate !== undefined ? [{ label: "Hourly", value: formatNaira(rate.hourlyRate) }] : []),
    { label: "Minimum charge", value: formatNaira(rate.minimumCharge) },
    {
      label: "Transport",
      value: rate.transportIncluded ? "Included" : rate.transportFeePerKm !== undefined ? `${formatNaira(rate.transportFeePerKm)} / km` : "Quoted",
    },
  ];

  return (
    <>
      <Card className="rounded-xl ring-line-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-ink-950 text-base font-semibold text-celo-500">
                {initialsOf(artisan.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-lg font-semibold tracking-tight text-ink-950">{artisan.displayName}</p>
              <p className="truncate text-sm text-ink-500">
                {TRADE_LABEL[artisan.trade]} · {artisan.yearsExperience} yrs
              </p>
            </div>
          </div>
          <VerificationStrip signals={deriveVerificationSignals(artisan)} className="mt-4" />
        </CardContent>
      </Card>

      <section className="mt-6" aria-labelledby="checks-heading">
        <SectionHeading id="checks-heading" title="Verification" />
        <VerificationChecklist items={checklistFor(artisan)} className="mt-3" />
      </section>

      <section className="mt-6" aria-labelledby="coverage-heading">
        <SectionHeading id="coverage-heading" title="Where you work" />
        <ul className="mt-3 flex flex-wrap gap-2">
          {[artisan.coverage.homeLgaCode, ...artisan.coverage.servedLgaCodes.filter((code) => code !== artisan.coverage.homeLgaCode)].map(
            (code, index) => (
              <li
                key={code}
                className="inline-flex items-center gap-1.5 rounded-pill bg-surface-raised px-3 py-1.5 text-sm text-ink-700 ring-1 ring-line-200"
              >
                <MapPin className="size-3.5 text-ink-400" aria-hidden />
                {lgas.get(code) ?? code}
                {index === 0 ? <span className="text-xs text-ink-400">· base</span> : null}
              </li>
            ),
          )}
        </ul>
      </section>

      <section className="mt-6" aria-labelledby="rates-heading">
        <SectionHeading id="rates-heading" title="Rate card" />
        <dl className="mt-3 divide-y divide-line-200 overflow-hidden rounded-2xl bg-surface-raised ring-1 ring-line-200">
          {rates.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
              <dt className="text-ink-500">{row.label}</dt>
              <dd className="font-medium text-ink-950" data-tabular>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-ink-500">
          ajudar&apos;s estimate opens every job. Your rate card is how far you&apos;ll usually counter on labour.
        </p>
      </section>

      <Card className="mt-6 gap-0 overflow-hidden rounded-xl ring-line-200">
        <CardContent className="p-0">
          {isMockMode() ? (
            <>
              <ProfileRow icon={ArrowLeftRight} label="Demo: switch to customer" href="/dashboard" />
              <Separator />
              <ProfileRow icon={ClipboardCheck} label="Demo: new artisan sign-up" href="/artisan/onboarding" />
              <Separator />
            </>
          ) : null}
          <ProfileRow icon={LogOut} label="Sign out" tone="danger" />
        </CardContent>
      </Card>
    </>
  );
}

export default function ArtisanProfilePage() {
  return (
    <>
      <StickyHeader title="Profile" subtitle="Verification, area, rates" />
      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface-sunken" />}>
          <ArtisanProfileScreen />
        </Suspense>
      </div>
    </>
  );
}
