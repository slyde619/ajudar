import { Suspense } from "react";
import { StickyHeader } from "@/components/shell/sticky-header";
import { EarningsSummary } from "@/components/supply/earnings-summary";
import { getSession } from "@/lib/api/session";
import { getEarnings } from "@/lib/api/supply";

async function Earnings() {
  const session = await getSession();
  const artisanId = session.ok ? session.data.artisanId : null;
  const result = artisanId ? await getEarnings(artisanId) : null;
  if (!result?.ok) return <p className="text-sm text-danger-600">{result ? result.error.message : "Sign in as an artisan."}</p>;
  return <EarningsSummary earnings={result.data} />;
}

export default function ArtisanEarningsPage() {
  return (
    <>
      <StickyHeader title="Earnings" subtitle="Escrow, released, paid out" />
      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-surface-sunken" />}>
          <Earnings />
        </Suspense>
      </div>
    </>
  );
}
