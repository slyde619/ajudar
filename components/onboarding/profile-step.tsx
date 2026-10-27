"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { profileStepSchema } from "@/lib/schemas/onboarding";
import type { ArtisanApplication, Trade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TRADE_LABEL } from "@/lib/utils/verification";
import { StepFooter } from "./step-footer";
import { StepHeading } from "./step-heading";
import { useStepSave } from "./use-step-save";

const TRADES = Object.entries(TRADE_LABEL) as [Trade, string][];

/** Onboarding step for the artisan's name and trade. */
export function ProfileStep({ application }: { application: ArtisanApplication }) {
  const [name, setName] = useState(application.profile.displayName);
  const [trade, setTrade] = useState<Trade | undefined>(application.profile.trade);
  const [years, setYears] = useState(application.profile.yearsExperience?.toString() ?? "");
  const [specialties, setSpecialties] = useState(application.profile.specialties.join(", "));
  const { save, error, pending } = useStepSave();

  const ready = profileStepSchema.safeParse({
    step: "profile",
    displayName: name,
    trade,
    yearsExperience: years === "" ? undefined : Number(years),
    specialties: specialties.split(","),
  }).success;

  return (
    <>
      <StepHeading title="What do you do?" detail="Use your name exactly as it is on your NIN. We check it in the next step." />

      <label htmlFor="full-name" className="text-sm font-semibold text-ink-950">
        Full name
      </label>
      <Input
        id="full-name"
        value={name}
        autoComplete="name"
        onChange={(event) => setName(event.target.value)}
        placeholder="Chinedu Okafor"
        className="mt-2 h-12 rounded-xl bg-surface-raised px-4"
      />

      <p id="trade-label" className="mt-5 text-sm font-semibold text-ink-950">
        Your trade
      </p>
      <div role="radiogroup" aria-labelledby="trade-label" className="mt-2 flex flex-wrap gap-1.5">
        {TRADES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={trade === value}
            onClick={() => setTrade(value)}
            className={cn(
              "h-10 rounded-pill px-3.5 text-sm font-medium ring-1 transition-transform duration-100 ease-out active:scale-[0.97] disabled:active:scale-100",
              trade === value ? "bg-ink-950 text-surface-raised ring-ink-950" : "bg-surface-raised text-ink-700 ring-line-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <label htmlFor="years" className="mt-5 text-sm font-semibold text-ink-950">
        Years doing this work
      </label>
      <Input
        id="years"
        value={years}
        inputMode="numeric"
        onChange={(event) => setYears(event.target.value.replace(/\D/g, "").slice(0, 2))}
        placeholder="6"
        className="mt-2 h-12 w-28 rounded-xl bg-surface-raised px-4"
      />

      <label htmlFor="specialties" className="mt-5 text-sm font-semibold text-ink-950">
        What you&apos;re best at <span className="font-normal text-ink-400">· optional</span>
      </label>
      <Input
        id="specialties"
        value={specialties}
        onChange={(event) => setSpecialties(event.target.value)}
        placeholder="Burst pipes, water heaters"
        className="mt-2 h-12 rounded-xl bg-surface-raised px-4"
      />
      <p className="mt-1.5 text-xs text-ink-500">Separate with commas. Customers see these on your profile.</p>

      <StepFooter
        label="Continue"
        pending={pending}
        disabled={!ready}
        error={error}
        onSubmit={() =>
          trade &&
          save({
            step: "profile",
            displayName: name,
            trade,
            yearsExperience: Number(years),
            specialties: specialties.split(","),
          })
        }
      />
    </>
  );
}
