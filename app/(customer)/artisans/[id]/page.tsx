import { Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArtisanSummary } from "@/components/negotiation/artisan-summary";
import { StickyHeader } from "@/components/shell/sticky-header";
import { getArtisan, listArtisanReviews } from "@/lib/api/artisans";
import { listLgas } from "@/lib/api/geo";
import { formatNaira } from "@/lib/utils/money";
import { formatShortDate } from "@/lib/utils/time";
import { TRADE_LABEL } from "@/lib/utils/verification";

function responseTime(seconds: number): string {
  if (seconds <= 0) return "—";
  return seconds < 90 ? `${seconds}s` : `${Math.round(seconds / 60)} min`;
}

async function ArtisanScreen({ id }: { id: string }) {
  const [artisanResult, reviewsResult, lgasResult] = await Promise.all([
    getArtisan(id),
    listArtisanReviews(id),
    listLgas(),
  ]);
  if (!artisanResult.ok || artisanResult.data.suspended) notFound();
  const artisan = artisanResult.data;
  const reviews = reviewsResult.ok ? reviewsResult.data : [];
  const lgaNames = new Map((lgasResult.ok ? lgasResult.data : []).map((lga) => [lga.code, lga.name]));
  const { stats, rateCard } = artisan;

  const facts = [
    { label: "Jobs done", value: String(stats.jobsCompleted) },
    { label: "Completion", value: stats.jobsCompleted ? `${Math.round(stats.completionRate * 100)}%` : "—" },
    { label: "Replies in", value: responseTime(stats.medianResponseSeconds) },
    {
      label: "Rating trend",
      value: stats.ratingCount ? `${stats.ratingTrend >= 0 ? "+" : "−"}${Math.abs(stats.ratingTrend).toFixed(1)}` : "—",
    },
  ];
  const rates = [
    { label: "Call-out", value: rateCard.callOutFee },
    { label: "Per hour", value: rateCard.hourlyRate },
    { label: "Minimum job", value: rateCard.minimumCharge },
    { label: "Transport per km", value: rateCard.transportIncluded ? undefined : rateCard.transportFeePerKm },
  ].filter((rate) => rate.value !== undefined);

  return (
    <>
      <StickyHeader title={artisan.displayName} subtitle={TRADE_LABEL[artisan.trade]} back />
      <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
        <ArtisanSummary artisan={artisan} size="lg" />
        {artisan.bio ? <p className="mt-4 text-[15px] leading-relaxed text-ink-700">{artisan.bio}</p> : null}
        {artisan.specialties.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Specialties">
            {artisan.specialties.map((specialty) => (
              <li key={specialty} className="rounded-pill bg-surface-sunken px-3 py-1.5 text-xs font-medium text-ink-700">
                {specialty}
              </li>
            ))}
          </ul>
        ) : null}

        <dl className="mt-6 grid grid-cols-4 divide-x divide-line-200 rounded-2xl bg-surface-raised py-3 shadow-card ring-1 ring-line-200">
          {facts.map((fact) => (
            <div key={fact.label} className="px-2 text-center">
              <dt className="text-[10px] leading-tight text-ink-500">{fact.label}</dt>
              <dd className="mt-1 text-[15px] font-semibold text-ink-950" data-tabular>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="mt-8" aria-labelledby="work-heading">
          <h2 id="work-heading" className="text-sm font-semibold text-ink-950">
            Recent work
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {artisan.portfolio.map((item) => (
              <li key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-sunken">
                <Image src={item.imageUrl} alt={item.caption ?? "Job-site photo"} fill sizes="(max-width: 512px) 50vw, 256px" className="object-cover" />
                {item.verified ? (
                  <span className="absolute bottom-1.5 left-1.5 rounded-pill bg-ink-950/75 px-2 py-0.5 font-mono text-[10px] text-surface-raised">
                    Verified site photo
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8" aria-labelledby="rates-heading">
          <h2 id="rates-heading" className="text-sm font-semibold text-ink-950">
            Rate card
          </h2>
          <p className="mt-1 text-xs text-ink-500">Their listed baseline. Job estimates move within a fair band; this doesn&apos;t.</p>
          <dl className="mt-3 divide-y divide-line-200 rounded-2xl bg-surface-raised px-4 shadow-card ring-1 ring-line-200">
            {rates.map((rate) => (
              <div key={rate.label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-ink-700">{rate.label}</dt>
                <dd className="font-semibold text-ink-950" data-tabular>
                  {formatNaira(rate.value as number)}
                </dd>
              </div>
            ))}
            {rateCard.transportIncluded ? (
              <div className="py-3 text-sm text-ink-500">Transport included in the call-out.</div>
            ) : null}
          </dl>
        </section>

        <section className="mt-8" aria-labelledby="area-heading">
          <h2 id="area-heading" className="text-sm font-semibold text-ink-950">
            Serves
          </h2>
          <p className="mt-2 text-sm text-ink-700">
            {artisan.coverage.servedLgaCodes.map((code) => lgaNames.get(code) ?? code).join(" · ")}
          </p>
        </section>

        <section className="mt-8" aria-labelledby="reviews-heading">
          <div className="flex items-baseline justify-between">
            <h2 id="reviews-heading" className="text-sm font-semibold text-ink-950">
              Reviews
            </h2>
            {stats.ratingCount > 0 ? (
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-ink-950" data-tabular>
                <Star className="size-3.5 fill-ink-950" strokeWidth={0} aria-hidden />
                {stats.averageRating.toFixed(1)}
                <span className="font-normal text-ink-500">· {stats.ratingCount} ratings</span>
              </p>
            ) : null}
          </div>
          {reviews.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-xl bg-surface-raised p-4 ring-1 ring-line-200">
                  <p className="text-sm font-semibold text-ink-950" data-tabular>
                    {review.rating}/5 · <span className="font-normal text-ink-500">{formatShortDate(review.createdAt)}</span>
                  </p>
                  {review.tags.length > 0 ? <p className="mt-1 text-xs text-ink-500">{review.tags.join(" · ")}</p> : null}
                  {review.comment ? <p className="mt-2 text-sm leading-relaxed text-ink-700">{review.comment}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink-500">No written reviews yet.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default function ArtisanPage({ params }: PageProps<"/artisans/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      {params.then(({ id }) => (
        <ArtisanScreen id={id} />
      ))}
    </Suspense>
  );
}
