"use client";

import { useTransition } from "react";
import { resetApplicationAction } from "@/app/_actions/onboarding";
import { Button } from "@/components/ui/button";

/** Demo-only button that resets the mock application to step one. */
export function StartOverButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(async () => void (await resetApplicationAction()))}
    >
      Demo: start the application over
    </Button>
  );
}
