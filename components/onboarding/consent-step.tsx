"use client";

import { CheckIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import { StepHeading } from "./step-heading";
import { useStepSave } from "./use-step-save";

const TERMS = [
  ["What we keep", "Your name, phone, the last 4 digits of your NIN, your LGA, and your work photos. Smile ID holds the ID images, not us."],
  ["Who sees it", "Customers see your first name, photo, trade, LGA, and badges. Never your address, NIN, or guarantor."],
  ["Why", "To prove to customers you are who you say, and to pay you. Nothing is sold or used for ads."],
  ["Your rights", "Ask to see, fix, or delete your data at any time from Profile. Deleting closes your account."],
] as const;

/** Onboarding step for NDPA data-processing consent. */
export function ConsentStep({ version }: { version: string }) {
  const [agreed, setAgreed] = useState(false);
  const { save, error, pending } = useStepSave();

  return (
    <>
      <StepHeading title="Your data, plainly" detail="Under the Nigeria Data Protection Act. Read it — it's short." />
      <dl className="flex flex-col gap-4 rounded-2xl bg-surface-raised p-4 ring-1 ring-line-200">
        {TERMS.map(([term, detail]) => (
          <div key={term}>
            <dt className="text-sm font-semibold text-ink-950">{term}</dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-ink-700">{detail}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 font-mono text-[10px] tracking-widest text-ink-400 uppercase">Terms {version}</p>

      <button
        type="button"
        role="checkbox"
        aria-checked={agreed}
        onClick={() => setAgreed((value) => !value)}
        className="mt-5 flex items-start gap-3 text-left"
      >
        <span
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md ring-1 transition-colors",
            agreed ? "bg-ink-950 text-surface-raised ring-ink-950" : "bg-surface-raised ring-line-300",
          )}
        >
          {agreed ? <CheckIcon className="size-4" aria-hidden /> : null}
        </span>
        <span className="text-sm leading-relaxed text-ink-950">I agree to ajudar keeping and checking these details as described.</span>
      </button>

      <StepFooter
        label="Send my application"
        pendingLabel="Sending…"
        pending={pending}
        disabled={!agreed}
        error={error}
        onSubmit={() => save({ step: "consent", version })}
      />
    </>
  );
}
