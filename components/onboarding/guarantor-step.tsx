"use client";

import { PhoneIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { guarantorStepSchema } from "@/lib/schemas/onboarding";
import type { ArtisanApplication } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import { StepHeading } from "./step-heading";
import { useStepSave } from "./use-step-save";

const RELATIONSHIPS = ["Former oga", "Family", "Church or mosque leader", "Community leader", "Customer"];

/** Onboarding step for naming a guarantor we call to confirm. */
export function GuarantorStep({ application }: { application: ArtisanApplication }) {
  const [name, setName] = useState(application.guarantor.name ?? "");
  const [phone, setPhone] = useState(application.guarantor.phone ?? "");
  const [relationship, setRelationship] = useState(application.guarantor.relationship ?? "");
  const { save, error, pending } = useStepSave();

  return (
    <>
      <StepHeading
        title="Who vouches for you?"
        detail="Someone who knows your work and will pick up when we call. We ask them two questions and never share their number."
      />

      <label htmlFor="g-name" className="text-sm font-semibold text-ink-950">
        Their full name
      </label>
      <Input
        id="g-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Uche Okafor"
        className="mt-2 h-12 rounded-xl bg-surface-raised px-4"
      />

      <label htmlFor="g-phone" className="mt-5 text-sm font-semibold text-ink-950">
        Their phone number
      </label>
      <Input
        id="g-phone"
        type="tel"
        value={phone}
        inputMode="tel"
        autoComplete="off"
        onChange={(event) => setPhone(event.target.value.replace(/[^\d+ ]/g, "").slice(0, 16))}
        placeholder="0803 123 4567"
        className="mt-2 h-12 rounded-xl bg-surface-raised px-4 font-mono"
      />

      <p id="g-rel" className="mt-5 text-sm font-semibold text-ink-950">
        How do you know them?
      </p>
      <div role="radiogroup" aria-labelledby="g-rel" className="mt-2 flex flex-wrap gap-1.5">
        {RELATIONSHIPS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={relationship === value}
            onClick={() => setRelationship(value)}
            className={cn(
              "h-10 rounded-pill px-3.5 text-sm font-medium ring-1 transition-colors",
              relationship === value ? "bg-ink-950 text-surface-raised ring-ink-950" : "bg-surface-raised text-ink-700 ring-line-300",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3 rounded-xl bg-surface-sunken p-4">
        <PhoneIcon className="mt-0.5 size-5 shrink-0 text-ink-700" aria-hidden />
        <p className="text-sm leading-relaxed text-ink-700">
          Tell them to expect a call from ajudar. Most guarantors are confirmed within 2 days.
        </p>
      </div>

      <StepFooter
        label="Continue"
        pending={pending}
        disabled={!guarantorStepSchema.safeParse({ step: "guarantor", name, phone, relationship }).success}
        error={error}
        onSubmit={() => save({ step: "guarantor", name, phone, relationship })}
      />
    </>
  );
}
