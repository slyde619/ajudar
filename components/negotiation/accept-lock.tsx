"use client";

import { BuildingsIcon, CreditCardIcon, LockIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { fundEscrowAction } from "@/app/_actions/booking";
import { ActionButton } from "@/components/booking/action-button";
import type { EscrowMethod, Kobo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils/money";

const METHODS: { value: EscrowMethod; label: string; hint: string; icon: typeof CreditCardIcon }[] = [
  { value: "card", label: "Card", hint: "Visa, Mastercard, Verve", icon: CreditCardIcon },
  { value: "bank_transfer", label: "Bank transfer", hint: "Pay from any Nigerian bank app", icon: BuildingsIcon },
];

interface AcceptLockProps {
  jobId: string;
  total: Kobo;
  artisanFirstName: string;
}

/** Locked-price screen where the customer funds escrow. */
export function AcceptLock({ jobId, total, artisanFirstName }: AcceptLockProps) {
  const [method, setMethod] = useState<EscrowMethod>("card");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center pt-4 text-center">
        <span className="flex size-14 animate-in zoom-in-90 fade-in items-center justify-center rounded-full bg-ink-950 text-celo-500 duration-300 ease-out-quint">
          <LockIcon className="size-6" weight="bold" aria-hidden />
        </span>
        <p className="mt-4 font-mono text-[11px] tracking-widest text-ink-500 uppercase">Price locked</p>
        <p className="mt-1 text-[40px] leading-none font-semibold tracking-tight text-ink-950" data-tabular>
          {formatNaira(total)}
        </p>
        <p className="mt-3 max-w-72 text-sm leading-relaxed text-ink-500">
          It can&apos;t go up on arrival. {artisanFirstName} sets off once it&apos;s in escrow.
        </p>
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold text-ink-950">Pay into escrow with</legend>
        <div className="mt-3 flex flex-col gap-2" role="radiogroup">
          {METHODS.map(({ value, label, hint, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={method === value}
              onClick={() => setMethod(value)}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-surface-raised p-4 text-left ring-1 transition-shadow",
                method === value ? "ring-2 ring-ink-950" : "ring-line-200 hover:ring-line-300",
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-surface-sunken text-ink-700">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-950">{label}</span>
                <span className="block text-xs text-ink-500">{hint}</span>
              </span>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full ring-1",
                  method === value ? "bg-ink-950 ring-ink-950" : "ring-line-300",
                )}
                aria-hidden
              >
                {method === value ? <span className="size-2 rounded-full bg-celo-500" /> : null}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 rounded-xl bg-celo-100 p-4 text-sm leading-relaxed text-ink-950">
        Held by ajudar until you give {artisanFirstName} your completion code. If they don&apos;t show, you get it back.
      </div>

      <div className="mt-auto pt-8">
        <ActionButton action={() => fundEscrowAction(jobId, method)} pendingLabel="Opening secure checkout…">
          Continue to secure checkout
        </ActionButton>
      </div>
    </div>
  );
}
