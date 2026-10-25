import { BrandMark } from "@/components/brand/brand-mark";
import { LocationGate } from "@/components/location/location-gate";
import { listLgas } from "@/lib/api/geo";

export default async function OnboardingPage() {
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
        <LocationGate lgas={lgas} continueHref="/dashboard" />
      </div>
    </main>
  );
}
