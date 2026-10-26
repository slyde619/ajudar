import { Suspense } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { LocationGate } from "@/components/location/location-gate";
import { listLgas } from "@/lib/api/geo";

function safeNext(value: string | string[] | undefined): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const lgasResult = await listLgas();
  const lgas = lgasResult.ok ? lgasResult.data : [];

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pt-safe pb-safe">
      <header className="flex items-center justify-between py-5">
        <BrandMark />
        <span className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
          Step 2 of 2
        </span>
      </header>

      <div className="flex flex-1 flex-col pt-4 pb-6">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-surface-sunken" />}>
          {searchParams.then(({ next }) => (
            <LocationGate lgas={lgas} continueHref={safeNext(next)} />
          ))}
        </Suspense>
      </div>
    </main>
  );
}
