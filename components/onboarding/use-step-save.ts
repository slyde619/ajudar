"use client";

import { useState, useTransition } from "react";
import { saveStepAction } from "@/app/_actions/onboarding";
import type { ApplicationStepInput } from "@/lib/types";

/** Saves an onboarding step and keeps the error if it fails. */
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
      const result = await saveStepAction(resolved);
      if (result) setError(result.error);
    });
  }

  return { save, error, setError, pending };
}
