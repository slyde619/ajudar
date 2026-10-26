"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import type { ActionState } from "@/app/_actions/booking";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

interface ActionButtonProps {
  action: () => Promise<ActionState>;
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  disabled?: boolean;
  className?: string;
}

/** Runs a bound Server Action with a pending state and an inline error. */
export function ActionButton({
  action,
  children,
  pendingLabel,
  variant,
  size = "cta",
  disabled,
  className,
}: ActionButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled || pending}
        className="w-full"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await action();
            if (result) setError(result.error);
          });
        }}
      >
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden />
            {pendingLabel ?? children}
          </>
        ) : (
          children
        )}
      </Button>
      {error ? (
        <p role="alert" className="text-center text-sm text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
