import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepFooterProps {
  label: string;
  pendingLabel?: string;
  pending: boolean;
  disabled?: boolean;
  error: string | null;
  onSubmit: () => void;
  secondary?: React.ReactNode;
}

/** Thumb-zone submit bar for an onboarding step. */
export function StepFooter({ label, pendingLabel = "Saving…", pending, disabled, error, onSubmit, secondary }: StepFooterProps) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-auto bg-linear-to-t from-background from-70% to-transparent px-5 pt-6 pb-safe">
      <div className="flex flex-col gap-2 pb-4">
        {error ? (
          <p role="alert" className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
            {error}
          </p>
        ) : null}
        <Button size="cta" className="w-full" disabled={disabled || pending} onClick={onSubmit}>
          {pending ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden />
              {pendingLabel}
            </>
          ) : (
            label
          )}
        </Button>
        {secondary}
      </div>
    </div>
  );
}
