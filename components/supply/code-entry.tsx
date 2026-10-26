"use client";

import { KeyIcon, CircleNotchIcon } from "@phosphor-icons/react/ssr";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { enterCompletionCodeAction } from "@/app/_actions/supply";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completionCodeSchema } from "@/lib/schemas/booking";
import type { Kobo } from "@/lib/types";
import { formatNaira } from "@/lib/utils/money";

interface CodeEntryProps {
  jobId: string;
  amount: Kobo;
  demoCode?: string | null;
}

/** Field where the artisan types the customer's code to release escrow. */
export function CodeEntry({ jobId, amount, demoCode }: CodeEntryProps) {
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await enterCompletionCodeAction(jobId, code);
      if (result) toast.error(result.error);
    });
  }

  return (
    <section className="rounded-2xl bg-ink-950 p-5 text-surface-raised" aria-labelledby="code-heading">
      <p id="code-heading" className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-ink-300 uppercase">
        <KeyIcon className="size-3.5" aria-hidden />
        Customer&apos;s code
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-300">
        Ask them to read it out once they&apos;ve checked the work. It releases{" "}
        <span className="font-semibold text-surface-raised" data-tabular>
          {formatNaira(amount)}
        </span>{" "}
        to you.
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label htmlFor="completion-code" className="sr-only">
          6-digit code
        </label>
        <Input
          id="completion-code"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          className="h-12 flex-1 rounded-xl border-0 bg-surface-raised px-4 text-center font-mono text-xl tracking-[0.4em] text-ink-950"
        />
        <Button type="submit" size="cta" className="w-auto px-5" disabled={!completionCodeSchema.safeParse(code).success || pending}>
          {pending ? <CircleNotchIcon className="animate-spin" aria-label="Checking" /> : "Release"}
        </Button>
      </form>
      {demoCode ? (
        <p className="mt-3 rounded-lg border border-dashed border-ink-700 px-3 py-2 font-mono text-[11px] text-ink-300">
          Demo only · the customer reads out <span className="tracking-widest text-surface-raised">{demoCode}</span>
        </p>
      ) : null}
    </section>
  );
}
