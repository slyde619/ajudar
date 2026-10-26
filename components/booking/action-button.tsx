"use client";

import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import { useTransition } from "react";
import { toast } from "sonner";
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

/** Runs a bound Server Action with a pending state, toasting any failure. */
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

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled || pending}
        className="w-full"
        onClick={() => {
          startTransition(async () => {
            const result = await action();
            if (result) toast.error(result.error);
          });
        }}
      >
        {pending ? (
          <>
            <CircleNotchIcon className="animate-spin" aria-hidden />
            {pendingLabel ?? children}
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
