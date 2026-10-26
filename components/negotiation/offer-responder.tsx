"use client";

import { Minus, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import type { ActionState } from "@/app/_actions/booking";
import { ActionButton } from "@/components/booking/action-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Kobo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils/money";

const STEP: Kobo = 50_000;

export interface CounterOptions {
  min: Kobo;
  max: Kobo;
  start: Kobo;
  hint: string;
  quickReasons: string[];
  placeholder: string;
  send: (total: Kobo, reason: string) => Promise<ActionState>;
}

interface OfferResponderProps {
  accept: { label: string; pendingLabel: string; action: () => Promise<ActionState> };
  counter?: CounterOptions;
  release?: { label: string; pendingLabel: string; action: () => Promise<ActionState> };
}

/** Accept, counter or walk-away controls for either side of a negotiation. */
export function OfferResponder({ accept, counter, release }: OfferResponderProps) {
  const counterable = counter !== undefined && counter.min <= counter.max;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(counter ? Math.min(Math.max(counter.start, counter.min), counter.max) : 0);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    if (!counter) return;
    setError(null);
    startTransition(async () => {
      const result = await counter.send(amount, reason);
      if (result) setError(result.error);
      else setOpen(false);
    });
  }

  if (open && counterable) {
    return (
      <div className="rounded-2xl bg-surface-raised p-4 shadow-pop ring-1 ring-line-200">
        <p className="text-sm font-semibold text-ink-950">Your counter</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon-lg"
            className="size-12 rounded-full"
            aria-label="Lower by ₦500"
            disabled={amount - STEP < counter.min}
            onClick={() => setAmount((value) => value - STEP)}
          >
            <Minus aria-hidden />
          </Button>
          <p className="text-3xl font-semibold tracking-tight text-ink-950" data-tabular aria-live="polite">
            {formatNaira(amount)}
          </p>
          <Button
            variant="outline"
            size="icon-lg"
            className="size-12 rounded-full"
            aria-label="Raise by ₦500"
            disabled={amount + STEP > counter.max}
            onClick={() => setAmount((value) => value + STEP)}
          >
            <Plus aria-hidden />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-ink-500" data-tabular>
          {counter.hint}
        </p>

        <label htmlFor="counter-reason" className="mt-4 block text-sm font-semibold text-ink-950">
          Why?
        </label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {counter.quickReasons.map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => setReason(quick)}
              aria-pressed={reason === quick}
              className={cn(
                "h-8 rounded-pill px-3 text-xs font-medium ring-1 transition-colors",
                reason === quick ? "bg-ink-950 text-surface-raised ring-ink-950" : "bg-surface-raised text-ink-700 ring-line-300",
              )}
            >
              {quick}
            </button>
          ))}
        </div>
        <Input
          id="counter-reason"
          value={reason}
          maxLength={200}
          onChange={(event) => setReason(event.target.value)}
          placeholder={counter.placeholder}
          className="mt-2 h-12 rounded-xl bg-surface-raised px-4"
        />
        {error ? (
          <p role="alert" className="mt-2 text-sm text-danger-600">
            {error}
          </p>
        ) : null}
        <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
          <Button variant="ghost" size="cta" onClick={() => setOpen(false)} disabled={pending}>
            Back
          </Button>
          <Button variant="secondary" size="cta" onClick={send} disabled={pending || reason.trim().length < 3}>
            {pending ? "Sending…" : `Send ${formatNaira(amount)}`}
          </Button>
        </div>
      </div>
    );
  }

  const secondary = [counterable, release !== undefined].filter(Boolean).length;
  return (
    <div className="flex flex-col gap-2">
      <ActionButton action={accept.action} pendingLabel={accept.pendingLabel}>
        {accept.label}
      </ActionButton>
      {secondary > 0 ? (
        <div className={cn("grid gap-2", secondary === 2 ? "grid-cols-2" : "grid-cols-1")}>
          {counterable ? (
            <Button variant="outline" size="cta" className="bg-surface-raised text-[15px]" onClick={() => setOpen(true)}>
              Counter
            </Button>
          ) : null}
          {release ? (
            <ActionButton action={release.action} variant="ghost" className="text-[15px]" pendingLabel={release.pendingLabel}>
              {release.label}
            </ActionButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
