"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveStepAction } from "@/app/_actions/onboarding";
import { applicationStepInputSchema } from "@/lib/schemas/onboarding";
import { parseInput } from "@/lib/schemas/primitives";
import type { ApplicationStepInput } from "@/lib/types";

/** Saves an onboarding step, keeping validation errors inline and toasting save failures. */
export function useStepSave() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(input: ApplicationStepInput | (() => Promise<ApplicationStepInput | string>)) {
    setError(null);
    startTransition(async () => {
      const resolved = typeof input === "function" ? await input() : input;
      if (typeof resolved === "string") {
        setError(resolved);
        return;
      }
      const parsed = parseInput(applicationStepInputSchema, resolved);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      const result = await saveStepAction(resolved);
      if (result) toast.error(result.error);
    });
  }

  return { save, error, setError, pending };
}
