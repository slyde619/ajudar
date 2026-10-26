import { KeyIcon } from "@phosphor-icons/react/ssr";
import type { Kobo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils/money";

interface CompletionCodeProps {
  code: string;
  amount: Kobo;
  artisanFirstName: string;
  ready: boolean;
}

/** Shows the customer the completion code they read out to release escrow. */
export function CompletionCode({ code, amount, artisanFirstName, ready }: CompletionCodeProps) {
  return (
    <section
      className={cn(
        "rounded-2xl p-5 ring-1 transition-colors",
        ready ? "bg-ink-950 text-surface-raised ring-ink-950" : "bg-surface-raised text-ink-950 ring-line-200",
      )}
      aria-labelledby="code-heading"
    >
      <p id="code-heading" className={cn("inline-flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase", ready ? "text-ink-300" : "text-ink-500")}>
        <KeyIcon className="size-3.5" aria-hidden />
        Completion code
      </p>
      <p className="mt-2 font-mono text-[34px] leading-none font-semibold tracking-[0.3em]" data-tabular aria-label={code.split("").join(" ")}>
        {code}
      </p>
      <p className={cn("mt-3 text-sm leading-relaxed", ready ? "text-ink-300" : "text-ink-500")}>
        {ready
          ? `Happy with the work? Read this to ${artisanFirstName}. It releases ${formatNaira(amount)} from escrow.`
          : `Keep this until the job is done. Giving it to ${artisanFirstName} releases ${formatNaira(amount)}.`}
      </p>
    </section>
  );
}
