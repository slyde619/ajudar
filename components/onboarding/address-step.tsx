"use client";

import { CheckIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { LgaPicker } from "@/components/location/lga-picker";
import { Textarea } from "@/components/ui/textarea";
import { MAX_SERVED_LGAS, addressStepSchema } from "@/lib/schemas/onboarding";
import type { ArtisanApplication, Lga, LgaCode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import { StepHeading } from "./step-heading";
import { useStepSave } from "./use-step-save";


/** Onboarding step for the artisan's base and the LGAs they serve. */
export function AddressStep({ application, lgas }: { application: ArtisanApplication; lgas: Lga[] }) {
  const [baseAddress, setBaseAddress] = useState(application.address.baseAddress ?? "");
  const [home, setHome] = useState<LgaCode | null>(application.address.homeLgaCode ?? null);
  const [served, setServed] = useState<LgaCode[]>(application.address.servedLgaCodes);
  const { save, error, pending } = useStepSave();

  const homeLga = lgas.find((lga) => lga.code === home);
  const nearby = homeLga ? lgas.filter((lga) => lga.stateCode === homeLga.stateCode && lga.code !== home) : [];
  const chosen = served.filter((code) => code !== home);
  const full = chosen.length + 1 >= MAX_SERVED_LGAS;

  function toggle(code: LgaCode) {
    setServed((current) => (current.includes(code) ? current.filter((entry) => entry !== code) : [...current, code]));
  }

  return (
    <>
      <StepHeading title="Where are you based?" detail="We confirm it on a short call. Customers only ever see your LGA." />

      <label htmlFor="base" className="text-sm font-semibold text-ink-950">
        Your workshop or home
      </label>
      <Textarea
        id="base"
        value={baseAddress}
        onChange={(event) => setBaseAddress(event.target.value)}
        placeholder="12 Ikwerre Road, by the GTBank, Rumuokoro"
        rows={2}
        className="mt-2 rounded-xl bg-surface-raised px-4 py-3"
      />

      <p className="mt-6 mb-2 text-sm font-semibold text-ink-950">Your home LGA</p>
      <LgaPicker lgas={lgas} value={home} onChange={setHome} />

      {homeLga ? (
        <>
          <p className="mt-6 text-sm font-semibold text-ink-950">Where else will you go?</p>
          <p className="mt-1 text-xs text-ink-500" data-tabular>
            Up to {MAX_SERVED_LGAS - 1} more, close enough to reach within an hour. {chosen.length} picked.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {nearby.map((lga) => {
              const on = chosen.includes(lga.code);
              return (
                <button
                  key={lga.code}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && full}
                  onClick={() => toggle(lga.code)}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-pill px-3.5 text-sm font-medium ring-1 transition-colors disabled:opacity-40",
                    on ? "bg-ink-950 text-surface-raised ring-ink-950" : "bg-surface-raised text-ink-700 ring-line-300",
                  )}
                >
                  {on ? <CheckIcon className="size-3.5" aria-hidden /> : null}
                  {lga.name}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <StepFooter
        label="Continue"
        pending={pending}
        disabled={!home || !addressStepSchema.safeParse({ step: "address", baseAddress, homeLgaCode: home, servedLgaCodes: chosen }).success}
        error={error}
        onSubmit={() => home && save({ step: "address", baseAddress, homeLgaCode: home, servedLgaCodes: chosen })}
      />
    </>
  );
}
